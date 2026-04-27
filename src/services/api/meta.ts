import axiosInstance from './httpRequest';
import { PRIVATE_STATIC_ACCESS_TOKEN } from '@/config';
import type { Branch, University } from '@/types/academic';
import { parsePaginatedList } from '@/utils/parseApiResponse';

const metaWriteHeaders = PRIVATE_STATIC_ACCESS_TOKEN
  ? {
      Authorization: `Bearer ${PRIVATE_STATIC_ACCESS_TOKEN}`,
      'X-Skip-Forbidden-Toast': '1',
    }
  : undefined;

async function getMetaListWithFallback<T>(
  url: string,
  params: { page: number; limit: number; search?: string },
) {
  try {
    const body = await axiosInstance({
      method: 'GET',
      url,
      params,
    });
    return parsePaginatedList<T>(body, { page: params.page, limit: params.limit });
  } catch (err) {
    if (!metaWriteHeaders) throw err;
    const body = await axiosInstance({
      method: 'GET',
      url,
      params,
      headers: metaWriteHeaders,
    });
    return parsePaginatedList<T>(body, { page: params.page, limit: params.limit });
  }
}

export async function getUniversities(params?: { page?: number; limit?: number; search?: string }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 50;
  return getMetaListWithFallback<University>('/api/meta/universities', {
    ...params,
    page,
    limit,
  });
}

export function createUniversity(data: FormData) {
  return axiosInstance({
    method: 'POST',
    url: '/api/meta/universities',
    data,
    headers: metaWriteHeaders,
  });
}

export function updateUniversity(id: string, data: { name: string }) {
  const payload = new FormData();
  payload.append('name', data.name);
  return axiosInstance({
    method: 'PUT',
    url: `/api/meta/universities/${id}`,
    data: payload,
    headers: metaWriteHeaders,
  });
}

export function deleteUniversity(id: string) {
  return axiosInstance({
    method: 'DELETE',
    url: `/api/meta/universities/${id}`,
    headers: metaWriteHeaders,
  });
}

export async function getBranches(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 100;
  return getMetaListWithFallback<Branch>('/api/meta/branches', {
    ...params,
    page,
    limit,
  });
}

export function createBranch(data: { name: string }) {
  return axiosInstance({
    method: 'POST',
    url: '/api/meta/branches',
    data,
    headers: metaWriteHeaders,
  });
}

export function updateBranch(id: string, data: { name: string }) {
  return axiosInstance({
    method: 'PUT',
    url: `/api/meta/branches/${id}`,
    data,
    headers: metaWriteHeaders,
  });
}

export function deleteBranch(id: string) {
  return axiosInstance({
    method: 'DELETE',
    url: `/api/meta/branches/${id}`,
    headers: metaWriteHeaders,
  });
}

export async function getUniversitiesSimple() {
  const response = await getUniversities({ page: 1, limit: 500 });
  return response.items;
}

export async function getBranchesSimple() {
  const PAGE_LIMIT = 200;
  const firstPage = await getBranches({
    page: 1,
    limit: PAGE_LIMIT,
  });

  const allItems = [...firstPage.items];
  const totalPages = firstPage.meta?.totalPages ?? 1;

  if (totalPages <= 1) {
    return allItems;
  }

  for (let page = 2; page <= totalPages; page += 1) {
    const pageData = await getBranches({
      page,
      limit: PAGE_LIMIT,
    });
    allItems.push(...pageData.items);
  }

  return allItems;
}
