import { describe, it, expect } from 'vitest';

import { parseSolanaNetwork } from '../config';

// Tests target `parseSolanaNetwork` directly — it contains all validation
// logic and is exported specifically to enable isolated unit testing.
// Testing `appConfig` (module-level singleton) would require dynamic module
// re-imports on each test, which is fragile and slower.

describe('parseSolanaNetwork', () => {
  it('returns "devnet" when the value is undefined', () => {
    expect(parseSolanaNetwork(undefined)).toBe('devnet');
  });

  it('returns "devnet" when the value is an empty string', () => {
    expect(parseSolanaNetwork('')).toBe('devnet');
  });

  it('returns "devnet" when the value is explicitly "devnet"', () => {
    expect(parseSolanaNetwork('devnet')).toBe('devnet');
  });

  it('returns "mainnet-beta" when the value is "mainnet-beta"', () => {
    expect(parseSolanaNetwork('mainnet-beta')).toBe('mainnet-beta');
  });

  it('returns "testnet" when the value is "testnet"', () => {
    expect(parseSolanaNetwork('testnet')).toBe('testnet');
  });

  it('throws an Error for an unrecognised network string', () => {
    expect(() => parseSolanaNetwork('invalid-network')).toThrow(Error);
  });

  it('includes the invalid value in the thrown error message', () => {
    expect(() => parseSolanaNetwork('badvalue')).toThrow('"badvalue"');
  });

  it('throws for a value that looks similar but is not a valid network', () => {
    // "mainnet" is NOT the same as "mainnet-beta"
    expect(() => parseSolanaNetwork('mainnet')).toThrow(Error);
  });
});
