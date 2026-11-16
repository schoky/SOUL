const API_URL = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  status: number;

  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body !== undefined && options.body !== null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers
  });

  const contentType = response.headers.get('content-type');

  const data = contentType?.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    let message = 'API request failed';

    let code: string | undefined;

    if (data && typeof data === 'object' && 'error' in data) {
      const error = data.error;

      if (typeof error === 'string') {
        message = error;
      } else if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string'
      ) {
        message = error.message;

        if ('code' in error && typeof error.code === 'string') {
          code = error.code;
        }
      }
    }

    throw new ApiError(message, response.status, code);
  }

  return data as T;
}
