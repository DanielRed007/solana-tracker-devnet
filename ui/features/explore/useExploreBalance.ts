'use client';

import type { KeyedMutator } from 'swr';
import useSWR from 'swr';

import { useNetwork } from '@/features/wallet/useNetwork';
import { balanceKey } from '@/lib/swr/keys';
import type { WalletBalanceResponse } from '@/types/api';

export interface UseExploreBalanceResult {
  readonly lamports: number | undefined;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: Error | undefined;
  readonly mutate: KeyedMutator<WalletBalanceResponse>;
}

export function useExploreBalance(address: string | null): UseExploreBalanceResult {
  const { network } = useNetwork();
  const key = balanceKey(address, network);
  const { data, error, isLoading, mutate } = useSWR<WalletBalanceResponse>(key);

  return {
    lamports: data?.lamports,
    isLoading,
    isError: error !== undefined,
    error: error as Error | undefined,
    mutate,
  };
}
