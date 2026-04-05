import { useMemo, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  generatePath,
  useSearchParams,
} from 'react-router-dom';
import { useGetSubject, useDeleteSubject } from '@/hooks/useSubjects';
import { useGetDocuments } from '@/hooks/useDocuments';
import { ROUTES } from '@/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  formatDateTime,
  truncateText,
  formatFileSize,
} from '@/utils/formate';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';
import { Pencil, Trash2, Plus, FileText, Sparkles, Library } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DOCUMENT_KIND_LABELS, type SubjectDocument } from '@/types/document';
import { useAuth } from '@/context/AuthContext';
import { isStudentRole } from '@/utils/roles';
import { cn } from '@/lib/utils';
import {
  subjectDocumentCardClass,
  subjectDocumentIconClass,
} from '@/utils/subjectAccent';
import { Star } from 'lucide-react';
import { PeerAttributionRow } from '@/components/shared/PeerAttributionRow';
import { pickSubjectCreator, pickDocumentUploader } from '@/utils/displayUser';

type MaterialsTab = 'informational' | 'lab_solutions';

function uploaderKey(doc: SubjectDocument): string {
  const u = pickDocumentUploader(doc);
  return u.id ?? `anon:${u.label}`;
}

function computeTopContributor(docs: SubjectDocument[]) {
  if (docs.length === 0) return null;
  const counts = new Map<string, { count: number; sample: SubjectDocument }>();
  for (const d of docs) {
    const key = uploaderKey(d);
    const prev = counts.get(key);
    counts.set(key, {
      count: (prev?.count ?? 0) + 1,
      sample: d,
    });
  }
  let best: { key: string; count: number; sample: SubjectDocument } | null =
    null;
  for (const [key, v] of counts) {
    if (!best || v.count > best.count) best = { key, ...v };
  }
  return best;
}

function SubjectDocumentCard({
  doc: d,
  fromExplore,
  isStudent,
}: {
  doc: SubjectDocument;
  fromExplore: boolean;
  isStudent: boolean;
}) {
  const uploader = pickDocumentUploader(d);
  const detailQs = fromExplore ? '?from=explore' : '';

  return (
    <Card
      className={cn(
        'h-full gap-0 rounded-xl border-0 py-0 shadow-md transition-shadow hover:shadow-lg',
        subjectDocumentCardClass(d.subject_id),
      )}
    >
      <CardContent className="flex flex-col p-3.5 pt-3">
        <Link
          to={`${generatePath(ROUTES.DOCUMENT_DETAILS, { id: d.id })}${detailQs}`}
          className="group -m-3.5 mb-0 rounded-t-xl p-3.5 pb-0 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center',
                subjectDocumentIconClass(d.subject_id),
              )}
            >
              <FileText className="h-4 w-4 opacity-90" />
            </div>
            <Badge variant="secondary" className="shrink-0 font-mono text-[10px]">
              {d.visibility}
            </Badge>
          </div>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-primary">
            {d.title}
          </h3>
          {d.description ? (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {truncateText(d.description, 90)}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
            {d.file_size != null ? (
              <span>{formatFileSize(d.file_size)}</span>
            ) : null}
            {isStudent &&
            d.rating_count != null &&
            d.rating_count > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {Number(d.rating_avg ?? 0).toFixed(1)} ({d.rating_count})
              </span>
            ) : null}
          </div>
        </Link>
        <PeerAttributionRow
          label="Uploaded by"
          userId={uploader.id}
          displayName={uploader.label}
          profilePictureUrl={uploader.profilePictureUrl}
        />
      </CardContent>
    </Card>
  );
}

