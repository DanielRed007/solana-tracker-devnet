'use client';

/**
 * Dashboard — Main portfolio tracker page.
 *
 * Displays the wallet connection controls (network selector, connect button)
 * and placeholder cards for portfolio data. In Phase 1, the balance and
 * token cards show prompts to connect a wallet; actual data fetching is
 * wired in subsequent phases via BFF proxy routes.
 */

import { useWallet } from '@solana/wallet-adapter-react';
import { Coins, LayoutDashboard, TrendingUp, Wallet } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { NetworkSelector } from '@/components/wallet/NetworkSelector';
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
import { useNetwork } from '@/features/wallet/useNetwork';
import { abbreviateAddress } from '@/lib/solana/formatters';

/**
 * Root page component — renders the portfolio dashboard.
 *
 * @returns The dashboard layout with wallet controls and portfolio cards.
 */
export default function DashboardPage(): React.JSX.Element {
  const { publicKey, connected } = useWallet();
  const { network } = useNetwork();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="size-5 text-primary" />
            <h1 className="text-base font-semibold text-foreground">Solana Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <NetworkSelector />
            <Separator orientation="vertical" className="h-6" />
            <WalletConnectButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground">Portfolio Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {connected && publicKey !== null
              ? `Viewing wallet ${abbreviateAddress(publicKey.toBase58())} on ${network}`
              : 'Connect a wallet to view your Solana portfolio'}
          </p>
        </div>

        {/* Portfolio summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* SOL Balance card */}
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <Wallet className="size-3.5" />
                SOL Balance
              </CardDescription>
              <CardTitle className="text-2xl tabular-nums">—</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {connected
                  ? 'Balance fetching available in next phase'
                  : 'Connect wallet to view balance'}
              </p>
            </CardContent>
          </Card>

          {/* Portfolio value card */}
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <TrendingUp className="size-3.5" />
                Portfolio Value
              </CardDescription>
              <CardTitle className="text-2xl tabular-nums">—</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {connected
                  ? 'Price data available in Phase 2'
                  : 'Connect wallet to view value'}
              </p>
            </CardContent>
          </Card>

          {/* Token count card */}
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <Coins className="size-3.5" />
                Token Holdings
              </CardDescription>
              <CardTitle className="text-2xl tabular-nums">—</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {connected
                  ? 'Token list available in Phase 2'
                  : 'Connect wallet to view tokens'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Token table placeholder */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Token Holdings</CardTitle>
            <CardDescription>Your SPL token balances and estimated values</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-border">
              <div className="text-center">
                <Coins className="mx-auto size-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  {connected
                    ? 'Token holdings will appear here in Phase 2'
                    : 'Connect a wallet to see your token holdings'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        Solana Portfolio Tracker — {network} — Phase 1
      </footer>
    </div>
  );
}
