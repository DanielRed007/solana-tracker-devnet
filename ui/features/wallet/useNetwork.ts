'use client';

import { useContext } from 'react';

import { NetworkContext } from '@/features/wallet/NetworkContext';
import type { NetworkContextValue } from '@/features/wallet/NetworkContext';

export function useNetwork(): NetworkContextValue {
  const context = useContext(NetworkContext);

  if (context === null) {
    throw new Error(
      'useNetwork must be used within a NetworkProvider (inside WalletContextProvider).',
    );
  }

  return context;
}
