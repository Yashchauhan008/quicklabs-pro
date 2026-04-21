import axiosInstance from './httpRequest';
import type {
  CreateSubjectData,
  Subject,
  SubjectListParams,
  UpdateSubjectData,
} from '@/types/subject';
import { parseEntity, parsePaginatedList } from '@/utils/parseApiResponse';
import { scopedApiUrl } from '@/utils/apiScope';

export async function getSubjects(params?: SubjectListParams) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const body = await axiosInstance({
    method: 'GET',
    url: scopedApiUrl('/subjects'),
    params: { ...params, page, limit },
  });
  return parsePaginatedList<Subject>(body, { page, limit });
}

export async function getSubjectById(id: string) {
  const body = await axiosInstance({
    method: 'GET',
    url: scopedApiUrl(`/subjects/${id}`),
  });
  return parseEntity<Subject>(body);
}

export function createSubject(data: CreateSubjectData) {
  const formData = new FormData();
  formData.append('name', data.name);
  if (data.description) formData.append('description', data.description);
  if (data.banner) formData.append('banner', data.banner);
  return axiosInstance({
    method: 'POST',
    url: scopedApiUrl('/subjects'),
    data: formData,
  });
}

export function updateSubject(id: string, data: UpdateSubjectData) {
  const formData = new FormData();
  if (data.name !== undefined) formData.append('name', data.name);
  if (data.description !== undefined) formData.append('description', data.description);
  if (data.banner) formData.append('banner', data.banner);
  if (data.clear_banner) formData.append('clear_banner', 'true');
  return axiosInstance({
    method: 'PUT',
    url: scopedApiUrl(`/subjects/${id}`),
    data: formData,
  });
}

export function deleteSubject(id: string) {
  return axiosInstance({
    method: 'DELETE',
    url: scopedApiUrl(`/subjects/${id}`),
  });
}
