import type { SocialProfile } from '@/types/student';

export interface User {
  id: string;
  name: string;
  email: string;
  /** Backend role; selects API scope `/api/admin/...` vs `/api/students/...` */
  role?: string;
  social_profiles?: SocialProfile[] | null;
  /** Path served under GET /files/... — use resolvePublicFileUrl for `<img src>` */
  profile_picture_url?: string | null;
  created_at: string;
  updated_at: string;
}