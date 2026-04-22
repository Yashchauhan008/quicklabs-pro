export interface University {
  id: string;
  name: string;
  logo_url?: string | null;
  branch_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Branch {
  id: string;
  name: string;
  university_id?: string | null;
  university_name?: string | null;
  created_at?: string;
  updated_at?: string;
}
