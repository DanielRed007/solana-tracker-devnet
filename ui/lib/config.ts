export type SolanaNetwork = 'devnet' | 'mainnet-beta' | 'testnet';

export interface AppConfig {
  readonly solanaNetwork: SolanaNetwork;
  readonly backendUrl: string;
}

const VALID_NETWORKS: ReadonlySet<string> = new Set<SolanaNetwork>([
  'devnet',
  'mainnet-beta',
  'testnet',
]);

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

export const appConfig: AppConfig = {
  solanaNetwork: parseSolanaNetwork(process.env['NEXT_PUBLIC_SOLANA_NETWORK']),
  backendUrl: process.env['NEXT_PUBLIC_BACKEND_URL'] ?? 'http://localhost:8000',
};
