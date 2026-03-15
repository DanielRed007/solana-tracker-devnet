'use client';

import { Coins, Search, Wallet, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useRef } from 'react';

import { MetricCard } from '@/components/shared/MetricCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useExploreStore } from '@/features/explore/exploreStore';
import { useExploreBalance } from '@/features/explore/useExploreBalance';
import { useExploreTokens } from '@/features/explore/useExploreTokens';
import { abbreviateAddress, formatSolBalance } from '@/lib/solana/formatters';

const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

interface ExploreResultsProps {
  readonly address: string;
}

function ExploreResults({ address }: ExploreResultsProps): React.JSX.Element {
  const balance = useExploreBalance(address);
  const tokens = useExploreTokens(address);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Viewing{' '}
        <span className="font-mono text-xs text-foreground">{abbreviateAddress(address)}</span>
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          icon={Wallet}
          label="SOL Balance"
          value={balance.lamports !== undefined ? formatSolBalance(balance.lamports) : '—'}
          isLoading={balance.isLoading}
          footnote={balance.isError ? 'Failed to fetch balance' : 'Live from Solana RPC'}
        />
        <MetricCard
          icon={Coins}
          label="Token Holdings"
          value={tokens.holdings !== undefined ? String(tokens.holdings.length) : '—'}
          isLoading={tokens.isLoading}
          footnote={tokens.isError ? 'Failed to fetch tokens' : 'SPL token accounts'}
        />
      </div>
    </div>
  );
}

export function ExploreSection(): React.JSX.Element {
  const { inputValue, exploredAddress, setInputValue, explore, clearExplore } = useExploreStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const isValid = BASE58_RE.test(inputValue.trim());

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (isValid) explore(inputValue.trim());
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Explore</CardTitle>
        <CardDescription>Look up any Solana wallet address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Paste a Solana address…"
            spellCheck={false}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:font-sans placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {exploredAddress !== null && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearExplore}
              aria-label="Clear"
            >
              <X className="size-4" />
            </Button>
          )}
          <Button type="submit" disabled={!isValid} size="sm">
            <Search className="mr-2 size-4" />
            Explore
          </Button>
        </form>

        {exploredAddress !== null && <ExploreResults address={exploredAddress} />}
      </CardContent>
    </Card>
  );
}
