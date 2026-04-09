import axios from 'axios';
import Cookies from 'js-cookie';
import axiosInstance from './httpRequest';
import { serverDetails } from '@/config';
import type { DocumentListParams, SubjectDocument } from '@/types/document';
import { parseEntity, parsePaginatedList } from '@/utils/parseApiResponse';
import { clearApiScopeCookie, scopedApiUrl } from '@/utils/apiScope';

export async function getDocuments(params?: DocumentListParams) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const body = await axiosInstance({
    method: 'GET',
    url: scopedApiUrl('/documents'),
    params: { ...params, page, limit },
  });
  return parsePaginatedList<SubjectDocument>(body, { page, limit });
}

export async function getDocumentById(id: string) {
  const body = await axiosInstance({
    method: 'GET',
    url: scopedApiUrl(`/documents/${id}`),
  });
  return parseEntity<SubjectDocument>(body);
}

export function uploadDocument(formData: FormData) {
  return axiosInstance({
    method: 'POST',
    url: scopedApiUrl('/documents'),
    data: formData,
  });
}

export function updateDocument(id: string, formData: FormData) {
  return axiosInstance({
    method: 'PUT',
    url: scopedApiUrl(`/documents/${id}`),
    data: formData,
  });
}

export function deleteDocument(id: string, options?: { permanent?: boolean }) {
  return axiosInstance({
    method: 'DELETE',
    url: scopedApiUrl(`/documents/${id}`),
    params: options?.permanent ? { permanent: 'true' } : undefined,
  });
}

/**
 * Download uses a raw axios call so we can read `Content-Disposition` for the filename.
 */
export async function downloadDocumentFile(
  id: string,
  options?: {
    onProgress?: (progress: { loaded: number; total?: number; percent?: number }) => void;
  },
): Promise<{
  blob: Blob;
  filename: string | null;
  /** Response `Content-Type` (no params); often `application/octet-stream` for downloads */
  contentType: string | null;
}> {
  const token = Cookies.get('token');
  let res;
  try {
    res = await axios.get(
      `${serverDetails.serverProxyURL}${scopedApiUrl(`/documents/${id}/download`)}`,
      {
        responseType: 'blob',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        onDownloadProgress: (event) => {
          if (!options?.onProgress) return;
          const loaded = event.loaded ?? 0;
          const total = event.total ?? undefined;
          const percent =
            total && total > 0
              ? Math.min(100, Math.round((loaded / total) * 100))
              : undefined;
          options.onProgress({ loaded, total, percent });
        },
      },
    );
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      Cookies.remove('user', { path: '/' });
      Cookies.remove('token', { path: '/' });
      clearApiScopeCookie();
      window.location.href = '/login';
    }
    if (axios.isAxiosError(e) && e.response?.status === 429) {
      let msg =
        'Daily download limit reached. Try again after midnight UTC.';
      const data = e.response.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const j = JSON.parse(text) as { message?: string };
          if (j?.message) msg = j.message;
        } catch {
          /* keep default */
        }
      } else if (data && typeof data === 'object' && 'message' in data) {
        const m = (data as { message?: string }).message;
        if (typeof m === 'string' && m) msg = m;
      }
      throw { message: msg, code: 'too_many_requests' };
    }
    throw e;
  }

  const disposition = res.headers['content-disposition'] as string | undefined;
  let filename: string | null = null;
  if (disposition) {
    const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(disposition);
    if (match?.[1]) {
      try {
        filename = decodeURIComponent(match[1].trim());
      } catch {
        filename = match[1].trim();
      }
    }
  }

  const rawCt = res.headers['content-type'];
  const contentType =
    typeof rawCt === 'string' ? rawCt.split(';')[0].trim() : null;

  return { blob: res.data as Blob, filename, contentType };
}
