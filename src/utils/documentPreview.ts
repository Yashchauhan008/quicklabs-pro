import type { SubjectDocument } from '@/types/document';

export type DocumentPreviewMode = 'pdf' | 'image' | 'docx' | 'none';

/** Prefer API `file_mime_type`, then `mime_type`. */
export function getDocumentMime(doc: SubjectDocument): string {
  return (doc.file_mime_type ?? doc.mime_type ?? '')
    .toLowerCase()
    .trim();
}

/** Inline preview: PDF, images, and Word .docx only. ZIP, legacy .doc, etc. → none. */
export function getDocumentPreviewMode(doc: SubjectDocument): DocumentPreviewMode {
  const mime = getDocumentMime(doc);
  const name = (doc.original_filename || doc.file_name || '').toLowerCase();

  if (mime === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (mime.startsWith('image/')) return 'image';
  if (
    mime ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    return 'docx';
  }
  return 'none';
}
