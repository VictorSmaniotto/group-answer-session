// Utility functions for comparing quiz answers

// Normalize a string: trim, lowercase, remove diacritics
export function normalizeAnswer(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

// Compare two arrays of answers ignoring order, case and accents
export function arraysEqual(a: string[] = [], b: string[] = []): boolean {
  if (a.length !== b.length) return false;
  const normalize = (arr: string[]) => arr.map(normalizeAnswer).sort();
  const sortedA = normalize(a);
  const sortedB = normalize(b);
  return sortedA.every((v, i) => v === sortedB[i]);
}
