'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import useSWR from 'swr';
import type { KeyedMutator } from 'swr';

import { useNetwork } from '@/features/wallet/useNetwork';
import { balanceKey } from '@/lib/swr/keys';
import type { WalletBalanceResponse } from '@/types/api';

export interface UseWalletBalanceResult {
  readonly lamports: number | undefined;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: Error | undefined;
  readonly mutate: KeyedMutator<WalletBalanceResponse>;
}

export function useWalletBalance(): UseWalletBalanceResult {
  const { publicKey } = useWallet();
  const { network } = useNetwork();

  const address = publicKey?.toBase58() ?? null;
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
