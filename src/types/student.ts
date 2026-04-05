export interface SocialProfile {
  key: string;
  value: string;
}

export interface PeerProfile {
  id: string;
  name: string;
  social_profiles?: SocialProfile[] | null;
  profile_picture_url?: string | null;
  rating_avg?: number | null;
  rating_count?: number;
}

/** From GET /api/students/bookmarks — same as peer profile plus pin time */
export interface BookmarkedPeer extends PeerProfile {
  pinned_at: string;
}

export type EnquiryStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export interface Enquiry {
  id: string;
  title: string;
  message?: string;
  status: EnquiryStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEnquiryData {
  title: string;
  message: string;
}

export interface EnquiryListParams {
  page?: number;
  limit?: number;
  status?: EnquiryStatus;
}
