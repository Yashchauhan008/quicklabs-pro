export type DocumentKind = 'informational' | 'lab_solutions';

export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  informational: 'Informational',
  lab_solutions: 'Lab / solutions',
};

export type DocumentVisibility = 'PUBLIC' | 'PRIVATE';

export interface SubjectDocument {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  visibility: DocumentVisibility;
  kind?: DocumentKind;
  file_name?: string;
  original_filename?: string;
  mime_type?: string;
  /** Some APIs expose this name for the stored file MIME */
  file_mime_type?: string | null;
  file_size?: number;
  download_count?: number;
  uploaded_by?: string;
  /** API join (preferred) */
  uploader_id?: string;
  uploader_name?: string | null;
  uploader_email?: string | null;
  uploader_profile_picture_url?: string | null;
  /** Legacy / alternate naming */
  uploaded_by_name?: string | null;
  uploaded_by_profile_picture_url?: string | null;
  subject_name?: string | null;
  rating_avg?: number | null;
  rating_count?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface DocumentListParams {
  page?: number;
  limit?: number;
  subject_id?: string;
  /** Filters `documents.kind` (not subject) */
  kind?: DocumentKind;
  visibility?: DocumentVisibility;
  uploaded_by?: string;
  search?: string;
}
