export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  provider: 'local' | 'google';
  createdAt: string;
}
