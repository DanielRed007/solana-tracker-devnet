import { describe, expect, it } from 'vitest';

import { balanceKey, tokenHoldingsKey } from '@/lib/swr/keys';

describe('balanceKey', () => {
  it('returns null when address is null', () => {
    expect(balanceKey(null, 'devnet')).toBeNull();
  });

  it('returns the BFF URL with network query param for a valid address', () => {
    const key = balanceKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', 'devnet');
    expect(key).toBe('/api/wallet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/balance?network=devnet');
  });

  it('embeds the correct network for mainnet-beta', () => {
    const key = balanceKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', 'mainnet-beta');
    expect(key).toContain('network=mainnet-beta');
  });

  it('produces different keys for different networks', () => {
    const address = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
    const devnetKey = balanceKey(address, 'devnet');
    const mainnetKey = balanceKey(address, 'mainnet-beta');
    expect(devnetKey).not.toBe(mainnetKey);
  });
});

describe('tokenHoldingsKey', () => {
  it('returns null when address is null', () => {
    expect(tokenHoldingsKey(null, 'devnet')).toBeNull();
  });

  it('returns the BFF URL with network query param for a valid address', () => {
    const key = tokenHoldingsKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', 'devnet');
    expect(key).toBe('/api/wallet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/tokens?network=devnet');
  });

  it('produces different keys for different networks', () => {
    const address = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
    const devnetKey = tokenHoldingsKey(address, 'devnet');
    const mainnetKey = tokenHoldingsKey(address, 'mainnet-beta');
    expect(devnetKey).not.toBe(mainnetKey);
  });
});
