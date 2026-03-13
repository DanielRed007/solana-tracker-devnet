'use client';

import { WalletReadyState } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { LogOut, Wallet } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { abbreviateAddress } from '@/lib/solana/formatters';

export interface WalletConnectButtonProps {
  readonly className?: string;
}

export function WalletConnectButton({ className }: WalletConnectButtonProps): React.JSX.Element {
  const { publicKey, connect, disconnect, connecting, connected, wallet, wallets, select } =
    useWallet();

  const connectRequested = useRef(false);

  const installedWallets = wallets.filter((w) => w.readyState === WalletReadyState.Installed);

  const hasInstalledWallet = installedWallets.length > 0;

  const handleConnect = useCallback(() => {
    if (!hasInstalledWallet) return;

    const phantom = installedWallets.find((w) => w.adapter.name === 'Phantom');
    const target = phantom ?? installedWallets[0];

    if (target !== undefined) {
      connectRequested.current = true;
      select(target.adapter.name);
    }
  }, [installedWallets, hasInstalledWallet, select]);

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
