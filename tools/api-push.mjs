#!/usr/bin/env node
/* api-push.mjs — push the working tree to GitHub through the Git Data API.
 * Why it exists: on this machine the git HTTPS *write* transport hangs (reads and the REST API work),
 * and organizacia HARD_RULES §0j names the GitHub API as the door that stays open when git push does not.
 * It creates one commit on top of origin/main whose tree is HEAD's tree, then moves the branch.
 * Usage: GH_TOKEN=$(gh auth token) node tools/api-push.mjs "<commit message>"
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const REPO = process.env.GH_REPO || 'dasexperten/microbiomefreindly.me';
const BRANCH = process.env.GH_BRANCH || 'main';
const TOKEN = process.env.GH_TOKEN;
const MESSAGE = process.argv[2] || 'update';
if (!TOKEN) { console.error('GH_TOKEN missing'); process.exit(2); }

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 28 }).trim();
const api = async (path, init = {}) => {
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const r = await fetch(`https://api.github.com/${path}`, {
        ...init,
        headers: { authorization: `Bearer ${TOKEN}`, accept: 'application/vnd.github+json', 'content-type': 'application/json', 'user-agent': 'mbf-api-push', ...(init.headers || {}) },
      });
      if (r.status >= 500 || r.status === 429 || r.status === 400) throw new Error(`HTTP ${r.status}`);  // 400 here is a transient proxy hiccup, retry
      const body = await r.json();
      if (!r.ok) throw Object.assign(new Error(`HTTP ${r.status}: ${JSON.stringify(body).slice(0, 200)}`), { fatal: r.status < 500 });
      return body;
    } catch (e) {
      if (e.fatal || attempt === 5) throw e;
      await new Promise((res) => setTimeout(res, 800 * (attempt + 1)));
    }
  }
};

const base = git('rev-parse', `origin/${BRANCH}`);
const head = git('rev-parse', 'HEAD');
const changed = git('diff', '--name-status', `${base}..${head}`).split('\n').filter(Boolean)
  .map((l) => { const [st, ...rest] = l.split('\t'); return { st: st[0], path: rest[rest.length - 1] }; });
console.log(`base ${base.slice(0, 7)} → head ${head.slice(0, 7)} · ${changed.length} paths`);

const entries = [];
let done = 0;
const queue = [...changed];
async function worker() {
  while (queue.length) {
    const c = queue.shift();
    if (c.st === 'D') { entries.push({ path: c.path, mode: '100644', type: 'blob', sha: null }); done++; continue; }
    let buf; try { buf = readFileSync(c.path); } catch { console.log('  skip (gone)', c.path); done++; continue; }
    let blob; try { blob = await api(`repos/${REPO}/git/blobs`, { method: 'POST', body: JSON.stringify({ content: buf.toString('base64'), encoding: 'base64' }) }); } catch (e) { console.log('  BLOB FAIL', c.path, buf.length, String(e.message).slice(0, 90)); throw e; }
    const mode = git('ls-files', '-s', c.path).split(/\s+/)[0] || '100644';
    entries.push({ path: c.path, mode, type: 'blob', sha: blob.sha });
    if (++done % 25 === 0) console.log(`  blobs ${done}/${changed.length}`);
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
console.log(`blobs done: ${entries.length}`);

const baseCommit = await api(`repos/${REPO}/git/commits/${base}`);
const tree = await api(`repos/${REPO}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree: entries }) });
const commit = await api(`repos/${REPO}/git/commits`, { method: 'POST', body: JSON.stringify({ message: MESSAGE, tree: tree.sha, parents: [base] }) });
await api(`repos/${REPO}/git/refs/heads/${BRANCH}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) });
console.log(`pushed ${commit.sha.slice(0, 7)} to ${REPO}@${BRANCH}`);
console.log(commit.sha);
