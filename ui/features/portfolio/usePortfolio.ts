'use client';

import { useTokenHoldings } from '@/features/portfolio/useTokenHoldings';
import { useWalletBalance } from '@/features/wallet/useWalletBalance';
import { formatSolBalance } from '@/lib/solana/formatters';
import type { TokenHoldingResponse } from '@/types/api';

export interface UsePortfolioResult {
  readonly formattedBalance: string | null;
  readonly lamports: number | undefined;
  readonly holdings: readonly TokenHoldingResponse[] | undefined;
  readonly tokenCount: number | undefined;
  readonly isLoading: boolean;
  readonly isError: boolean;
}

export function usePortfolio(): UsePortfolioResult {
  const balance = useWalletBalance();
  const tokens = useTokenHoldings();

  const formattedBalance =
    balance.lamports !== undefined ? formatSolBalance(balance.lamports) : null;

  const tokenCount = tokens.holdings !== undefined ? tokens.holdings.length : undefined;

  return {
    formattedBalance,
    lamports: balance.lamports,
    holdings: tokens.holdings,
    tokenCount,
    isLoading: balance.isLoading || tokens.isLoading,
    isError: balance.isError || tokens.isError,
  };
}
