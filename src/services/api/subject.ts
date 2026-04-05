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
  return axiosInstance({
    method: 'POST',
    url: scopedApiUrl('/subjects'),
    data,
  });
}

export function updateSubject(id: string, data: UpdateSubjectData) {
  return axiosInstance({
    method: 'PUT',
    url: scopedApiUrl(`/subjects/${id}`),
    data,
  });
}

export function deleteSubject(id: string) {
  return axiosInstance({
    method: 'DELETE',
    url: scopedApiUrl(`/subjects/${id}`),
  });
}
