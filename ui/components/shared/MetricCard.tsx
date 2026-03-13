import type { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface MetricCardProps {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly value: string;
  readonly footnote: string;
  readonly isLoading?: boolean;
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  footnote,
  isLoading = false,
}: MetricCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardDescription className="flex items-center gap-1.5">
          <Icon className="size-3.5" />
          {label}
        </CardDescription>
        <CardTitle className="text-2xl tabular-nums">
          {isLoading ? (
            <span className="inline-block h-7 w-24 animate-pulse rounded bg-muted" />
          ) : (
            value
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{footnote}</p>
      </CardContent>
    </Card>
  );
}
