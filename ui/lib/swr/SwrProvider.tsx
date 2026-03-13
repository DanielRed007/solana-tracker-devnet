'use client';

import { SWRConfig } from 'swr';
import { SWRDevTools } from 'swr-devtools';

import { apiFetcher } from '@/lib/swr/fetcher';

const REVALIDATION_INTERVAL_MS = 30_000;

const ERROR_RETRY_COUNT = 3;

export interface SwrProviderProps {
  readonly children: React.ReactNode;
}

export function SwrProvider({ children }: SwrProviderProps): React.JSX.Element {
  const isDev = process.env.NODE_ENV === 'development';

  const content = (
    <SWRConfig
      value={{
        fetcher: apiFetcher,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        refreshInterval: REVALIDATION_INTERVAL_MS,
        errorRetryCount: ERROR_RETRY_COUNT,
      }}
    >
      {children}
    </SWRConfig>
  );

  if (isDev) {
    return <SWRDevTools>{content}</SWRDevTools>;
  }

  return content;
}
