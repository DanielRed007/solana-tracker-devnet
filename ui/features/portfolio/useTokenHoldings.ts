'use client';

/**
 * useTokenHoldings — SWR hook for fetching the connected wallet's SPL tokens.
 *
 * Derives the wallet address from `useWallet().publicKey` and the network
 * from `useNetwork()`, constructing a network-aware SWR cache key. When no
 * wallet is connected, the key is `null` and SWR skips the request.
 */

import { useWallet } from '@solana/wallet-adapter-react';
import useSWR from 'swr';
import type { KeyedMutator } from 'swr';

import { useNetwork } from '@/features/wallet/useNetwork';
import { tokenHoldingsKey } from '@/lib/swr/keys';
import type { TokenHoldingResponse, TokenHoldingsResponse } from '@/types/api';

/** Return shape of the useTokenHoldings hook. */
export interface UseTokenHoldingsResult {
  /** The list of token holdings, or undefined if not yet loaded. */
  readonly holdings: readonly TokenHoldingResponse[] | undefined;
  /** True while the initial request is in flight. */
  readonly isLoading: boolean;
  /** True if the request failed. */
  readonly isError: boolean;
  /** The error object if the request failed. */
  readonly error: Error | undefined;
  /** Trigger a manual revalidation of the token holdings. */
  readonly mutate: KeyedMutator<TokenHoldingsResponse>;
}

/**
 * Fetches the SPL token holdings for the currently connected wallet.
 *
 * The hook is fully self-contained: it reads the wallet address and
 * network internally, so consumers call it with no arguments.
 *
 * @returns The token holdings state including data, loading, and error.
 */
export function useTokenHoldings(): UseTokenHoldingsResult {
  const { publicKey } = useWallet();
  const { network } = useNetwork();

  const address = publicKey?.toBase58() ?? null;
  const key = tokenHoldingsKey(address, network);

  const { data, error, isLoading, mutate } = useSWR<TokenHoldingsResponse>(key);

  return {
    holdings: data?.holdings,
    isLoading,
    isError: error !== undefined,
    error: error as Error | undefined,
    mutate,
  };
}
