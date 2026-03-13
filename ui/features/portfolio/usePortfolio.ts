'use client';

/**
 * usePortfolio — Composite hook combining balance and token data.
 *
 * This is the primary hook consumed by the dashboard page. It
 * aggregates `useWalletBalance` and `useTokenHoldings` into a single
 * return object with derived display values.
 */

import { useWalletBalance } from '@/features/wallet/useWalletBalance';
import { useTokenHoldings } from '@/features/portfolio/useTokenHoldings';
import { formatSolBalance } from '@/lib/solana/formatters';
import type { TokenHoldingResponse } from '@/types/api';

/** Return shape of the usePortfolio hook. */
export interface UsePortfolioResult {
  /** Formatted SOL balance string (e.g. "5.0000 SOL"), or null if unavailable. */
  readonly formattedBalance: string | null;
  /** Raw balance in lamports, or undefined if not loaded. */
  readonly lamports: number | undefined;
  /** List of SPL token holdings, or undefined if not loaded. */
  readonly holdings: readonly TokenHoldingResponse[] | undefined;
  /** Number of distinct token types held, or undefined if not loaded. */
  readonly tokenCount: number | undefined;
  /** True while any data request is in flight. */
  readonly isLoading: boolean;
  /** True if any data request failed. */
  readonly isError: boolean;
}

/**
 * Aggregates wallet balance and token holdings into a unified portfolio view.
 *
 * Computes derived display values (formatted balance, token count) using
 * existing utility functions from `lib/solana/formatters.ts`.
 *
 * @returns The combined portfolio state.
 */
export function usePortfolio(): UsePortfolioResult {
  const balance = useWalletBalance();
  const tokens = useTokenHoldings();

  const formattedBalance =
    balance.lamports !== undefined ? formatSolBalance(balance.lamports) : null;

  const tokenCount =
    tokens.holdings !== undefined ? tokens.holdings.length : undefined;

  return {
    formattedBalance,
    lamports: balance.lamports,
    holdings: tokens.holdings,
    tokenCount,
    isLoading: balance.isLoading || tokens.isLoading,
    isError: balance.isError || tokens.isError,
  };
}
