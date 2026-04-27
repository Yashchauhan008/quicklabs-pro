import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  createBranch,
  createUniversity,
  deleteBranch,
  deleteUniversity,
  getBranchesSimple,
  getBranches,
  getUniversities,
  updateBranch,
  updateUniversity,
} from '@/services/api/meta';

export const academicMetaKeys = {
  all: ['academic-meta'] as const,
  universities: () => [...academicMetaKeys.all, 'universities'] as const,
  branches: () => [...academicMetaKeys.all, 'branches'] as const,
  branchesByUniversity: (universityId?: string) =>
    [...academicMetaKeys.branches(), universityId ?? 'all'] as const,
};

export function useGetUniversities(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: [...academicMetaKeys.universities(), params],
    queryFn: () => getUniversities(params),
    retry: false,
  });
}

export function useGetBranches(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: [...academicMetaKeys.branches(), params],
    queryFn: () => getBranches(params),
    retry: false,
  });
}

export function useGetAllBranches() {
  return useQuery({
    queryKey: [...academicMetaKeys.branches(), 'all'],
    queryFn: getBranchesSimple,
    retry: false,
  });
}

export function useCreateUniversity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUniversity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicMetaKeys.universities() });
      toast.success('University created');
    },
  });
}

export function useUpdateUniversity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateUniversity(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicMetaKeys.universities() });
      toast.success('University updated');
    },
  });
}

export function useDeleteUniversity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUniversity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicMetaKeys.universities() });
      queryClient.invalidateQueries({ queryKey: academicMetaKeys.branches() });
      toast.success('University deleted');
    },
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicMetaKeys.branches() });
      toast.success('Branch created');
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateBranch(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicMetaKeys.branches() });
      toast.success('Branch updated');
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicMetaKeys.branches() });
      toast.success('Branch deleted');
    },
  });
}
