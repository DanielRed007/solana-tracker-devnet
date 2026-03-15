'use client';

import type { KeyedMutator } from 'swr';
import useSWR from 'swr';

import { useNetwork } from '@/features/wallet/useNetwork';
import { tokenHoldingsKey } from '@/lib/swr/keys';
import type { TokenHoldingResponse, TokenHoldingsResponse } from '@/types/api';

export interface UseExploreTokensResult {
  readonly holdings: readonly TokenHoldingResponse[] | undefined;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: Error | undefined;
  readonly mutate: KeyedMutator<TokenHoldingsResponse>;
}

export function useExploreTokens(address: string | null): UseExploreTokensResult {
  const { network } = useNetwork();
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
