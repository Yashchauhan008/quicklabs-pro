import axiosInstance from './httpRequest';
import { PRIVATE_STATIC_ACCESS_TOKEN } from '@/config';
import type { Branch, University } from '@/types/academic';
import { parsePaginatedList } from '@/utils/parseApiResponse';

const metaHeaders = PRIVATE_STATIC_ACCESS_TOKEN
  ? {
      Authorization: `Bearer ${PRIVATE_STATIC_ACCESS_TOKEN}`,
      'X-Skip-Forbidden-Toast': '1',
    }
  : undefined;

export async function getUniversities(params?: { page?: number; limit?: number; search?: string }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 50;
  const body = await axiosInstance({
    method: 'GET',
    url: '/api/meta/universities',
    params: { ...params, page, limit },
    headers: metaHeaders,
  });
  return parsePaginatedList<University>(body, { page, limit });
}

export function createUniversity(data: FormData) {
  return axiosInstance({
    method: 'POST',
    url: '/api/meta/universities',
    data,
    headers: metaHeaders,
  });
}

export function updateUniversity(id: string, data: { name: string }) {
  const payload = new FormData();
  payload.append('name', data.name);
  return axiosInstance({
    method: 'PUT',
    url: `/api/meta/universities/${id}`,
    data: payload,
    headers: metaHeaders,
  });
}

export function deleteUniversity(id: string) {
  return axiosInstance({
    method: 'DELETE',
    url: `/api/meta/universities/${id}`,
    headers: metaHeaders,
  });
}

export async function getBranches(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 100;
  const body = await axiosInstance({
    method: 'GET',
    url: '/api/meta/branches',
    params: { ...params, page, limit },
    headers: metaHeaders,
  });
  return parsePaginatedList<Branch>(body, { page, limit });
}

export function createBranch(data: { name: string }) {
  return axiosInstance({
    method: 'POST',
    url: '/api/meta/branches',
    data,
    headers: metaHeaders,
  });
}

export function updateBranch(id: string, data: { name: string }) {
  return axiosInstance({
    method: 'PUT',
    url: `/api/meta/branches/${id}`,
    data,
    headers: metaHeaders,
  });
}

export function deleteBranch(id: string) {
  return axiosInstance({
    method: 'DELETE',
    url: `/api/meta/branches/${id}`,
    headers: metaHeaders,
  });
}

export async function getUniversitiesSimple() {
  const response = await getUniversities({ page: 1, limit: 500 });
  return response.items;
}

export async function getBranchesSimple() {
  const response = await getBranches({
    page: 1,
    limit: 500,
  });
  return response.items;
}
