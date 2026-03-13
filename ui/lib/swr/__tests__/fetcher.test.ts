import { describe, expect, it, vi } from 'vitest';

import { ApiError, apiFetcher } from '@/lib/swr/fetcher';

describe('ApiError', () => {
  it('stores status and url on the error instance', () => {
    const error = new ApiError(404, '/api/wallet/abc/balance');
    expect(error.status).toBe(404);
    expect(error.url).toBe('/api/wallet/abc/balance');
    expect(error.name).toBe('ApiError');
    expect(error.message).toContain('404');
  });
});

describe('apiFetcher', () => {
  it('returns parsed JSON on a successful response', async () => {
    const mockData = { lamports: 5_000_000_000 };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 }),
    );

    const result = await apiFetcher<{ lamports: number }>('/api/wallet/abc/balance');
    expect(result).toEqual(mockData);
  });

  it('throws ApiError on a non-OK response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Not Found', { status: 404 }),
    );

    await expect(apiFetcher('/api/wallet/abc/balance')).rejects.toThrow(ApiError);
  });

  it('includes status and url in the thrown ApiError', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Bad Gateway', { status: 502 }),
    );

    try {
      await apiFetcher('/api/wallet/abc/balance');
      expect.fail('Expected apiFetcher to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      const apiError = error as ApiError;
      expect(apiError.status).toBe(502);
      expect(apiError.url).toBe('/api/wallet/abc/balance');
    }
  });
});
