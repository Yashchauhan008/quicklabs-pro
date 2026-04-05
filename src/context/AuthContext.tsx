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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  clearApiScopeCookie,
  getApiScope,
  roleToApiScope,
  setApiScopeCookie,
  type ApiScope,
} from '@/utils/apiScope';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const defaultAuthUser = JSON.parse(Cookies.get('user') || 'null');
const defaultAccessToken = Cookies.get('token') || null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [authUser, setAuthUser] = useState<AuthUser | null>(defaultAuthUser);
  const [token, setToken] = useState<string | null>(defaultAccessToken);

  /**
   * Query key MUST include the session token. A single key `['authMeta']` reused
   * the previous user's cached profile after logout/login (staleTime kept it "fresh").
   */
  const { data: authMetaResponse, isLoading: isLoadingUser } = useQuery({
    queryKey: ['authMeta', token],
    queryFn: getAuthMeta,
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const user: User | null = useMemo(() => {
    if (!authMetaResponse?.data) return null;
    return authMetaResponse.data;
  }, [authMetaResponse]);

  const apiScope: ApiScope = useMemo(() => {
    const role = user?.role ?? authUser?.role;
    if (role !== undefined && role !== null && role !== '') {
      return roleToApiScope(role);
    }
    return getApiScope();
  }, [user?.role, authUser?.role]);

  const isLoggedIn = !!token;

  const cookiePath = '/';

  function login(authUser: AuthUser, token: string, expiresAt: string) {
    Cookies.set('user', JSON.stringify(authUser), {
      expires: new Date(expiresAt),
      path: cookiePath,
    });
    Cookies.set('token', token, {
      expires: new Date(expiresAt),
      path: cookiePath,
    });
    setApiScopeCookie(authUser.role, expiresAt);
    setAuthUser(authUser);
    setToken(token);
  }

  function logout() {
    Cookies.remove('user', { path: cookiePath });
    Cookies.remove('token', { path: cookiePath });
    clearApiScopeCookie();
    setAuthUser(null);
    setToken(null);
    /** Drop cached API data so the next login never sees the previous account */
    queryClient.clear();
  }

  const value: AuthContextType = {
    authUser,
    user,
    token,
    apiScope,
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
