// import type { User } from './user.type';

// export interface AuthUser {
//   id: string;
//   name: string;
//   email: string;
//   is_root_user: boolean;
// }

// export interface AuthResponse {
//   success: boolean;
//   message?: string;
//   data?: {
//     user: User;
//     token: string;
//   };
// }

// export interface LoginCredentials {
//   email: string;
//   password: string;
// }

// export interface RegisterCredentials {
//   name: string;
//   email: string;
//   password: string;
// }

// export interface AuthMeta {
//   id: string;
//   name: string;
//   email: string;
//   created_at: string;
//   updated_at: string;
// }
// export interface AuthContextType {
//   authUser: AuthUser | null;
//   user: User | null;
//   token: string | null;
//   isLoggedIn: boolean;
//   isLoadingUser: boolean;
//   login: (authUser: AuthUser, token: string, expiresAt: string) => void;
//   logout: () => void;
// }
export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  is_root_user: boolean;
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
  isLoggedIn: boolean;
  isLoadingUser: boolean;
  login: (authUser: AuthUser, token: string, expiresAt: string) => void;
  logout: () => void;
}