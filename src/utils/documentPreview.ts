import type { DocumentAttachment, SubjectDocument } from '@/types/document';

export type DocumentPreviewMode = 'pdf' | 'image' | 'docx' | 'pptx' | 'none';

export function displayNameFromFileKey(fileKey: string): string {
  const parts = fileKey.split(/[/\\]/);
  return parts[parts.length - 1] || fileKey;
}

/** User-facing label for an attachment (title from API; falls back to storage filename). */
export function attachmentDisplayTitle(att: DocumentAttachment): string {
  const t = att.title?.trim();
  if (t) return t;
  return displayNameFromFileKey(att.file_key);
}

/** Prefer API `file_mime_type`, then `mime_type`. */
export function getDocumentMime(doc: SubjectDocument): string {
  return (doc.file_mime_type ?? doc.mime_type ?? '')
    .toLowerCase()
    .trim();
}

function mimeAndNameFromAttachment(att: DocumentAttachment): {
  mime: string;
  name: string;
} {
  const mime = (att.file_mime_type ?? '').toLowerCase().trim();
  const name = displayNameFromFileKey(att.file_key).toLowerCase();
  return { mime, name };
}

/** Preview mode for a single attachment row. */
export function getAttachmentPreviewMode(att: DocumentAttachment): DocumentPreviewMode {
  const { mime, name } = mimeAndNameFromAttachment(att);

  if (mime === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (mime.startsWith('image/')) return 'image';
  if (
    mime ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    return 'docx';
  }
  if (
    mime ===
      'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    name.endsWith('.pptx')
  ) {
    return 'pptx';
  }
  return 'none';
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
  if (
    mime ===
      'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    name.endsWith('.pptx')
  ) {
    return 'pptx';
  }
  return 'none';
}
