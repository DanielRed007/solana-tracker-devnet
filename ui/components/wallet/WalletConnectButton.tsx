'use client';

/**
 * WalletConnectButton — Connect/disconnect button for Solana wallets.
 *
 * Renders different states:
 * - Disconnected: a "Connect Wallet" button
 * - Connecting: a disabled button showing "Connecting…"
 * - Connected: the abbreviated wallet address with a "Disconnect" action
 *
 * Business logic (address abbreviation) is extracted to `lib/solana/formatters`
 * per the architecture rule that components are presentational only.
 *
 * Styled with plain Tailwind CSS — `@solana/wallet-adapter-react-ui` is
 * intentionally excluded to avoid CSS conflicts with Tailwind v4.
 */

import { useWallet } from '@solana/wallet-adapter-react';

import { abbreviateAddress } from '@/lib/solana/formatters';

/** Props for the WalletConnectButton component. */
export interface WalletConnectButtonProps {
  /** Additional CSS class names to apply to the outermost element. */
  readonly className?: string;
}

/**
 * Renders a stateful wallet connect / disconnect button.
 *
 * Uses `useWallet()` from `@solana/wallet-adapter-react` to read connection
 * state and invoke connect/disconnect actions. The component itself contains
 * no business logic — all formatting is delegated to utility functions.
 *
 * @param props - Component props.
 * @returns The rendered button element.
 */
export function WalletConnectButton({ className }: WalletConnectButtonProps): React.JSX.Element {
  const { publicKey, connect, disconnect, connecting, connected, wallet } = useWallet();

  if (connected && publicKey !== null) {
    return (
      <div className={`flex items-center gap-2 ${className ?? ''}`}>
        <span className="rounded-md bg-green-900/40 px-3 py-1.5 font-mono text-sm text-green-300">
          {abbreviateAddress(publicKey.toBase58())}
        </span>
        <button
          type="button"
          onClick={() => void disconnect()}
          className="rounded-md border border-red-700/50 bg-red-900/30 px-3 py-1.5 text-sm text-red-300 transition-colors hover:bg-red-900/60"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (connecting) {
    return (
      <button
        type="button"
        disabled
        className={`cursor-not-allowed rounded-md bg-purple-800/50 px-4 py-2 text-sm text-purple-300 ${className ?? ''}`}
      >
        Connecting…
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (wallet !== null) {
          void connect();
        }
      }}
      disabled={wallet === null}
      className={`rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ''}`}
    >
      Connect Wallet
    </button>
  );
}
