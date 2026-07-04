import { API_VERSION, type ApiError } from '@cena/shared';
import { config } from './config';
import { tokenStore } from './secureStore';

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** JSON body — serialized automatically. */
  body?: unknown;
  /** Prefix the path with the /v1 version segment. Default true. */
  versioned?: boolean;
  /** Attach the bearer token if present. Default true. */
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, versioned = true, auth = true, headers, ...rest } = options;
  const prefix = versioned ? `/${API_VERSION}` : '';
  const url = `${config.apiUrl}${prefix}${path}`;

  const finalHeaders = new Headers(headers);
  finalHeaders.set('Accept', 'application/json');
  if (body !== undefined) finalHeaders.set('Content-Type', 'application/json');

  if (auth) {
    const tokens = await tokenStore.get();
    if (tokens) finalHeaders.set('Authorization', `Bearer ${tokens.accessToken}`);
  }

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = (data as ApiError | null)?.error;
    throw new ApiRequestError(
      res.status,
      err?.code ?? 'unknown',
      err?.message ?? 'Algo deu errado. Tente novamente.',
      err?.details,
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
