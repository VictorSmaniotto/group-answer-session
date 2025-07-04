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
  console.log('DEBUG arraysEqual:', { a, b });
  if (a.length !== b.length) {
    console.log('DEBUG: Different lengths', a.length, 'vs', b.length);
    return false;
  }
  const normalize = (arr: string[]) => arr.map(normalizeAnswer).sort();
  const sortedA = normalize(a);
  const sortedB = normalize(b);
  console.log('DEBUG: After normalization:', { sortedA, sortedB });
  const result = sortedA.every((v, i) => v === sortedB[i]);
  console.log('DEBUG: Final result:', result);
  return result;
}
