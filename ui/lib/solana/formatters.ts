/**
 * Utility functions for formatting Solana-specific values for display.
 *
 * All functions are pure — they have no side effects and no dependencies
 * on external state. They are the primary target for unit tests.
 */

/** Number of lamports in one SOL. */
export const SOL_LAMPORTS_PER_UNIT = 1_000_000_000;

/**
 * Abbreviates a base58 Solana address for compact display in the UI.
 *
 * For a full address like `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`,
 * the default output is `DezX...B263`.
 *
 * @param address - The full base58 public key string.
 * @param prefixLength - Number of characters to keep at the start. Defaults to 4.
 * @param suffixLength - Number of characters to keep at the end. Defaults to 4.
 * @returns Abbreviated address with an ellipsis separator.
 */
export function abbreviateAddress(
  address: string,
  prefixLength: number = 4,
  suffixLength: number = 4,
): string {
  const minLength = prefixLength + suffixLength;
  if (address.length <= minLength) {
    return address;
  }
  const prefix = address.slice(0, prefixLength);
  const suffix = address.slice(-suffixLength);
  return `${prefix}...${suffix}`;
}

/**
 * Converts a lamport amount to a SOL display string.
 *
 * Always renders 4 decimal places to give a consistent visual weight
 * in the portfolio table (e.g. `"5.0000 SOL"`, `"0.1234 SOL"`).
 *
 * @param lamports - The balance in lamports (must be a non-negative integer).
 * @returns A formatted string like `"5.0000 SOL"`.
 */
export function formatSolBalance(lamports: number): string {
  const sol = lamports / SOL_LAMPORTS_PER_UNIT;
  return `${sol.toFixed(4)} SOL`;
}
