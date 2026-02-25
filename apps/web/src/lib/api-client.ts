import type { ApiHealthResponse, AuthResponseDto } from '@repo/shared-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
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
    throw new ApiError(`API request failed: ${response.status}`, response.status);
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
