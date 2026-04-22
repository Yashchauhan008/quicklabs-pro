/** Counts “words” as runs of non-whitespace (line breaks are whitespace). */
export const BIO_MAX_WORDS = 100;

export function countWords(text: string): number {
  const m = text.trim().match(/\S+/g);
  return m ? m.length : 0;
}

/**
 * Keeps the first `max` words, preserving line breaks and spacing.
 */
export function truncateToMaxWords(input: string, max: number): string {
  if (max <= 0) return '';
  if (countWords(input) <= max) return input;
  const tokens = input.split(/(\s+)/);
  let wordIndex = 0;
  const out: string[] = [];
  for (const t of tokens) {
    if (t === undefined) break;
    if (/^\S+$/.test(t)) {
      if (wordIndex >= max) break;
      wordIndex += 1;
    }
    if (wordIndex <= max) out.push(t);
  }
  return out.join('').replace(/\s+$/g, '');
}
