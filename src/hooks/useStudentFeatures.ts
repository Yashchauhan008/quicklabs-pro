import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import {
  createEnquiry,
  deleteStudentProfilePicture,
  getPeerProfile,
  listBookmarkedPeers,
  listEnquiries,
  patchStudentProfile,
  pinPeer,
  rateDocument,
  ratePeerStudent,
  unpinPeer,
  uploadStudentProfilePicture,
  voteEnquiry,
} from '@/services/api/students';
import type { CreateEnquiryData, EnquiryListParams } from '@/types/student';
import type { SocialProfile } from '@/types/student';
import { documentKeys } from '@/hooks/useDocuments';
import { getApiErrorMessage } from '@/utils/apiError';
import { isStudentRole } from '@/utils/roles';

export const peerKeys = {
  all: ['peers'] as const,
  detail: (id: string) => [...peerKeys.all, id] as const,
};

export const enquiryKeys = {
  all: ['enquiries'] as const,
  lists: () => [...enquiryKeys.all, 'list'] as const,
  list: (params: EnquiryListParams) =>
    [...enquiryKeys.lists(), params] as const,
};

export const bookmarkKeys = {
  all: ['student-bookmarks'] as const,
  list: () => [...bookmarkKeys.all, 'list'] as const,
};

export function usePatchStudentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      social_profiles: SocialProfile[];
      bio?: string | null;
      batch_year?: number | null;
      semester?: number | null;
      university_id?: string | null;
      branch_id?: string | null;
    }) => patchStudentProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authMeta'] });
      toast.success('Profile updated');
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err) || 'Could not save links');
    },
  });
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export function useUploadStudentProfilePicture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      if (file.size > MAX_AVATAR_BYTES) {
        return Promise.reject(
          new Error('Image must be 5MB or smaller'),
        );
      }
      const fd = new FormData();
      fd.append('file', file);
      return uploadStudentProfilePicture(fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authMeta'] });
      queryClient.invalidateQueries({ queryKey: peerKeys.all });
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.list() });
      toast.success('Profile photo updated');
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err) || 'Could not upload photo');
    },
  });
}

export function useDeleteStudentProfilePicture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteStudentProfilePicture(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authMeta'] });
      queryClient.invalidateQueries({ queryKey: peerKeys.all });
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.list() });
      toast.success('Profile photo removed');
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err) || 'Could not remove photo');
    },
  });
}

export function useRateDocument(documentId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stars: number) =>
      rateDocument(documentId!, { stars }),
    onSuccess: () => {
      if (documentId) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.detail(documentId),
        });
        queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      }
      toast.success('Thanks for your rating');
    },
  });
}

export function useRatePeer(peerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stars: number) => ratePeerStudent(peerId!, { stars }),
    onSuccess: () => {
      if (peerId) {
        queryClient.invalidateQueries({ queryKey: peerKeys.detail(peerId) });
      }
      toast.success('Thanks for your rating');
    },
  });
}

export function useGetPeerProfile(peerId: string | undefined) {
  const { isLoggedIn, isLoadingUser } = useAuth();
  const enabled = !!peerId && isLoggedIn && !isLoadingUser;
  return useQuery({
    queryKey: peerKeys.detail(peerId ?? ''),
    queryFn: () => getPeerProfile(peerId!),
    enabled,
  });
}

export function useListBookmarkedPeers() {
  const { user, isLoggedIn, isLoadingUser } = useAuth();
  const enabled =
    isLoggedIn && !isLoadingUser && isStudentRole(user?.role ?? null);
  return useQuery({
    queryKey: bookmarkKeys.list(),
    queryFn: () => listBookmarkedPeers(),
    enabled,
  });
}

export function usePinPeer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (peerId: string) => pinPeer(peerId),
    onSuccess: (_, peerId) => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.list() });
      queryClient.invalidateQueries({ queryKey: peerKeys.detail(peerId) });
      toast.success('Saved to your pinned peers');
    },
  });
}

export function useUnpinPeer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (peerId: string) => unpinPeer(peerId),
    onSuccess: (_, peerId) => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.list() });
      queryClient.invalidateQueries({ queryKey: peerKeys.detail(peerId) });
      toast.success('Removed from pinned peers');
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err) || 'Could not remove pin');
    },
  });
}

export function useCreateEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEnquiryData) => createEnquiry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enquiryKeys.lists() });
      toast.success('Enquiry sent');
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err) || 'Could not send enquiry');
    },
  });
}

export function useListEnquiries(params?: EnquiryListParams) {
  const { isLoggedIn, isLoadingUser } = useAuth();
  const enabled = isLoggedIn && !isLoadingUser;
  return useQuery({
    queryKey: enquiryKeys.list(params ?? {}),
    queryFn: () => listEnquiries(params),
    enabled,
  });
}

export function useVoteEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enquiryId, vote }: { enquiryId: string; vote: 'up' | 'down' }) =>
      voteEnquiry(enquiryId, { vote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enquiryKeys.lists() });
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err) || 'Could not register vote');
    },
  });
}
