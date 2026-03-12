'use client';

/**
 * NetworkSelector — Interactive Solana network selector.
 *
 * Displays the active network as a colour-coded badge and allows the user
 * to toggle between Devnet and Mainnet. Switching networks disconnects the
 * current wallet to avoid cross-network state corruption.
 *
 * Devnet is the default and recommended network for safe development and
 * testing. Mainnet is available but visually distinguished with a warning
 * colour scheme.
 */

import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowLeftRight } from 'lucide-react';
import { useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNetwork } from '@/features/wallet/useNetwork';
import type { SolanaNetwork } from '@/lib/config';

/** Props for the NetworkSelector component. */
export interface NetworkSelectorProps {
  /** Additional CSS class names to apply to the outermost element. */
  readonly className?: string;
}

/** Display label and indicator colour for each known network. */
const NETWORK_DISPLAY: Record<
  SolanaNetwork,
  { label: string; dotClass: string; badgeClass: string }
> = {
  devnet: {
    label: 'Devnet',
    dotClass: 'bg-yellow-400',
    badgeClass: 'bg-yellow-950/60 text-yellow-400 ring-1 ring-yellow-500/20',
  },
  testnet: {
    label: 'Testnet',
    dotClass: 'bg-blue-400',
    badgeClass: 'bg-blue-950/60 text-blue-400 ring-1 ring-blue-500/20',
  },
  'mainnet-beta': {
    label: 'Mainnet',
    dotClass: 'bg-green-400',
    badgeClass: 'bg-green-950/60 text-green-400 ring-1 ring-green-500/20',
  },
};

/** Networks available for user selection. Ordered by safety (devnet first). */
const SELECTABLE_NETWORKS: readonly SolanaNetwork[] = ['devnet', 'mainnet-beta'];

/**
 * Renders an interactive network selector with toggle functionality.
 *
 * When the user switches networks, the current wallet is automatically
 * disconnected because wallet connections are network-specific. The user
 * must reconnect after switching.
 *
 * @param props - Component props.
 * @returns The rendered network selector element.
 */
export function NetworkSelector({ className }: NetworkSelectorProps): React.JSX.Element {
  const { network, setNetwork } = useNetwork();
  const { disconnect, connected } = useWallet();

  const display = NETWORK_DISPLAY[network];

  /**
   * Cycles to the next selectable network. Disconnects the wallet first
   * to prevent cross-network state issues.
   */
  const handleToggle = useCallback(() => {
    const currentIndex = SELECTABLE_NETWORKS.indexOf(network);
    const nextIndex = (currentIndex + 1) % SELECTABLE_NETWORKS.length;
    const nextNetwork = SELECTABLE_NETWORKS[nextIndex];

    if (nextNetwork === undefined || nextNetwork === network) return;

    if (connected) {
      void disconnect();
    }

    setNetwork(nextNetwork);
  }, [network, setNetwork, disconnect, connected]);

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <Badge variant="outline" className={display.badgeClass}>
        <span
          className={`inline-block size-2 rounded-full ${display.dotClass}`}
          aria-hidden="true"
        />
        {display.label}
      </Badge>
      <Button variant="ghost" size="xs" onClick={handleToggle}>
        <ArrowLeftRight data-icon="inline-start" />
        Switch
      </Button>
    </div>
  );
}
