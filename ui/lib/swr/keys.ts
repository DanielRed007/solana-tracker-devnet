import type { SolanaNetwork } from '@/lib/config';

export function balanceKey(address: string | null, network: SolanaNetwork): string | null {
  if (address === null) return null;
  return `/api/wallet/${address}/balance?network=${network}`;
}

export function tokenHoldingsKey(address: string | null, network: SolanaNetwork): string | null {
  if (address === null) return null;
  return `/api/wallet/${address}/tokens?network=${network}`;
}
