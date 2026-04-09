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
export type EnquiryTopic = 'subject' | 'document' | 'report' | 'other';
export type EnquirySort = 'recent' | 'priority';

export interface Enquiry {
  id: string;
  title: string;
  description?: string;
  topic: EnquiryTopic;
  subject_id?: string | null;
  document_id?: string | null;
  is_private: boolean;
  status: EnquiryStatus;
  upvotes?: number;
  downvotes?: number;
  score?: number;
  my_vote?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEnquiryData {
  title: string;
  description: string;
  topic: EnquiryTopic;
  subject_id?: string;
  document_id?: string;
  is_private?: boolean;
}

export interface EnquiryListParams {
  page?: number;
  limit?: number;
  status?: EnquiryStatus;
  sort?: EnquirySort;
}

export interface VoteEnquiryData {
  vote: 'up' | 'down';
}
