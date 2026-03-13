/**
 * BFF proxy route: GET /api/wallet/{address}/tokens
 *
 * Thin proxy that forwards token holdings requests to the FastAPI
 * backend. Validates the address format, forwards the request, and
 * returns the typed response. No business logic lives here.
 *
 * Returns 502 with a structured error body if the backend is
 * unreachable, allowing the frontend to degrade gracefully.
 */

import { NextResponse } from 'next/server';

import { appConfig } from '@/lib/config';
import type { ApiErrorResponse, TokenHoldingsResponse } from '@/types/api';

/** Base58 character set — used for basic address format validation. */
const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

/**
 * Handles GET requests for a wallet's SPL token holdings.
 *
 * @param _request - The incoming request (unused; no query params needed).
 * @param context - Route context containing the `address` dynamic segment.
 * @returns JSON response with the token holdings or an error.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ address: string }> },
): Promise<NextResponse<TokenHoldingsResponse | ApiErrorResponse>> {
  const { address } = await params;

  if (!BASE58_REGEX.test(address)) {
    return NextResponse.json(
      { error: 'Invalid wallet address format', status: 400 },
      { status: 400 },
    );
  }

  try {
    const backendUrl = `${appConfig.backendUrl}/wallet/${address}/tokens`;
    const response = await fetch(backendUrl);

    if (!response.ok) {
      const status = response.status;
      return NextResponse.json(
        { error: `Backend returned ${status}`, status },
        { status },
      );
    }

    const data = (await response.json()) as TokenHoldingsResponse;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Backend service unavailable', status: 502 },
      { status: 502 },
    );
  }
}
