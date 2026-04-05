import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import {
  createSubject,
  deleteSubject,
  getSubjectById,
  getSubjects,
  updateSubject,
} from '@/services/api/subject';
import type { SubjectListParams, UpdateSubjectData } from '@/types/subject';
import type { CreateSubjectData } from '@/types/subject';
import { parseEntity } from '@/utils/parseApiResponse';
import { getApiScope } from '@/utils/apiScope';

export const subjectKeys = {
  all: ['subjects'] as const,
  lists: () => [...subjectKeys.all, 'list'] as const,
  list: (params: SubjectListParams) =>
    [...subjectKeys.lists(), getApiScope(), params] as const,
  details: () => [...subjectKeys.all, 'detail'] as const,
  detail: (id: string) =>
    [...subjectKeys.details(), getApiScope(), id] as const,
};

export function useGetSubjects(params?: SubjectListParams) {
  const { isLoggedIn, isLoadingUser } = useAuth();
  return useQuery({
    queryKey: subjectKeys.list(params ?? {}),
    queryFn: () => getSubjects(params),
    enabled: isLoggedIn && !isLoadingUser,
  });
}

export function useGetSubject(id: string | undefined) {
  const { isLoggedIn, isLoadingUser } = useAuth();
  return useQuery({
    queryKey: subjectKeys.detail(id ?? ''),
    queryFn: () => getSubjectById(id!),
    enabled: !!id && isLoggedIn && !isLoadingUser,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubjectData) => createSubject(data),
    onSuccess: (body) => {
      const created = parseEntity<{ id: string }>(body);
      queryClient.invalidateQueries({ queryKey: subjectKeys.lists() });
      if (created?.id) {
        queryClient.invalidateQueries({ queryKey: subjectKeys.detail(created.id) });
      }
      toast.success('Course created');
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || 'Could not create course');
    },
  });
}

export function useUpdateSubject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSubjectData) => updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subjectKeys.detail(id) });
      toast.success('Course updated');
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || 'Could not update course');
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subjectId: string) => deleteSubject(subjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.lists() });
      toast.success('Course removed');
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || 'Could not remove course');
    },
  });
}
