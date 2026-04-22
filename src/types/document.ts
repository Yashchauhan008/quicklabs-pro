export type DocumentKind = 'informational' | 'lab_solutions';

export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  informational: 'Informational',
  lab_solutions: 'Lab / solutions',
};

export type DocumentVisibility = 'PUBLIC' | 'PRIVATE';

/** Single file row under a document (from `document_files` + `files`). */
export interface DocumentAttachment {
  id: string;
  file_id: string;
  /** Short display name (1–50 chars), shown in UI instead of storage key */
  title: string;
  is_main: boolean;
  description: string | null;
  sort_order: number;
  file_key: string;
  file_size: number | null;
  file_mime_type: string | null;
}

export interface SubjectDocument {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  visibility: DocumentVisibility;
  kind?: DocumentKind;
  /** Main file (list cards) — from join */
  file_name?: string;
  original_filename?: string;
  mime_type?: string;
  /** Some APIs expose this name for the stored file MIME */
  file_mime_type?: string | null;
  file_size?: number;
  /** Number of attachments */
  file_count?: number;
  /** Detail API: all attachments */
  files?: DocumentAttachment[];
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
  university_id?: string | null;
  branch_id?: string | null;
  batch_year?: number | null;
  semester?: number | null;
  university_name?: string | null;
  branch_name?: string | null;
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
