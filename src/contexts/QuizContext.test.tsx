import { describe, it, expect } from 'vitest';
import { generateRoomId } from './QuizContext';

describe('generateRoomId', () => {
  it('returns a 6 character string', () => {
    const id = generateRoomId();
    expect(typeof id).toBe('string');
    expect(id).toHaveLength(6);
  });
});
