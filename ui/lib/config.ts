/**
 * Typed application configuration sourced from environment variables.
 *
 * All environment variables on the frontend are accessed exclusively
 * through this module. Never use `process.env` directly in components,
 * hooks, or utilities.
 */

/** The Solana network to connect to. */
export type SolanaNetwork = 'devnet' | 'mainnet-beta' | 'testnet';

/** Validated, typed frontend configuration. */
export interface AppConfig {
  /** The Solana RPC network identifier. Defaults to 'devnet'. */
  readonly solanaNetwork: SolanaNetwork;
  /** The backend API base URL for BFF proxy calls. */
  readonly backendUrl: string;
}

const VALID_NETWORKS: ReadonlySet<string> = new Set<SolanaNetwork>([
  'devnet',
  'mainnet-beta',
  'testnet',
]);

/**
 * Validates and narrows a raw string to a SolanaNetwork value.
 *
 * Exported for direct unit testing — the validation logic lives here,
 * not inside the module-level `appConfig` initialiser.
 *
 * @param value - Raw string from `process.env`, or undefined.
 * @returns The value cast to SolanaNetwork, defaulting to 'devnet' if absent.
 * @throws {Error} If the value is present but not a recognised network.
 */
export function parseSolanaNetwork(value: string | undefined): SolanaNetwork {
  if (value === undefined || value === '') {
    return 'devnet';
  }
  if (!VALID_NETWORKS.has(value)) {
    throw new Error(
      `Unknown Solana network: ${JSON.stringify(value)}. ` +
        `Expected one of: ${[...VALID_NETWORKS].join(', ')}.`,
    );
  }
  return value as SolanaNetwork;
}

/**
 * Singleton configuration instance evaluated once at module load time.
 *
 * Import this constant rather than constructing a new config object in
 * each consumer.
 */
export const appConfig: AppConfig = {
  solanaNetwork: parseSolanaNetwork(process.env['NEXT_PUBLIC_SOLANA_NETWORK']),
  backendUrl: process.env['NEXT_PUBLIC_BACKEND_URL'] ?? 'http://localhost:8000',
};
