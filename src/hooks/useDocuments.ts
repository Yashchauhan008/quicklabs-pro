import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  addDocumentAttachments,
  deleteDocument,
  deleteDocumentAttachment,
  downloadDocumentFile,
  getDocumentById,
  getDocuments,
  patchDocumentAttachment,
  updateDocument,
  type UpdateDocumentBody,
  uploadDocument,
} from '@/services/api/document';
import type { DocumentListParams } from '@/types/document';
import { subjectKeys } from '@/hooks/useSubjects';
import { getApiScope } from '@/utils/apiScope';

export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (params: DocumentListParams) =>
    [...documentKeys.lists(), getApiScope(), params] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) =>
    [...documentKeys.details(), getApiScope(), id] as const,
};

export function useGetDocuments(params?: DocumentListParams) {
  const { isLoggedIn, isLoadingUser } = useAuth();
  return useQuery({
    queryKey: documentKeys.list(params ?? {}),
    queryFn: () => getDocuments(params),
    enabled: isLoggedIn && !isLoadingUser,
  });
}

export function useGetDocument(id: string | undefined) {
  const { isLoggedIn, isLoadingUser } = useAuth();
  return useQuery({
    queryKey: documentKeys.detail(id ?? ''),
    queryFn: () => getDocumentById(id!),
    enabled: !!id && isLoggedIn && !isLoadingUser,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => uploadDocument(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subjectKeys.lists() });
      toast.success('File uploaded');
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || 'Upload failed');
    },
  });
}

export function useUpdateDocument(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateDocumentBody) => updateDocument(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
      toast.success('Saved');
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || 'Update failed');
    },
  });
}

export function useAddDocumentAttachments(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => addDocumentAttachments(documentId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(documentId) });
      toast.success('Files added');
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || 'Upload failed');
    },
  });
}

export function usePatchDocumentAttachment(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      attachmentId,
      body,
    }: {
      attachmentId: string;
      body: { title?: string; description?: string; is_main?: boolean };
    }) => patchDocumentAttachment(documentId, attachmentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(documentId) });
      toast.success('Updated');
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || 'Update failed');
    },
  });
}

export function useDeleteDocumentAttachment(documentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: string) =>
      deleteDocumentAttachment(documentId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(documentId) });
      toast.success('File removed');
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || 'Remove failed');
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permanent }: { id: string; permanent?: boolean }) =>
      deleteDocument(id, { permanent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      toast.success('File removed');
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || 'Delete failed');
    },
  });
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: async ({
      id,
      fallbackName,
    }: {
      id: string;
      fallbackName?: string;
    }) => {
      const { blob, filename } = await downloadDocumentFile(id);
      let name = filename || fallbackName || `document-${id}.zip`;
      if (name && !name.toLowerCase().endsWith('.zip')) {
        name = `${name.replace(/\.[^/.]+$/, '')}.zip`;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (err: unknown) => {
      toast.error(
        getApiErrorMessage(err) || 'Download failed',
      );
    },
  });
}
