'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { Coins, LayoutDashboard, Loader2, TrendingUp, Wallet } from 'lucide-react';

import { ExploreSection } from '@/components/explore/ExploreSection';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MetricCard } from '@/components/shared/MetricCard';
import { NetworkSelector } from '@/components/wallet/NetworkSelector';
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
import { useNetwork } from '@/features/wallet/useNetwork';
import { usePortfolio } from '@/features/portfolio/usePortfolio';
import { abbreviateAddress } from '@/lib/solana/formatters';

export default function DashboardPage(): React.JSX.Element {
  const { publicKey, connected } = useWallet();
  const { network } = useNetwork();
  const portfolio = usePortfolio();

  const balanceValue = connected ? (portfolio.formattedBalance ?? '—') : '—';

  const tokenCountValue = connected
    ? portfolio.tokenCount !== undefined
      ? String(portfolio.tokenCount)
      : '—'
    : '—';

  return (
    <div className="flex min-h-screen flex-col bg-background">
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

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground">Portfolio Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {connected && publicKey !== null
              ? `Viewing wallet ${abbreviateAddress(publicKey.toBase58())} on ${network}`
              : 'Connect a wallet to view your Solana portfolio'}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            icon={Wallet}
            label="SOL Balance"
            value={balanceValue}
            isLoading={connected && portfolio.isLoading}
            footnote={
              connected
                ? portfolio.isError
                  ? 'Failed to fetch balance'
                  : 'Auto-refreshes every 30s'
                : 'Connect wallet to view balance'
            }
          />
          <MetricCard
            icon={TrendingUp}
            label="Portfolio Value"
            value="—"
            footnote={
              connected ? 'Price data available in Phase 2' : 'Connect wallet to view value'
            }
          />
          <MetricCard
            icon={Coins}
            label="Token Holdings"
            value={tokenCountValue}
            isLoading={connected && portfolio.isLoading}
            footnote={
              connected
                ? portfolio.isError
                  ? 'Failed to fetch tokens'
                  : 'Auto-refreshes every 30s'
                : 'Connect wallet to view tokens'
            }
          />
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Token Holdings</CardTitle>
            <CardDescription>Your SPL token balances and estimated values</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-border">
              <div className="text-center">
                {connected && portfolio.isLoading ? (
                  <>
                    <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground/50" />
                    <p className="mt-3 text-sm text-muted-foreground">Loading token holdings…</p>
                  </>
                ) : (
                  <>
                    <Coins className="mx-auto size-8 text-muted-foreground/50" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      {connected
                        ? portfolio.isError
                          ? 'Failed to load token holdings — will retry automatically'
                          : portfolio.holdings !== undefined && portfolio.holdings.length === 0
                            ? 'No SPL tokens found in this wallet'
                            : 'Token details table coming in Phase 2'
                        : 'Connect a wallet to see your token holdings'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <ExploreSection />
        </div>
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        Solana Portfolio Tracker — {network} — Phase 1
      </footer>
    </div>
  );
}
