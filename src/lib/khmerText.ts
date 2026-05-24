const KHMER_LETTER_START = 0x1780;
const KHMER_MARK_START = 0x17b6;
const KHMER_MARK_END = 0x17d3;
const KHMER_EXTRA_MARKS = new Set([0x17dd, 0x200c, 0x200d]);
const KHMER_COENG = '\u17d2';

function getGraphemeSegmenter() {
  if (typeof Intl === 'undefined' || !('Segmenter' in Intl)) return null;
  return new Intl.Segmenter('km', { granularity: 'grapheme' });
}

export function normalizeKhmerText(value: string) {
  return value.normalize('NFC');
}

function isKhmerCombiningMark(character: string) {
  const codePoint = character.codePointAt(0);
  if (codePoint === undefined) return false;
  return (codePoint >= KHMER_MARK_START && codePoint <= KHMER_MARK_END) || KHMER_EXTRA_MARKS.has(codePoint);
}

function shouldAttachToPrevious(previous: string | undefined, current: string) {
  if (!previous) return false;
  if (isKhmerCombiningMark(current)) return true;
  return previous.endsWith(KHMER_COENG);
}

export function splitKhmerGraphemes(value: string) {
  const normalized = normalizeKhmerText(value);
  const segmenter = getGraphemeSegmenter();

  if (segmenter) {
    return Array.from(segmenter.segment(normalized), (segment) => segment.segment);
  }

  const graphemes: string[] = [];

  for (const character of Array.from(normalized)) {
    const previous = graphemes.at(-1);
    if (shouldAttachToPrevious(previous, character)) {
      graphemes[graphemes.length - 1] = `${previous}${character}`;
    } else {
      graphemes.push(character);
    }
  }

  return graphemes;
}

export function khmerTextEquals(left: string, right: string) {
  return normalizeKhmerText(left) === normalizeKhmerText(right);
}

export function countKhmerCharacters(value: string) {
  return splitKhmerGraphemes(value).filter((segment) => {
    const codePoint = segment.codePointAt(0);
    return codePoint !== undefined && codePoint >= KHMER_LETTER_START && codePoint <= KHMER_MARK_END;
  }).length;
}

export function countKhmerWords(value: string) {
  return normalizeKhmerText(value)
    .trim()
    .split(/[\s\u200b]+/u)
    .filter(Boolean).length;
}
