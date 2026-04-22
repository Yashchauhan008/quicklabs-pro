import { useMemo, useRef, useState, type ReactNode } from 'react';
import { generatePath } from 'react-router-dom';
import { useGetSubjects } from '@/hooks/useSubjects';
import { useGetDocuments } from '@/hooks/useDocuments';
import { ROUTES } from '@/config';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { cn } from '@/lib/utils';
import { BookOpen, Camera, FileText, GraduationCap, Star } from 'lucide-react';
import { formatDate } from '@/utils/formate';
import { Skeleton } from '@/components/ui/skeleton';
import type { SocialProfile } from '@/types/student';
import type { ProfileTab } from '@/utils/profileUrls';
import { MaterialCard } from '@/components/shared/MaterialCard';
import { SubjectCard } from '@/components/shared/SubjectCard';
import { getSocialFaviconUrl, normalizeSocialUrl } from '@/utils/socialLink';
import { resolvePublicFileUrl } from '@/utils/publicFileUrl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';

function SocialLinkItem({ profile }: { profile: SocialProfile }) {
  const [iconFailed, setIconFailed] = useState(false);
  const href = normalizeSocialUrl(profile.value);
  const faviconUrl = getSocialFaviconUrl(profile.value);

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/65 px-2.5 py-1 text-sm font-medium text-foreground/90 transition-colors hover:border-primary/40 hover:text-primary"
    >
      {!iconFailed && faviconUrl ? (
        <img
          src={faviconUrl}
          alt={`${profile.key} favicon`}
          className="h-4 w-4 shrink-0 rounded-sm"
          loading="lazy"
          decoding="async"
          onError={() => setIconFailed(true)}
        />
      ) : (
        <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-muted text-[10px] font-semibold uppercase text-muted-foreground">
          {profile.key.slice(0, 1) || 'L'}
        </span>
      )}
      <span className="max-w-56 truncate">{profile.key}</span>
    </a>
  );
}

export type InstagramProfileLayoutProps = {
  userId: string;
  name: string;
  profilePictureUrl?: string | null;
  email?: string | null;
  role?: string | null;
  socialProfiles?: SocialProfile[] | null;
  bio?: string | null;
  batchYear?: number | null;
  semester?: number | null;
  universityName?: string | null;
  /** Public path for university mark; same resolution as avatars */
  universityLogoUrl?: string | null;
  branchName?: string | null;
  createdAt?: string | null;
  ratingAvg?: number | null;
  ratingCount?: number;
  totalCourses?: number;
  totalMaterials?: number;
  tab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  /** e.g. pin / rate for peer view */
  headerActions?: ReactNode;
  canEditProfilePicture?: boolean;
  isUploadingPicture?: boolean;
  isRemovingPicture?: boolean;
  onUploadProfilePicture?: (file: File) => Promise<void> | void;
  onRemoveProfilePicture?: () => Promise<void> | void;
};

