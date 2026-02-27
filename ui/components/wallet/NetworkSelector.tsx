'use client';

/**
 * NetworkSelector — Displays the active Solana network with a visual badge.
 *
 * Phase 1 scope: UI-only display component. Shows the current network and
 * provides a toggle for future use. Does not yet wire to the backend or
 * change the active Solana connection — full network switching is a Phase 2
 * feature when the backend RPC URL becomes configurable at runtime.
 *
 * The component is intentionally "dumb": it receives the current network via
 * props and emits changes via a callback. State management (if any) lives in
 * a parent hook or Zustand slice, not here.
 */

import type { SolanaNetwork } from '@/lib/config';

/** Props for the NetworkSelector component. */
export interface NetworkSelectorProps {
  /** The currently active Solana network. */
  readonly currentNetwork: SolanaNetwork;
  /**
   * Optional callback invoked when the user selects a different network.
   * Phase 1: wired for future use; callers are responsible for any
   * state updates and re-connection logic.
   */
  readonly onNetworkChange?: (network: SolanaNetwork) => void;
  /** Additional CSS class names to apply to the outermost element. */
  readonly className?: string;
}

/** Display label and indicator colour for each known network. */
const NETWORK_DISPLAY: Record<SolanaNetwork, { label: string; colour: string }> = {
  devnet: { label: 'Devnet', colour: 'bg-yellow-500' },
  testnet: { label: 'Testnet', colour: 'bg-blue-500' },
  'mainnet-beta': { label: 'Mainnet', colour: 'bg-green-500' },
};

/**
 * Displays the current Solana network as a colour-coded badge.
 *
 * In Phase 1 this is a display component only. When `onNetworkChange` is
 * provided, future versions will render a dropdown or toggle to switch
 * networks without a page reload.
 *
 * @param props - Component props.
 * @returns The rendered network badge element.
 */
export function NetworkSelector({
  currentNetwork,
  className,
}: NetworkSelectorProps): React.JSX.Element {
  const display = NETWORK_DISPLAY[currentNetwork];

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ''}`}>
      <span
        className={`inline-block h-2 w-2 rounded-full ${display.colour}`}
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-gray-300">{display.label}</span>
    </div>
  );
}
