'use client';

/**
 * NetworkContext — React context for managing the active Solana network.
 *
 * Provides the current network and a setter to child components. The
 * WalletContextProvider wraps this around the wallet adapter providers
 * so that changing the network reactively updates the RPC endpoint.
 *
 * Defaults to the value configured via environment variables (typically
 * 'devnet' for safe development).
 */

import { createContext, useCallback, useState } from 'react';

import { appConfig } from '@/lib/config';
import type { SolanaNetwork } from '@/lib/config';

/** Shape of the network context value exposed to consumers. */
export interface NetworkContextValue {
  /** The currently active Solana network. */
  readonly network: SolanaNetwork;
  /** Updates the active network. Triggers RPC endpoint recalculation. */
  readonly setNetwork: (network: SolanaNetwork) => void;
}

/**
 * React context for the active Solana network.
 *
 * Initialised to `null` — consumers must be wrapped by `NetworkProvider`.
 * Use the `useNetwork` hook for safe access with a descriptive error on
 * missing provider.
 */
export const NetworkContext = createContext<NetworkContextValue | null>(null);

/** Props for the NetworkProvider component. */
export interface NetworkProviderProps {
  /** Child components that will have access to network context. */
  readonly children: React.ReactNode;
}

/**
 * Provides Solana network state to all child components.
 *
 * The initial network is read from `appConfig.solanaNetwork` (sourced from
 * the `NEXT_PUBLIC_SOLANA_NETWORK` env var, defaulting to `'devnet'`).
 *
 * @param props - Component props.
 * @returns The provider wrapping children with network context.
 */
export function NetworkProvider({ children }: NetworkProviderProps): React.JSX.Element {
  const [network, setNetworkState] = useState<SolanaNetwork>(appConfig.solanaNetwork);

  const setNetwork = useCallback((newNetwork: SolanaNetwork) => {
    setNetworkState(newNetwork);
  }, []);

  return (
    <NetworkContext value={{ network, setNetwork }}>
      {children}
    </NetworkContext>
  );
}