function InstagramProfileLayout({
  userId,
  name,
  profilePictureUrl,
  socialProfiles,
  bio,
  batchYear,
  semester,
  universityName,
  universityLogoUrl,
  branchName,
  createdAt,
  ratingAvg,
  ratingCount,
  totalCourses,
  totalMaterials,
  tab,
  onTabChange,
  headerActions,
  canEditProfilePicture = false,
  isUploadingPicture = false,
  isRemovingPicture = false,
  onUploadProfilePicture,
  onRemoveProfilePicture,
}: InstagramProfileLayoutProps) {
  const [pictureDialogOpen, setPictureDialogOpen] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const listSubjectParams = useMemo(
    () => ({ created_by: userId, page: 1, limit: 48 }),
    [userId],
  );
  const listDocParams = useMemo(
    () => ({ uploaded_by: userId, page: 1, limit: 48 }),
    [userId],
  );

  const { data: subjectsData, isLoading: subjLoading } =
    useGetSubjects(listSubjectParams);
  const { data: documentsData, isLoading: docLoading } =
    useGetDocuments(listDocParams);

  const courseTotal = totalCourses ?? subjectsData?.meta.total ?? 0;
  const materialTotal = totalMaterials ?? documentsData?.meta.total ?? 0;
  const subjects = useMemo(() => subjectsData?.items ?? [], [subjectsData?.items]);
  const documents = useMemo(
    () => documentsData?.items ?? [],
    [documentsData?.items],
  );
  const subjectNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of subjects) {
      map.set(s.id, s.name);
    }
    return map;
  }, [subjects]);

  const showRating =
    ratingCount != null && ratingCount > 0 && ratingAvg != null;

  const universityLogoSrc = resolvePublicFileUrl(universityLogoUrl);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col gap-6 pb-8 sm:flex-row sm:items-start sm:gap-10">
        <div className="flex justify-center sm:block">
          <div className="relative">
            <UserAvatar
              profilePictureUrl={profilePictureUrl}
              name={name}
              size="lg"
              className="h-28 w-28 rounded-full border-2 border-border/80 text-3xl shadow-md sm:h-36 sm:w-36"
            />
            {canEditProfilePicture ? (
              <button
                type="button"
                className="absolute bottom-1 right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground shadow-md transition-colors hover:bg-muted"
                aria-label="Edit profile picture"
                onClick={() => setPictureDialogOpen(true)}
              >
                <Camera className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-left">
              {name}
            </h1>
            {headerActions ? (
              <div className="flex justify-center sm:justify-end">{headerActions}</div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-end justify-center gap-5 sm:justify-start sm:gap-6">
            <button
              type="button"
              onClick={() => onTabChange('documents')}
              className={cn(
                'text-center transition-opacity hover:opacity-90',
                tab === 'documents' ? 'opacity-100' : 'opacity-80',
              )}
            >
              <span className="block text-lg font-semibold tabular-nums leading-none">
                {materialTotal}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {materialTotal === 1 ? 'material' : 'materials'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('subjects')}
              className={cn(
                'text-center transition-opacity hover:opacity-90',
                tab === 'subjects' ? 'opacity-100' : 'opacity-80',
              )}
            >
              <span className="block text-lg font-semibold tabular-nums leading-none">
                {courseTotal}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {courseTotal === 1 ? 'course' : 'courses'}
              </span>
            </button>
            {universityName ? (
              <div
                className="min-w-0 max-w-46 text-center sm:max-w-50 sm:border-l sm:border-border/25 sm:pl-5"
                title={universityName}
              >
                <div className="flex min-h-6 items-center justify-center sm:min-h-7 sm:justify-center">
                  {universityLogoSrc ? (
                    <img
                      src={universityLogoSrc}
                      alt=""
                      className="h-5 w-5 object-contain sm:h-6 sm:w-6"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <GraduationCap
                      className="h-5 w-5 text-muted-foreground/70 sm:h-6 sm:w-6"
                      aria-hidden
                    />
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
                  {universityName}
                </p>
              </div>
            ) : null}
            {showRating ? (
              <div className="text-center">
                <span className="inline-flex items-center justify-center gap-1 text-lg font-semibold tabular-nums leading-none">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {Number(ratingAvg).toFixed(1)}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {ratingCount} rating{ratingCount === 1 ? '' : 's'}
                </span>
              </div>
            ) : null}
          </div>

          <div className="space-y-3 text-center sm:text-left">
            {bio ? (
              <p className="whitespace-pre-line text-sm text-muted-foreground">{bio}</p>
            ) : null}
            {branchName || batchYear != null || semester != null ? (
              <p className="text-xs text-muted-foreground">
                {[
                  branchName,
                  batchYear != null ? `Batch ${String(batchYear)}` : null,
                  semester != null
                    ? semester === 0
                      ? 'Passout'
                      : `Sem ${String(semester)}`
                    : null,
                ]
                  .filter((x) => x != null && x !== '')
                  .join(' · ')}
              </p>
            ) : null}
            {createdAt ? (
              <p className="text-xs text-muted-foreground">
                Member since {formatDate(createdAt)}
              </p>
            ) : null}
          </div>

          {socialProfiles && socialProfiles.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 sm:justify-start">
              {socialProfiles.map((p) => (
                <SocialLinkItem key={`${p.key}-${p.value}`} profile={p} />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {canEditProfilePicture ? (
        <Dialog open={pictureDialogOpen} onOpenChange={setPictureDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update profile picture</DialogTitle>
              <DialogDescription>
                Upload a new image or remove your current one.
              </DialogDescription>
            </DialogHeader>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f && onUploadProfilePicture) {
                  void Promise.resolve(onUploadProfilePicture(f)).then(() =>
                    setPictureDialogOpen(false),
                  );
                }
              }}
            />
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
              <UserAvatar
                profilePictureUrl={profilePictureUrl}
                name={name}
                size="md"
                className="h-12 w-12 rounded-xl"
              />
              <div>
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP up to 5MB
                </p>
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPicture}
              >
                {isUploadingPicture ? 'Uploading…' : 'Upload new photo'}
              </Button>
              {profilePictureUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-muted-foreground"
                  disabled={isRemovingPicture}
                  onClick={() => setRemoveConfirmOpen(true)}
                >
                  {isRemovingPicture ? 'Removing…' : 'Remove photo'}
                </Button>
              ) : null}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
      <ConfirmationModal
        open={removeConfirmOpen}
        onOpenChange={setRemoveConfirmOpen}
        title="Remove profile photo?"
        description="This will remove your current profile picture from your account."
        confirmText="Remove"
        variant="destructive"
        isProcessing={isRemovingPicture}
        onConfirm={async () => {
          if (!onRemoveProfilePicture) return;
          await Promise.resolve(onRemoveProfilePicture());
          setRemoveConfirmOpen(false);
          setPictureDialogOpen(false);
        }}
      />

      <div className="sticky top-14 z-1 -mx-4 bg-background/20 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/15 md:top-0 md:mx-0 md:px-0">
        <div className="mx-auto flex max-w-3xl justify-end">
          <div className="inline-flex items-center gap-1 rounded-2xl border border-violet-200/50 bg-white/45 p-1 shadow-md ring-1 ring-black/5 backdrop-blur-lg dark:border-violet-500/15 dark:bg-background/45 dark:ring-white/10">
          <button
            type="button"
            onClick={() => onTabChange('documents')}
            className={cn(
              'flex min-w-[130px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all',
              tab === 'documents'
                ? 'bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                : 'text-muted-foreground hover:bg-violet-500/10 hover:text-foreground',
            )}
          >
            <FileText className="h-4 w-4" />
            Materials
          </button>
          <button
            type="button"
            onClick={() => onTabChange('subjects')}
            className={cn(
              'flex min-w-[130px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all',
              tab === 'subjects'
                ? 'bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                : 'text-muted-foreground hover:bg-violet-500/10 hover:text-foreground',
            )}
          >
            <BookOpen className="h-4 w-4" />
            Courses
          </button>
          </div>
        </div>
      </div>

      <div className="pt-6">
        {tab === 'subjects' ? (
          subjLoading ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No courses to show yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {subjects.map((s) => (
                <SubjectCard
                  key={s.id}
                  subject={s}
                  href={generatePath(ROUTES.SUBJECT_DETAILS, { id: s.id })}
                  compact
                  showCreator={false}
                />
              ))}
            </div>
          )
        ) : docLoading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No materials to show yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {documents.map((d) => (
              <MaterialCard
                key={d.id}
                document={d}
                href={generatePath(ROUTES.DOCUMENT_DETAILS, { id: d.id })}
                courseName={d.subject_name ?? subjectNameById.get(d.subject_id) ?? 'Course'}
                compact
                showUploader={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { InstagramProfileLayout };
export default InstagramProfileLayout;
