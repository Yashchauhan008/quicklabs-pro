import axiosInstance from './httpRequest';
import type {
  BookmarkedPeer,
  CreateEnquiryData,
  Enquiry,
  EnquiryListParams,
  PeerProfile,
  SocialProfile,
  VoteEnquiryData,
} from '@/types/student';
import { parseEntity, parsePaginatedList } from '@/utils/parseApiResponse';

const BASE = '/api/students';

export function patchStudentProfile(data: {
  social_profiles: SocialProfile[];
  bio?: string | null;
  batch_year?: number | null;
  semester?: number | null;
  university_id?: string | null;
  branch_id?: string | null;
}) {
  return axiosInstance({
    method: 'PATCH',
    url: `${BASE}/profile`,
    data,
  });
}

export function uploadStudentProfilePicture(formData: FormData) {
  return axiosInstance({
    method: 'POST',
    url: `${BASE}/profile/picture`,
    data: formData,
  });
}

export function deleteStudentProfilePicture() {
  return axiosInstance({
    method: 'DELETE',
    url: `${BASE}/profile/picture`,
  });
}

export function rateDocument(documentId: string, body: { stars: number }) {
  return axiosInstance({
    method: 'POST',
    url: `${BASE}/ratings/documents/${documentId}`,
    data: body,
  });
}

export function ratePeerStudent(peerId: string, body: { stars: number }) {
  return axiosInstance({
    method: 'POST',
    url: `${BASE}/ratings/students/${peerId}`,
    data: body,
  });
}

export async function getPeerProfile(peerId: string) {
  const body = await axiosInstance({
    method: 'GET',
    url: `${BASE}/peers/${peerId}`,
  });
  return parseEntity<PeerProfile>(body);
}

export async function listBookmarkedPeers() {
  const body = await axiosInstance({
    method: 'GET',
    url: `${BASE}/bookmarks`,
  });
  if (!body || typeof body !== 'object') return [];
  const raw = (body as { data?: unknown }).data;
  if (Array.isArray(raw)) return raw as BookmarkedPeer[];
  if (
    raw &&
    typeof raw === 'object' &&
    Array.isArray((raw as { items?: unknown }).items)
  ) {
    return (raw as { items: BookmarkedPeer[] }).items;
  }
  return [];
}

export function pinPeer(peerId: string) {
  return axiosInstance({
    method: 'POST',
    url: `${BASE}/bookmarks/${peerId}`,
  });
}

export function unpinPeer(peerId: string) {
  return axiosInstance({
    method: 'DELETE',
    url: `${BASE}/bookmarks/${peerId}`,
  });
}

export function createEnquiry(data: CreateEnquiryData) {
  return axiosInstance({
    method: 'POST',
    url: `${BASE}/enquiries`,
    data,
  });
}

export async function listEnquiries(params?: EnquiryListParams) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const body = await axiosInstance({
    method: 'GET',
    url: `${BASE}/enquiries`,
    params: { ...params, page, limit },
  });
  return parsePaginatedList<Enquiry>(body, { page, limit });
}

export function voteEnquiry(enquiryId: string, data: VoteEnquiryData) {
  return axiosInstance({
    method: 'POST',
    url: `${BASE}/enquiries/${enquiryId}/votes`,
    data,
  });
}
