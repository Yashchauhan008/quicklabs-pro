import { serverDetails } from '@/config';

/**
 * Backend returns paths like `/files/avatars/{key}` — prepend API origin for `<img src>`.
 * Absolute `http(s)://` URLs are returned unchanged.
 */
export function resolvePublicFileUrl(
  path: string | null | undefined,
): string | null {
  if (path == null || typeof path !== 'string') return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = serverDetails.serverProxyURL.replace(/\/$/, '');
  const p = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${p}`;
}
