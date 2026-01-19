import {
  createContext,
  useContext,
  type ReactNode,
  useMemo,
  useState,
} from 'react';

import type { AuthUser, AuthContextType } from '@/types/auth.type';
import type { User } from '@/types/user.type';
import Cookies from 'js-cookie';
import { getAuthMeta } from '@/services/api/auth';
import { useQuery } from '@tanstack/react-query';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const defaultAuthUser = JSON.parse(Cookies.get('user') || 'null');
const defaultAccessToken = Cookies.get('token') || null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(defaultAuthUser);
  const [token, setToken] = useState<string | null>(defaultAccessToken);

  //todo:what is happens in usequiry
  const { data: authMetaResponse, isLoading: isLoadingUser } = useQuery({
    queryKey: ['authMeta'],
    queryFn: getAuthMeta,
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const user: User | null = useMemo(() => {
    if (!authMetaResponse?.data) return null;
    return authMetaResponse.data;
  }, [authMetaResponse]);

  const isLoggedIn = !!token;

  function login(authUser: AuthUser, token: string, expiresAt: string) {
    Cookies.set('user', JSON.stringify(authUser), {
      expires: new Date(expiresAt),
    });
    Cookies.set('token', token, { expires: new Date(expiresAt) });
    setAuthUser(authUser);
    setToken(token);
  }

  function logout() {
    Cookies.remove('user');
    Cookies.remove('token');
    setAuthUser(null);
    setToken(null);
  }

  const value: AuthContextType = {
    authUser,
    user,
    token,
    isLoggedIn,
    login,
    logout,
    isLoadingUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}