import type { DocumentAttachment, SubjectDocument } from '@/types/document';

export type DocumentPreviewMode = 'pdf' | 'image' | 'docx' | 'pptx' | 'none';

const MIME_EXTENSION_MAP: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'text/plain': 'txt',
  'text/csv': 'csv',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

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

export function getDocumentFileExtension(doc: SubjectDocument): string {
  const candidate = (doc.original_filename ?? doc.file_name ?? '').trim();
  const match = /\.([a-z0-9]+)$/i.exec(candidate);
  if (match?.[1]) return match[1].toLowerCase();

  const mime = getDocumentMime(doc);
  return MIME_EXTENSION_MAP[mime] ?? 'file';
}
