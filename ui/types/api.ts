export interface WalletBalanceResponse {
  readonly walletAddress: string;
  readonly lamports: number;
  /** ISO 8601 timestamp of when the balance was retrieved. */
  readonly retrievedAt: string;
}

export interface TokenHoldingResponse {
  readonly mintAddress: string;
  readonly ownerAddress: string;
  readonly rawAmount: number;
  readonly decimals: number;
  readonly symbol: string | null;
  readonly name: string | null;
  readonly logoUri: string | null;
}

export interface TokenHoldingsResponse {
  readonly holdings: readonly TokenHoldingResponse[];
}

export interface ApiErrorResponse {
  readonly error: string;
  readonly status: number;
}
