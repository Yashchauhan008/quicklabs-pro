import { serverDetails } from '@/config';

export function getFileUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Ensure we don't have double slashes
  const baseUrl = serverDetails.serverProxyURL.endsWith('/') 
    ? serverDetails.serverProxyURL.slice(0, -1) 
    : serverDetails.serverProxyURL;
    
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
}
