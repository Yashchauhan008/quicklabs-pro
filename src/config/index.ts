export const serverDetails = {
    serverProxyURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  };
  
  export const PERMISSIONS_CONFIG = {
    // Dashboard
    DASHBOARD: 'dashboard',
    
    // Subjects
    SUBJECTS_VIEW: 'subjects.view',
    SUBJECTS_CREATE: 'subjects.create',
    SUBJECTS_UPDATE: 'subjects.update',
    SUBJECTS_DELETE: 'subjects.delete',
    
    // Documents
    DOCUMENTS_VIEW: 'documents.view',
    DOCUMENTS_CREATE: 'documents.create',
    DOCUMENTS_UPDATE: 'documents.update',
    DOCUMENTS_DELETE: 'documents.delete',
    DOCUMENTS_DOWNLOAD: 'documents.download',
    
    // Help Desk
    HELPDESK_TICKETS: 'helpdesk.tickets',
    HELPDESK_USER_MANUAL: 'helpdesk.manual',
  } as const;
  
  export const TOKEN_COOKIE_NAME = 'token';
  export const USER_COOKIE_NAME = 'user';
  
  export const ROUTES = {
    // Public
    LOGIN: '/login',
    REGISTER: '/register',
    
    // Admin
    DASHBOARD: '/admin/dashboard',
    PROFILE: '/admin/profile',
    SETTINGS: '/admin/settings',
    UNAUTHORIZED: '/admin/unauthorized',
    
    // Subjects
    SUBJECTS: '/admin/subject',
    SUBJECT_DETAILS: '/admin/subject/:id',
    
    // Documents
    DOCUMENTS: '/admin/document',
    DOCUMENT_DETAILS: '/admin/document/:id',
    ADD_DOCUMENT: '/admin/document/add',
  } as const;