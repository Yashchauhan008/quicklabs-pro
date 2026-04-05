import Cookies from 'js-cookie';
import { API_SCOPE_COOKIE_NAME } from '@/config';

export type ApiScope = 'admin' | 'students';

export function roleToApiScope(role: string | undefined | null): ApiScope {
  return role === 'admin' ? 'admin' : 'students';
}

export function getApiScope(): ApiScope {
  const raw = Cookies.get(API_SCOPE_COOKIE_NAME);
  if (raw === 'admin' || raw === 'students') return raw;
  return 'students';
}

export function setApiScopeCookie(
  role: string | undefined | null,
  expires: Date | string,
) {
  const scope = roleToApiScope(role);
  Cookies.set(API_SCOPE_COOKIE_NAME, scope, {
    expires: typeof expires === 'string' ? new Date(expires) : expires,
    path: '/',
  });
}

export function clearApiScopeCookie() {
  Cookies.remove(API_SCOPE_COOKIE_NAME, { path: '/' });
}

/** e.g. `/subjects`, `/subjects/:id`, `/documents/:id/download` */
export function scopedApiUrl(relativePath: string): string {
  const scope = getApiScope();
  const p = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `/api/${scope}${p}`;
}
