'use client';

import { createContext, useCallback, useState } from 'react';

import { appConfig } from '@/lib/config';
import type { SolanaNetwork } from '@/lib/config';

export interface NetworkContextValue {
  readonly network: SolanaNetwork;
  readonly setNetwork: (network: SolanaNetwork) => void;
}

export const NetworkContext = createContext<NetworkContextValue | null>(null);

export interface NetworkProviderProps {
  readonly children: React.ReactNode;
}

export function NetworkProvider({ children }: NetworkProviderProps): React.JSX.Element {
  const [network, setNetworkState] = useState<SolanaNetwork>(appConfig.solanaNetwork);

  const setNetwork = useCallback((newNetwork: SolanaNetwork) => {
    setNetworkState(newNetwork);
  }, []);

  return <NetworkContext value={{ network, setNetwork }}>{children}</NetworkContext>;
}
