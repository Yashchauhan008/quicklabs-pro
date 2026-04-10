export const APP_NAME = 'LMS - Learning Management System';
export const APP_VERSION = '1.0.0';
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_FILE_SIZE = 75 * 1024 * 1024; // 75MB

export const DOCUMENT_VISIBILITY = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
} as const;

export const ALLOWED_DOCUMENT_TYPES = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'txt',
  'csv',
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
] as const;

/** For `<input type="file" accept={...}>` — includes extensions and PNG/JPEG mimes for pickers that omit extensions. */
export const DOCUMENT_FILE_ACCEPT = [
  ...ALLOWED_DOCUMENT_TYPES.map((t) => `.${t}`),
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/csv',
].join(',');