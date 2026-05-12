import type { SubjectDocument } from '@/types/document';

/** Label when API omits display name */
export function displayMemberLabel(
  userId: string | null | undefined,
  preferredName?: string | null,
): string {
  const n = preferredName?.trim();
  if (n) return n;
  if (userId && userId.length >= 8) return `Member · ${userId.slice(0, 8)}…`;
  return 'Member';
}

/** Backend uses `uploader_*`; older shapes used `uploaded_by_*`. */
export function pickDocumentUploader(doc: SubjectDocument) {
  const id = doc.uploader_id ?? doc.uploaded_by;
  const name =
    doc.uploader_name?.trim() ||
    doc.uploaded_by_name?.trim() ||
    null;
  const profilePictureUrl =
    doc.uploader_profile_picture_url ??
    doc.uploaded_by_profile_picture_url ??
    null;
  return {
    id,
    name: name || undefined,
    profilePictureUrl,
    label: displayMemberLabel(id, name),
  };
}
