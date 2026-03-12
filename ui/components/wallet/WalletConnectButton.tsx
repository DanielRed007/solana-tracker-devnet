'use client';

/**
 * WalletConnectButton — Connect/disconnect button for Solana wallets.
 *
 * Renders different states:
 * - Disconnected: a "Connect Wallet" button that auto-selects the first
 *   installed wallet adapter (preferring Phantom)
 * - Connecting: a disabled button showing "Connecting…"
 * - Connected: the abbreviated wallet address with a "Disconnect" action
 *
 * Business logic (address abbreviation) is extracted to `lib/solana/formatters`
 * per the architecture rule that components are presentational only.
 *
 * Uses shadcn/ui Button for consistent styling across the application.
 */

import { WalletReadyState } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { LogOut, Wallet } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { abbreviateAddress } from '@/lib/solana/formatters';

/** Props for the WalletConnectButton component. */
export interface WalletConnectButtonProps {
  /** Additional CSS class names to apply to the outermost element. */
  readonly className?: string;
}

/**
 * Renders a stateful wallet connect / disconnect button.
 *
 * On "Connect Wallet" click, automatically selects the first installed
 * wallet adapter (preferring Phantom). If no wallets are detected, the
 * button is disabled with a helpful label.
 *
 * @param props - Component props.
 * @returns The rendered button element.
 */
export function WalletConnectButton({ className }: WalletConnectButtonProps): React.JSX.Element {
  const { publicKey, connect, disconnect, connecting, connected, wallet, wallets, select } =
    useWallet();

  const connectRequested = useRef(false);

  const installedWallets = wallets.filter(
    (w) => w.readyState === WalletReadyState.Installed,
  );

  const hasInstalledWallet = installedWallets.length > 0;

  /**
   * Selects the first installed wallet (preferring Phantom) and marks
   * a connect request. The effect below calls `connect()` once the
   * wallet state updates.
   */
  const handleConnect = useCallback(() => {
    if (!hasInstalledWallet) return;

    const phantom = installedWallets.find((w) => w.adapter.name === 'Phantom');
    const target = phantom ?? installedWallets[0];

    if (target !== undefined) {
      connectRequested.current = true;
      select(target.adapter.name);
    }
  }, [installedWallets, hasInstalledWallet, select]);

  /**
   * Completes the connection after `select()` updates the wallet state.
   * The `connectRequested` ref prevents unwanted reconnection after
   * an intentional disconnect.
   */
  useEffect(() => {
    if (connectRequested.current && wallet !== null && !connected && !connecting) {
      connectRequested.current = false;
      void connect();
    }
  }, [wallet, connected, connecting, connect]);

  if (connected && publicKey !== null) {
    return (
      <div className={`flex items-center gap-2 ${className ?? ''}`}>
        <span className="rounded-md bg-emerald-950/60 px-3 py-1.5 font-mono text-sm text-emerald-400 ring-1 ring-emerald-500/20">
          {abbreviateAddress(publicKey.toBase58())}
        </span>
        <Button variant="destructive" size="sm" onClick={() => void disconnect()}>
          <LogOut data-icon="inline-start" />
          Disconnect
        </Button>
      </div>
    );
  }

  if (connecting) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Wallet data-icon="inline-start" />
        Connecting…
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleConnect}
      disabled={!hasInstalledWallet}
      className={className}
    >
      <Wallet data-icon="inline-start" />
      {hasInstalledWallet ? 'Connect Wallet' : 'No Wallet Detected'}
    </Button>
  );
}
