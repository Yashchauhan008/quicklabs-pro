import { useMemo, type ReactNode } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { useGetSubjects } from '@/hooks/useSubjects';
import { useGetDocuments } from '@/hooks/useDocuments';
import { ROUTES } from '@/config';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { cn } from '@/lib/utils';
import { BookOpen, FileText, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatFileSize, formatDate } from '@/utils/formate';
import {
  subjectDocumentCardClass,
  subjectDocumentIconClass,
} from '@/utils/subjectAccent';
import { DOCUMENT_KIND_LABELS } from '@/types/document';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { SocialProfile } from '@/types/student';
import type { ProfileTab } from '@/utils/profileUrls';

export type InstagramProfileLayoutProps = {
  userId: string;
  name: string;
  profilePictureUrl?: string | null;
  email?: string | null;
  role?: string | null;
  socialProfiles?: SocialProfile[] | null;
  createdAt?: string | null;
  ratingAvg?: number | null;
  ratingCount?: number;
  tab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  /** e.g. pin / rate for peer view */
  headerActions?: ReactNode;
};

export function InstagramProfileLayout({
  userId,
  name,
  profilePictureUrl,
  email,
  role,
  socialProfiles,
  createdAt,
  ratingAvg,
  ratingCount,
  tab,
  onTabChange,
  headerActions,
}: InstagramProfileLayoutProps) {
  const countParams = useMemo(
    () => ({ created_by: userId, page: 1, limit: 1 }),
    [userId],
  );
  const listSubjectParams = useMemo(
    () => ({ created_by: userId, page: 1, limit: 48 }),
    [userId],
  );
  const countDocParams = useMemo(
    () => ({ uploaded_by: userId, page: 1, limit: 1 }),
    [userId],
  );
  const listDocParams = useMemo(
    () => ({ uploaded_by: userId, page: 1, limit: 48 }),
    [userId],
  );

  const { data: subjCountData } = useGetSubjects(countParams);
  const { data: docCountData } = useGetDocuments(countDocParams);
  const { data: subjectsData, isLoading: subjLoading } =
    useGetSubjects(listSubjectParams);
  const { data: documentsData, isLoading: docLoading } =
    useGetDocuments(listDocParams);

  const courseTotal = subjCountData?.meta.total ?? 0;
  const docTotal = docCountData?.meta.total ?? 0;
  const subjects = subjectsData?.items ?? [];
  const documents = documentsData?.items ?? [];

  const showRating =
    ratingCount != null && ratingCount > 0 && ratingAvg != null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col gap-6 border-b border-border/60 pb-8 sm:flex-row sm:items-start sm:gap-10">
        <div className="flex justify-center sm:block">
          <UserAvatar
            profilePictureUrl={profilePictureUrl}
            name={name}
            size="lg"
            className="h-28 w-28 rounded-full border-2 border-border/80 text-3xl shadow-md sm:h-36 sm:w-36"
          />
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

          <div className="flex flex-wrap items-center justify-center gap-6 sm:justify-start">
            <button
              type="button"
              onClick={() => onTabChange('subjects')}
              className={cn(
                'text-center transition-opacity hover:opacity-90',
                tab === 'subjects' ? 'opacity-100' : 'opacity-80',
              )}
            >
              <span className="block text-lg font-semibold tabular-nums">
                {courseTotal}
              </span>
              <span className="text-xs text-muted-foreground">
                {courseTotal === 1 ? 'course' : 'courses'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('documents')}
              className={cn(
                'text-center transition-opacity hover:opacity-90',
                tab === 'documents' ? 'opacity-100' : 'opacity-80',
              )}
            >
              <span className="block text-lg font-semibold tabular-nums">
                {docTotal}
              </span>
              <span className="text-xs text-muted-foreground">
                {docTotal === 1 ? 'file' : 'files'}
              </span>
            </button>
            {showRating ? (
              <div className="text-center">
                <span className="inline-flex items-center justify-center gap-1 text-lg font-semibold tabular-nums">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {Number(ratingAvg).toFixed(1)}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {ratingCount} rating{ratingCount === 1 ? '' : 's'}
                </span>
              </div>
            ) : null}
          </div>

          <div className="space-y-2 text-center sm:text-left">
            {role ? (
              <p className="text-sm">
                <span className="text-muted-foreground">Role </span>
                <Badge variant="secondary" className="capitalize">
                  {role}
                </Badge>
              </p>
            ) : null}
            {email ? (
              <p className="text-sm text-muted-foreground">{email}</p>
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
                <a
                  key={`${p.key}-${p.value}`}
                  href={p.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {p.key}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="sticky top-14 z-[1] -mx-4 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:top-0 md:mx-0 md:px-0">
        <div className="mx-auto flex max-w-3xl justify-center gap-0 sm:gap-8">
          <button
            type="button"
            onClick={() => onTabChange('subjects')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 border-t-0 border-b-2 py-3 text-xs font-semibold uppercase tracking-wide transition-colors sm:flex-initial sm:min-w-[140px]',
              tab === 'subjects'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <BookOpen className="h-4 w-4" />
            Courses
          </button>
          <button
            type="button"
            onClick={() => onTabChange('documents')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 border-t-0 border-b-2 py-3 text-xs font-semibold uppercase tracking-wide transition-colors sm:flex-initial sm:min-w-[140px]',
              tab === 'documents'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <FileText className="h-4 w-4" />
            Files
          </button>
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
                <Link
                  key={s.id}
                  to={generatePath(ROUTES.SUBJECT_DETAILS, { id: s.id })}
                  className="group aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted/30 shadow-sm ring-1 ring-black/5 transition hover:ring-primary/30 dark:ring-white/10"
                >
                  <div className="flex h-full flex-col justify-between p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <p className="line-clamp-3 text-left text-xs font-semibold leading-snug group-hover:text-primary">
                      {s.name}
                    </p>
                  </div>
                </Link>
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
            No uploaded files to show yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {documents.map((d) => (
              <Link
                key={d.id}
                to={generatePath(ROUTES.DOCUMENT_DETAILS, { id: d.id })}
                className="group aspect-square overflow-hidden rounded-lg border border-border/40 shadow-sm ring-1 ring-black/5 transition hover:shadow-md dark:ring-white/10"
              >
                <Card
                  className={cn(
                    'h-full gap-0 border-0 py-0 shadow-none',
                    subjectDocumentCardClass(d.subject_id),
                  )}
                >
                  <CardContent className="flex h-full flex-col p-2.5 pt-2">
                    <div
                      className={cn(
                        'mb-1.5 flex h-7 w-7 items-center justify-center',
                        subjectDocumentIconClass(d.subject_id),
                      )}
                    >
                      <FileText className="h-3.5 w-3.5 opacity-90" />
                    </div>
                    <p className="line-clamp-3 text-left text-[11px] font-semibold leading-tight group-hover:text-primary">
                      {d.title}
                    </p>
                    {d.kind ? (
                      <Badge
                        variant="secondary"
                        className="mt-auto w-fit px-1 py-0 text-[9px] font-normal"
                      >
                        {DOCUMENT_KIND_LABELS[d.kind]}
                      </Badge>
                    ) : null}
                    {d.file_size != null ? (
                      <span className="mt-1 text-[10px] text-muted-foreground">
                        {formatFileSize(d.file_size)}
                      </span>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
