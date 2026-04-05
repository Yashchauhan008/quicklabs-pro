export interface Subject {
  id: string;
  name: string;
  description: string | null;
  created_by?: string;
  /** API list/detail join (preferred) */
  creator_id?: string;
  creator_name?: string | null;
  creator_email?: string | null;
  creator_profile_picture_url?: string | null;
  /** Legacy / alternate naming */
  created_by_name?: string | null;
  created_by_profile_picture_url?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CreateSubjectData {
  name: string;
  description?: string;
}

export interface UpdateSubjectData {
  name?: string;
  description?: string;
}

export interface SubjectListParams {
  page?: number;
  limit?: number;
  search?: string;
  created_by?: string;
}
