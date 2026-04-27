export interface Subject {
  id: string;
  name: string;
  description: string | null;
  created_by?: string;
  document_count?: number;
  total_download_count?: number;
  banner_url?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CreateSubjectData {
  name: string;
  description?: string;
  banner?: File;
}

export interface UpdateSubjectData {
  name?: string;
  description?: string;
  banner?: File;
  clear_banner?: boolean;
}

export interface SubjectListParams {
  page?: number;
  limit?: number;
  search?: string;
  created_by?: string;
}
