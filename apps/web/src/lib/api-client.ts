import type { ApiHealthResponse, AuthResponseDto } from '@repo/shared-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    let errorMessage = `API request failed: ${response.status}`;
    let details: unknown;

    try {
      const json = (await response.json()) as { message?: string | string[]; error?: string };
      details = json;
      if (Array.isArray(json.message) && json.message.length > 0) {
        errorMessage = json.message[0];
      } else if (typeof json.message === 'string' && json.message.trim().length > 0) {
        errorMessage = json.message;
      } else if (typeof json.error === 'string' && json.error.trim().length > 0) {
        errorMessage = json.error;
      }
    } catch {
      // Ignore body parse errors and keep generic message.
    }

    throw new ApiError(errorMessage, response.status, details);
  }

  return (await response.json()) as T;
}

export function getApiHealth(): Promise<ApiHealthResponse> {
  return request<ApiHealthResponse>('/health');
}

export function registerWithEmail(payload: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthResponseDto> {
  return request<AuthResponseDto>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginWithEmail(payload: {
  email: string;
  password: string;
}): Promise<AuthResponseDto> {
  return request<AuthResponseDto>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getMe(): Promise<AuthResponseDto> {
  return request<AuthResponseDto>('/auth/me');
}

export function refreshSession(): Promise<AuthResponseDto> {
  return request<AuthResponseDto>('/auth/refresh', {
    method: 'POST',
  });
}

export function logout(): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('/auth/logout', {
    method: 'POST',
  });
}

export async function ensureSession(): Promise<AuthResponseDto> {
  try {
    return await getMe();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await refreshSession();
      return getMe();
    }

    throw error;
  }
}

export function getGoogleAuthUrl(): string {
  return `${API_BASE_URL}/auth/google`;
}
