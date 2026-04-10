import { describe, expect, it } from 'vitest';
import { normalizeLocalhostForAndroid } from './network';

describe('normalizeLocalhostForAndroid', () => {
  it('troca localhost no Android', () => {
    const normalized = normalizeLocalhostForAndroid('http://localhost:3000', 'android');
    expect(normalized).toBe('http://10.0.2.2:3000');
  });

  it('mantem URL em iOS', () => {
    const normalized = normalizeLocalhostForAndroid('http://localhost:3000', 'ios');
    expect(normalized).toBe('http://localhost:3000');
  });

  it('mantem URL sem localhost', () => {
    const normalized = normalizeLocalhostForAndroid('https://api.example.com', 'android');
    expect(normalized).toBe('https://api.example.com');
  });
});
