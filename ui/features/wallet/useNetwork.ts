'use client';

/**
 * useNetwork — Hook to access the active Solana network context.
 *
 * Must be called within a component tree wrapped by `NetworkProvider`
 * (which lives inside `WalletContextProvider`).
 */

import { useContext } from 'react';

import { NetworkContext } from '@/features/wallet/NetworkContext';
import type { NetworkContextValue } from '@/features/wallet/NetworkContext';

/**
 * Returns the current Solana network and a setter to change it.
 *
 * @returns The network context value with `network` and `setNetwork`.
 * @throws {Error} If called outside a `NetworkProvider`.
 */
export function useNetwork(): NetworkContextValue {
  const context = useContext(NetworkContext);

  if (context === null) {
    throw new Error('useNetwork must be used within a NetworkProvider (inside WalletContextProvider).');
  }

  return context;
}
