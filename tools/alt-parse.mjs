/* alt-parse.mjs — read the alt texts out of an image-brief.md.
 * A line counts as an alt line when it names a slot (preview | hero) and either says "alt" itself or
 * sits under the field that announced the alt texts ("10. Locales + alt text per locale", "## Alt text (EN)").
 * The value is what follows the colon / opening quote, or the next non-empty lines; a quoted value runs
 * until its closing quote. Language: a code before the slot, in a parenthesis, or from the heading, else "en".
 * Returns { en: {preview, hero}, ru: {…} }.
 */
import { readFileSync, existsSync } from 'node:fs';

const KNOWN = new Set(['en', 'ru', 'de', 'es', 'fr', 'vi', 'ar', 'uk', 'pl', 'tl', 'ms', 'ro', 'th', 'tr', 'ja', 'ko', 'pt-br', 'zh-hans']);
const QUOTE_OPEN = /[`"“«]/;
const QUOTE_CLOSE = /[`"”»]/;
const CTX_WINDOW = 10;

const clean = (s) => s
  .replace(/^[\s>*_#-]+/, '')
  .replace(/[\s*_`"”»]+$/, '')
  .replace(/^[`"“«]/, '')
  .replace(/\s+/g, ' ')
  .trim();

function langOf(text, fallback) {
  const m = text.toLowerCase().match(/\b(en|ru|de|es|fr|vi|ar|uk|pl|tl|ms|ro|th|tr|ja|ko|pt-br|zh-hans)\b/);
  return m && KNOWN.has(m[1]) ? m[1] : fallback;
}

export function altsFromBrief(path) {
  const alts = {};
  if (!existsSync(path)) return alts;
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  let headingLang = 'en';
  let altCtx = -CTX_WINDOW - 1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/\balt\b/i.test(line)) {
      altCtx = i;
      const hm = line.match(/\balt[^\n]*\(([a-z-]{2,7})\)/i);
      if (hm) headingLang = langOf(hm[1], headingLang);
    }
    const slotM = line.match(/\b(preview|hero)\b/i);
    if (!slotM) continue;
    const head = line.slice(0, slotM.index + slotM[0].length + 40);
    const inAltField = /\balt\b/i.test(head) || i - altCtx <= CTX_WINDOW;
    if (!inAltField) continue;                       // "5. Preview mood" is not an alt
    const slot = slotM[1].toLowerCase();
    const lang = langOf(line.slice(0, slotM.index), headingLang);

    let rest = '';
    const afterSlot = line.slice(slotM.index + slotM[0].length);
    const colon = afterSlot.lastIndexOf(':');
    if (colon >= 0) rest = afterSlot.slice(colon + 1);
    else if (QUOTE_OPEN.test(afterSlot)) rest = afterSlot.slice(afterSlot.search(QUOTE_OPEN));
    else if (clean(afterSlot).length >= 15) rest = afterSlot;

    const opened = QUOTE_OPEN.test(rest.trimStart().slice(0, 1));
    let j = i;
    // keep pulling lines while the value is too short, or a quote was opened and has not closed yet
    while (j + 1 < lines.length && j - i < 4 &&
      (clean(rest).length < 15 || (opened && !QUOTE_CLOSE.test(rest.trimStart().slice(1))))) {
      j++; rest += ' ' + lines[j];
    }

    let text = rest;
    if (opened) {
      const tail = text.trimStart().slice(1);
      const end = tail.search(QUOTE_CLOSE);
      text = end >= 0 ? tail.slice(0, end) : tail;
    }
    text = clean(text)
      .replace(/[`"”»]\s*\(.*$/, '')          // "…" (95 chars) → cut at the closing quote
      .replace(/\s*\(\d+\s*chars?\)\s*$/i, '')
      .replace(/[`"”»]\s*$/, '')
      .trim();
    if (text.length < 15 || /^\d+\./.test(text) || /^#/.test(text)) continue;
    (alts[lang] ||= {})[slot] ||= text;
    i = j;
  }
  return alts;
}
