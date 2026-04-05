import { ROUTES } from '@/config';

export type ProfileTab = 'subjects' | 'documents';

export function profileUrl(tab?: ProfileTab): string {
  if (tab === 'documents') return `${ROUTES.PROFILE}?tab=documents`;
  return ROUTES.PROFILE;
}
