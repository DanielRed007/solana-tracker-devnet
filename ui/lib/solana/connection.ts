/**
 * Solana Connection factory.
 *
 * Provides a configured Connection instance for use inside the wallet
 * adapter providers. Backend-bound data fetching always goes through the
 * BFF proxy — never through this client-side connection.
 */

import { Connection, clusterApiUrl } from '@solana/web3.js';
import type { Cluster } from '@solana/web3.js';

import { appConfig } from '@/lib/config';
import type { SolanaNetwork } from '@/lib/config';

/**
 * Maps internal SolanaNetwork names to `@solana/web3.js` Cluster constants.
 *
 * The mapping is explicit and exhaustive: adding a new SolanaNetwork value
 * will produce a TypeScript error here until the mapping is updated.
 */
const NETWORK_TO_CLUSTER: Record<SolanaNetwork, Cluster> = {
  devnet: 'devnet',
  'mainnet-beta': 'mainnet-beta',
  testnet: 'testnet',
};

/**
 * Returns the RPC endpoint URL for the configured Solana network.
 *
 * Uses the public Solana cluster URLs via `clusterApiUrl`. These endpoints
 * are appropriate for wallet adapter use (not for heavy data fetching, which
 * should go through the backend RPC client to leverage rate-limit caching).
 *
 * @returns A fully-formed RPC endpoint URL string.
 */
export function getRpcEndpoint(): string {
  const cluster = NETWORK_TO_CLUSTER[appConfig.solanaNetwork];
  return clusterApiUrl(cluster);
}

/**
 * Creates a new Solana Connection instance for the configured network.
 *
 * The `'confirmed'` commitment is appropriate for balance and token account
 * reads in a portfolio tracker context, providing a balance between
 * freshness and stability.
 *
 * @returns A configured `Connection` instance.
 */
export function createSolanaConnection(): Connection {
  return new Connection(getRpcEndpoint(), 'confirmed');
}
