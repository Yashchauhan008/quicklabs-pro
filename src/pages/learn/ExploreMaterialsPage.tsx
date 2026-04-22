import { useMemo, useState } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { useGetDocuments } from '@/hooks/useDocuments';
import { useGetSubjects } from '@/hooks/useSubjects';
import { ROUTES } from '@/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useDebounce } from '@/hooks/useDebounce';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { isStudentRole } from '@/utils/roles';
import { Globe2, Upload } from 'lucide-react';
import { MaterialCard } from '@/components/shared/MaterialCard';

export const ExploreMaterialsPage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const { data: subjectsData } = useGetSubjects({ page: 1, limit: 200 });
  const subjectNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of subjectsData?.items ?? []) {
      m.set(s.id, s.name);
    }
    return m;
  }, [subjectsData?.items]);

  const listParams = useMemo(
    () => ({
      page,
      limit: 12,
      search: debouncedSearch || undefined,
      visibility: 'PUBLIC' as const,
    }),
    [page, debouncedSearch],
  );

  const { data, isLoading, isFetching } = useGetDocuments(listParams);
  const items = data?.items ?? [];
  const meta = data?.meta;
  const isStudent = isStudentRole(user?.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Globe2 className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">
              Discover
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">All materials</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Public files from every course. Color bands match the course so you
            can spot materials from the same subject at a glance.
          </p>
        </div>
        <Button asChild className="shrink-0 rounded-lg">
          <Link to={ROUTES.ADD_DOCUMENT}>
            <Upload className="mr-2 h-4 w-4" />
            Upload file
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md flex-1 space-y-2">
          <label className="text-sm font-medium">Search materials</label>
          <Input
            placeholder="Search by title…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-lg"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No public materials match your search.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((d) => {
              const courseName =
                d.subject_name ?? subjectNameById.get(d.subject_id) ?? 'Course';
              return (
                <MaterialCard
                  key={d.id}
                  document={d}
                  href={`${generatePath(ROUTES.DOCUMENT_DETAILS, { id: d.id })}?from=explore`}
                  courseName={courseName}
                  isStudent={isStudent}
                />
              );
            })}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-6">
              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages} ({meta.total} files)
                {isFetching ? ' · Updating…' : ''}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(meta.totalPages, p + 1))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
