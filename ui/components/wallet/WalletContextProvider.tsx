'use client';

/**
 * WalletContextProvider — Client-side Solana wallet adapter provider.
 *
 * This component must be marked `'use client'` because the wallet adapter
 * uses browser-only APIs (`window.solana`, `localStorage`). It bridges the
 * Next.js App Router Server/Client boundary: the root layout (Server Component)
 * imports this file, and Next.js correctly hydrates it on the browser.
 *
 * Provider hierarchy:
 *   NetworkProvider (manages active network state)
 *     └── ConnectionProvider (manages the Solana RPC connection)
 *           └── WalletProvider (manages wallet state and adapter lifecycle)
 *                 └── {children}
 */

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';

import { NetworkProvider } from '@/features/wallet/NetworkContext';
import { useNetwork } from '@/features/wallet/useNetwork';
import { getRpcEndpoint } from '@/lib/solana/connection';

/** Props for the WalletContextProvider component. */
export interface WalletContextProviderProps {
  /** Child components that will have access to wallet context. */
  readonly children: React.ReactNode;
}

/**
 * Inner provider that consumes network context to compute the RPC endpoint.
 *
 * Separated from the outer provider so that `useNetwork` can be called
 * inside the `NetworkProvider` tree. When the user switches networks via
 * the `NetworkSelector`, the endpoint updates and `ConnectionProvider`
 * re-renders with the new connection.
 *
 * @param props - Component props.
 * @returns The wallet adapter provider tree.
 */
function WalletAdapterProviders({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  const { network } = useNetwork();

  const endpoint = useMemo(() => getRpcEndpoint(network), [network]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}

/**
 * Provides Solana wallet connection context to all child components.
 *
 * Wraps `NetworkProvider` → `ConnectionProvider` → `WalletProvider`.
 * The network defaults to `'devnet'` (from env config) and can be changed
 * at runtime via the `useNetwork` hook / `NetworkSelector` component.
 *
 * Configures Phantom and Solflare wallet adapters. The `wallets` array is
 * memoized to prevent adapter instances from being recreated on every render
 * (required pattern per `@solana/wallet-adapter-react` documentation).
 *
 * `autoConnect` is set to `false` — the user must click "Connect Wallet"
 * explicitly. This is appropriate for a portfolio tracker where viewing a
 * demo without connecting a wallet is a supported use case.
 *
 * Note: Backpack is not included in `@solana/wallet-adapter-wallets` as of
 * v0.19.x. To add Backpack support, install `@backpack-app/wallet-adapter`
 * separately and add its adapter to the wallets array.
 *
 * @param props - Component props.
 * @returns The full provider tree wrapping children.
 */
export function WalletContextProvider({
  children,
}: WalletContextProviderProps): React.JSX.Element {
  return (
    <NetworkProvider>
      <WalletAdapterProviders>{children}</WalletAdapterProviders>
    </NetworkProvider>
  );
}
