export type FormStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type AuthProvider = 'local' | 'google';

export interface UserDto {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthUserDto {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  provider: AuthProvider;
  createdAt: string;
}

export interface AuthResponseDto {
  user: AuthUserDto;
}

export interface ApiHealthResponse {
  status: "ok";
  service: "api";
  timestamp: string;
}
