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
import {
  formatDateTime,
} from '@/utils/formate';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';
import { Pencil, Trash2, Plus, FileText, Library } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DOCUMENT_KIND_LABELS, type SubjectDocument } from '@/types/document';
import { useAuth } from '@/context/AuthContext';
import { isStudentRole } from '@/utils/roles';
import { cn } from '@/lib/utils';
import { pickDocumentUploader } from '@/utils/displayUser';
import { resolvePublicFileUrl } from '@/utils/publicFileUrl';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { MaterialCard } from '@/components/shared/MaterialCard';

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

  const docs = useMemo(() => docsData?.items ?? [], [docsData?.items]);
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

  const bannerSrc = resolvePublicFileUrl(subject.banner_url);
  const top = computeTopContributor(docs);
  const topUploader = top ? pickDocumentUploader(top.sample) : null;

  const tabDocs =
    materialsTab === 'informational' ? informationalDocs : labDocs;
  const addMaterialLink = `${ROUTES.ADD_DOCUMENT}?subject_id=${encodeURIComponent(id)}`;

  const listBack = fromExplore ? ROUTES.EXPLORE_COURSES : ROUTES.SUBJECTS;
  const listBackLabel = fromExplore ? '← All courses' : '← Courses';

  const tabCounts: Record<MaterialsTab, number> = {
    informational: informationalDocs.length,
    lab_solutions: labDocs.length,
  };

  const isStudent = isStudentRole(user?.role);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="space-y-4 pb-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            asChild
            className="-ml-2 h-8 w-fit rounded-lg px-2 text-muted-foreground"
          >
            <Link to={listBack}>{listBackLabel}</Link>
          </Button>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild size="sm" className="rounded-lg">
              <Link to={addMaterialLink}>
                <Plus className="mr-2 h-4 w-4" />
                Add material
              </Link>
            </Button>
            {isOwner ? (
              <>
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
              </>
            ) : null}
          </div>
        </div>

        <div className="flex items-start gap-4">
          {bannerSrc ? (
            <img
              src={bannerSrc}
              alt={`${subject.name} banner`}
              className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-20 sm:w-20"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl font-semibold text-primary sm:h-20 sm:w-20">
              {subject.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
              {subject.name}
            </h1>
            {subject.updated_at ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Updated {formatDateTime(subject.updated_at)}
              </p>
            ) : null}
          </div>
        </div>
        {/* <div className="h-px w-full bg-border/70" /> */}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card/60 px-4 py-4 shadow-sm ring-1 ring-black/4 dark:ring-white/6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground">About</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {subject.description?.trim() || 'No description yet.'}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/60 px-4 py-4 shadow-sm ring-1 ring-black/4 dark:ring-white/6">
          <h2 className="text-sm font-semibold text-foreground">Top contributor</h2>
          {top && topUploader ? (
            <>
              <div className="mt-3 flex items-start gap-3">
                <UserAvatar
                  profilePictureUrl={topUploader.profilePictureUrl}
                  name={topUploader.label}
                  size="lg"
                  className="h-12 w-12 rounded-xl"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Most contributions
                  </p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {topUploader.label}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {top.count} {top.count === 1 ? 'material' : 'materials'} uploaded
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-border/60 bg-background/60 p-2 text-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Materials
                  </p>
                  <p className="font-semibold text-foreground">{docs.length}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Updated
                  </p>
                  <p className="truncate font-semibold text-foreground">
                    {subject.updated_at ? formatDateTime(subject.updated_at) : '—'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-muted-foreground">
                No contributions yet. Be the first to upload material in this course.
              </p>
              <Button asChild size="sm" className="rounded-lg">
                <Link to={addMaterialLink}>
                  <Plus className="mr-2 h-4 w-4" />
                  Become the first contributor
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border/60 bg-card/40 px-4 py-4 shadow-sm ring-1 ring-black/4 dark:ring-white/6 sm:px-5">
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
          <Button asChild size="sm" className="shrink-0 rounded-lg">
            <Link to={addMaterialLink}>
              <Plus className="mr-2 h-4 w-4" />
              Add material
            </Link>
          </Button>
        </div>

        {docsLoading ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border/80 px-4 py-10 text-center text-sm text-muted-foreground">
            <p>
              No materials yet. Be the first to add a file to this course.
            </p>
          </div>
        ) : (
          <>
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
                  <Button asChild size="sm" variant="outline" className="rounded-lg">
                    <Link to={addMaterialLink}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add material
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tabDocs.map((d) => (
                    <MaterialCard
                      key={d.id}
                      document={d}
                      href={`${generatePath(ROUTES.DOCUMENT_DETAILS, { id: d.id })}${fromExplore ? '?from=explore' : ''}`}
                      isStudent={isStudent}
                      showVisibility
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
