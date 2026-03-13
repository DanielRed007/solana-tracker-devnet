'use client';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';

import { NetworkProvider } from '@/features/wallet/NetworkContext';
import { useNetwork } from '@/features/wallet/useNetwork';
import { getRpcEndpoint } from '@/lib/solana/connection';

export interface WalletContextProviderProps {
  readonly children: React.ReactNode;
}

function WalletAdapterProviders({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  const { network } = useNetwork();

  const endpoint = useMemo(() => getRpcEndpoint(network), [network]);

  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}

export function WalletContextProvider({ children }: WalletContextProviderProps): React.JSX.Element {
  return (
    <NetworkProvider>
      <WalletAdapterProviders>{children}</WalletAdapterProviders>
    </NetworkProvider>
  );
}
