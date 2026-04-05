import type { ApiScope } from '@/utils/apiScope';
import type { User } from './user.type';

export type { User };

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  is_root_user: boolean;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthContextType {
  authUser: AuthUser | null;
  user: User | null;
  token: string | null;
  apiScope: ApiScope;
  isLoggedIn: boolean;
  isLoadingUser: boolean;
  login: (authUser: AuthUser, token: string, expiresAt: string) => void;
  logout: () => void;
}