export const SubjectDetailPage = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromExplore = searchParams.get('from') === 'explore';
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [materialsTab, setMaterialsTab] =
    useState<MaterialsTab>('informational');

  const { data: subject, isLoading, isError } = useGetSubject(id);
  const { data: docsData, isLoading: docsLoading } = useGetDocuments(
    id ? { subject_id: id, page: 1, limit: 120 } : undefined,
  );
  const deleteMutation = useDeleteSubject();

  const docs = docsData?.items ?? [];
  const informationalDocs = useMemo(
    () => docs.filter((d) => !d.kind || d.kind === 'informational'),
    [docs],
  );
  const labDocs = useMemo(
    () => docs.filter((d) => d.kind === 'lab_solutions'),
    [docs],
  );

  const handleDelete = async () => {
    if (!id) return;
    await deleteMutation.mutateAsync(id);
    setConfirmDelete(false);
    navigate(fromExplore ? ROUTES.EXPLORE_COURSES : ROUTES.SUBJECTS);
  };

  if (!id) {
    return <p className="text-muted-foreground">Missing course id</p>;
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !subject) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Course not found.</p>
        <Button asChild variant="outline" className="rounded-lg">
          <Link
            to={fromExplore ? ROUTES.EXPLORE_COURSES : ROUTES.SUBJECTS}
          >
            {fromExplore ? 'Back to all courses' : 'Back to courses'}
          </Link>
        </Button>
      </div>
    );
  }

  const subjectOwnerId = subject.creator_id ?? subject.created_by;
  const isOwner =
    !!user?.id &&
    !!subjectOwnerId &&
    String(subjectOwnerId) === String(user.id);

  const creator = pickSubjectCreator(subject);
  const top = computeTopContributor(docs);
  const topUploader = top ? pickDocumentUploader(top.sample) : null;

  const tabDocs =
    materialsTab === 'informational' ? informationalDocs : labDocs;

  const listBack = fromExplore ? ROUTES.EXPLORE_COURSES : ROUTES.SUBJECTS;
  const listBackLabel = fromExplore ? '← All courses' : '← Courses';

  const tabCounts: Record<MaterialsTab, number> = {
    informational: informationalDocs.length,
    lab_solutions: labDocs.length,
  };

  const isStudent = isStudentRole(user?.role);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <Button variant="ghost" asChild className="mb-1 -ml-2 h-8 rounded-lg px-2 text-muted-foreground">
            <Link to={listBack}>{listBackLabel}</Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {subject.name}
          </h1>
          {subject.updated_at ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Updated {formatDateTime(subject.updated_at)}
            </p>
          ) : null}
          <PeerAttributionRow
            variant="detail"
            label="Course author"
            userId={creator.id}
            displayName={creator.label}
            profilePictureUrl={creator.profilePictureUrl}
            className="mt-3"
          >
            {subject.creator_email ? (
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">
                {subject.creator_email}
              </p>
            ) : null}
          </PeerAttributionRow>
        </div>
        {isOwner ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild size="sm" className="rounded-lg">
              <Link
                to={`${ROUTES.ADD_DOCUMENT}?subject_id=${encodeURIComponent(id)}`}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add material
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="rounded-lg">
              <Link to={generatePath(ROUTES.SUBJECT_EDIT, { id })}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-lg"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        ) : null}
      </div>

      <section className="rounded-xl border border-border/60 bg-card/60 px-4 py-3 shadow-sm ring-1 ring-black/4 dark:ring-white/6">
        <h2 className="text-sm font-semibold text-foreground">About</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {subject.description?.trim() || 'No description yet.'}
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Materials
            </h2>
            <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">
              Files linked to this course
              <span className="text-muted-foreground/60"> · </span>
              <Link
                to={ROUTES.EXPLORE_MATERIALS}
                className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
              >
                <Library className="h-3.5 w-3.5 shrink-0" />
                Browse full library
              </Link>
            </p>
          </div>
          {isOwner ? (
            <Button asChild size="sm" className="shrink-0 rounded-lg">
              <Link
                to={`${ROUTES.ADD_DOCUMENT}?subject_id=${encodeURIComponent(id)}`}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add material
              </Link>
            </Button>
          ) : null}
        </div>

        {docsLoading ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border/80 px-4 py-10 text-center text-sm text-muted-foreground">
            <p>
              {isOwner
                ? 'No materials yet. Add a file to build this course library.'
                : 'No materials listed for this course yet.'}
            </p>
            {isOwner ? (
              <Button asChild size="sm" className="rounded-lg">
                <Link
                  to={`${ROUTES.ADD_DOCUMENT}?subject_id=${encodeURIComponent(id)}`}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add material
                </Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            {top && topUploader ? (
              <div className="flex items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/6 px-3 py-2.5 dark:border-amber-400/20 dark:bg-amber-400/7">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
                  <Sparkles className="h-4 w-4" />
                </div>
                <PeerAttributionRow
                  label="Top contributor"
                  userId={topUploader.id}
                  displayName={topUploader.label}
                  profilePictureUrl={topUploader.profilePictureUrl}
                  hideFooterBorder
                  className="min-w-0 flex-1"
                  labelClassName="font-semibold text-amber-900/80 dark:text-amber-200/90"
                  footerNameClassName="text-sm"
                  trailingClassName="text-sm"
                  avatarClassName="h-9 w-9"
                  trailing={
                    <>
                      · {top.count} {top.count === 1 ? 'file' : 'files'}
                    </>
                  }
                />
              </div>
            ) : null}

            <div
              role="tablist"
              aria-label="Material type"
              className="flex w-full gap-6 border-b border-border/70"
            >
              {(
                [
                  {
                    id: 'informational' as const,
                    label: DOCUMENT_KIND_LABELS.informational,
                  },
                  {
                    id: 'lab_solutions' as const,
                    label: DOCUMENT_KIND_LABELS.lab_solutions,
                  },
                ] as const
              ).map((t) => {
                const selected = materialsTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    id={`materials-tab-${t.id}`}
                    aria-controls={`materials-panel-${t.id}`}
                    onClick={() => setMaterialsTab(t.id)}
                    className={cn(
                      '-mb-px flex items-center gap-2 border-b-2 pb-3 pt-1 text-sm font-medium transition-colors',
                      selected
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {t.label}
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs tabular-nums',
                        selected
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {tabCounts[t.id]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              role="tabpanel"
              id={`materials-panel-${materialsTab}`}
              aria-labelledby={`materials-tab-${materialsTab}`}
              className="pt-1"
            >
              {tabDocs.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
                  <p>
                    No {DOCUMENT_KIND_LABELS[materialsTab].toLowerCase()} files
                    yet.
                  </p>
                  {isOwner ? (
                    <Button asChild size="sm" variant="outline" className="rounded-lg">
                      <Link
                        to={`${ROUTES.ADD_DOCUMENT}?subject_id=${encodeURIComponent(id)}`}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add material
                      </Link>
                    </Button>
                  ) : null}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tabDocs.map((d) => (
                    <SubjectDocumentCard
                      key={d.id}
                      doc={d}
                      fromExplore={fromExplore}
                      isStudent={isStudent}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      <ConfirmationModal
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={handleDelete}
        title="Remove this course?"
        description="This hides the course and its materials. Only the owner can remove it."
        confirmText="Remove"
        variant="destructive"
      />
    </div>
  );
};
