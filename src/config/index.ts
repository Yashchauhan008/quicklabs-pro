export const serverDetails = {
  serverProxyURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
};

export const googleConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
};

export const IS_DEVELOPMENT = import.meta.env.VITE_APP_ENV === 'development';
export const PRIVATE_STATIC_ACCESS_TOKEN =
  import.meta.env.VITE_PRIVATE_STATIC_ACCESS_TOKEN || '';
  
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
  /** Matches Postman `api_scope`: `admin` | `students` — used for `/api/{scope}/...` */
  export const API_SCOPE_COOKIE_NAME = 'api_scope';
  
  export const ROUTES = {
    // Public
    LOGIN: '/login',
    REGISTER: '/register',
    
    // Authenticated app (learning platform)
    DASHBOARD: '/learn/dashboard',
    PROFILE: '/learn/profile',
    PROFILE_EDIT: '/learn/profile/edit',
    SETTINGS: '/learn/settings',
    UNAUTHORIZED: '/learn/unauthorized',
    
    EXPLORE_COURSES: '/learn/courses',
    EXPLORE_MATERIALS: '/learn/materials',

    SUBJECTS: '/learn/subject',
    SUBJECT_CREATE: '/learn/subject/create',
    SUBJECT_DETAILS: '/learn/subject/:id',
    SUBJECT_EDIT: '/learn/subject/:id/edit',
    
    DOCUMENT_DETAILS: '/learn/document/:id',
    ADD_DOCUMENT: '/learn/document/add',

    PEERS: '/learn/peers',
    PEER_PROFILE: '/learn/peers/:peerId',
    ENQUIRIES: '/learn/enquiries',
    ENQUIRY_NEW: '/learn/enquiries/new',
    SUPER_DESK: '/learn/super-desk',
    LEADERBOARD: '/learn/leaderboard',
  } as const;