export const APP_NAME = 'LMS - Learning Management System';
export const APP_VERSION = '1.0.0';
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

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
];