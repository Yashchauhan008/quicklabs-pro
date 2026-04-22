import type { SocialProfile } from '@/types/student';

export interface User {
  id: string;
  name: string;
  email: string;
  /** Backend role; selects API scope `/api/admin/...` vs `/api/students/...` */
  role?: string;
  social_profiles?: SocialProfile[] | null;
  bio?: string | null;
  batch_year?: number | null;
  semester?: number | null;
  university_id?: string | null;
  branch_id?: string | null;
  university_name?: string | null;
  /** Same origin path as `profile_picture_url`; use `resolvePublicFileUrl` for images */
  university_logo_url?: string | null;
  branch_name?: string | null;
  /** Path served under GET /files/... — use resolvePublicFileUrl for `<img src>` */
  profile_picture_url?: string | null;
  total_courses?: number;
  total_files?: number;
  created_at: string;
  updated_at: string;
}