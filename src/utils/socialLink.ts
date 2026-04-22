export function normalizeSocialUrl(rawUrl: string): string {
  const value = rawUrl.trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export function getSocialHostname(rawUrl: string): string | null {
  const normalized = normalizeSocialUrl(rawUrl);
  if (!normalized) return null;
  try {
    return new URL(normalized).hostname;
  } catch {
    return null;
  }
}

export function getSocialFaviconUrl(rawUrl: string): string | null {
  const hostname = getSocialHostname(rawUrl);
  if (!hostname) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`;
}
