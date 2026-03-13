export class ApiError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(status: number, url: string) {
    super(`API request failed: ${status} ${url}`);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
  }
}

export async function apiFetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new ApiError(response.status, url);
  }

  return response.json() as Promise<T>;
}
