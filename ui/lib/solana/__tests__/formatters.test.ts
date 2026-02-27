import { describe, it, expect } from 'vitest';

import {
  abbreviateAddress,
  formatSolBalance,
  SOL_LAMPORTS_PER_UNIT,
} from '../formatters';

describe('SOL_LAMPORTS_PER_UNIT', () => {
  it('equals 1_000_000_000', () => {
    expect(SOL_LAMPORTS_PER_UNIT).toBe(1_000_000_000);
  });
});

describe('abbreviateAddress', () => {
  const FULL_ADDRESS = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';

  it('returns first 4 and last 4 characters separated by an ellipsis by default', () => {
    expect(abbreviateAddress(FULL_ADDRESS)).toBe('DezX...B263');
  });

  it('respects a custom prefix length', () => {
    expect(abbreviateAddress(FULL_ADDRESS, 6, 4)).toBe('DezXAZ...B263');
  });

  it('respects a custom suffix length', () => {
    // Last 6 chars of FULL_ADDRESS are "pPB263"
    expect(abbreviateAddress(FULL_ADDRESS, 4, 6)).toBe('DezX...pPB263');
  });

  it('respects both custom prefix and suffix lengths', () => {
    expect(abbreviateAddress(FULL_ADDRESS, 2, 2)).toBe('De...63');
  });

  it('returns the full address unchanged when it is shorter than prefix + suffix', () => {
    const short = 'ABCDE';
    // prefixLength=4, suffixLength=4 → minLength=8 > 5, so no truncation
    expect(abbreviateAddress(short, 4, 4)).toBe('ABCDE');
  });

  it('returns the full address unchanged when its length exactly equals prefix + suffix', () => {
    const exact = 'ABCDEFGH';
    // prefixLength=4, suffixLength=4 → minLength=8 === 8, no truncation
    expect(abbreviateAddress(exact, 4, 4)).toBe('ABCDEFGH');
  });
});

describe('formatSolBalance', () => {
  it('formats zero lamports as "0.0000 SOL"', () => {
    expect(formatSolBalance(0)).toBe('0.0000 SOL');
  });

  it('formats exactly 1 SOL (1_000_000_000 lamports)', () => {
    expect(formatSolBalance(1_000_000_000)).toBe('1.0000 SOL');
  });

  it('formats a whole-number SOL amount with 4 decimal places', () => {
    expect(formatSolBalance(5_000_000_000)).toBe('5.0000 SOL');
  });

  it('formats a fractional SOL amount to 4 decimal places', () => {
    // 1_234_000_000 lamports = 1.234 SOL → rendered as 1.2340
    expect(formatSolBalance(1_234_000_000)).toBe('1.2340 SOL');
  });

  it('appends " SOL" suffix', () => {
    expect(formatSolBalance(500_000_000)).toContain(' SOL');
  });
});
