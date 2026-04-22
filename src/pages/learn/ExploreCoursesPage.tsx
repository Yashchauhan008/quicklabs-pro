import { useMemo, useState } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { useGetSubjects } from '@/hooks/useSubjects';
import { IS_DEVELOPMENT, ROUTES } from '@/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useDebounce } from '@/hooks/useDebounce';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe2, Plus } from 'lucide-react';
import { SubjectCard } from '@/components/shared/SubjectCard';

export const ExploreCoursesPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const listParams = useMemo(
    () => ({
      page,
      limit: 12,
      search: debouncedSearch || undefined,
    }),
    [page, debouncedSearch],
  );

  const { data, isLoading, isFetching } = useGetSubjects(listParams);
  const items = data?.items ?? [];
  const meta = data?.meta;

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
          <h1 className="text-3xl font-bold tracking-tight">All courses</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Browse every course shared in your workspace and open one to see
            its materials.
          </p>
        </div>
        {IS_DEVELOPMENT && (
          <Button asChild className="shrink-0 rounded-lg">
            <Link to={ROUTES.SUBJECT_CREATE}>
              <Plus className="mr-2 h-4 w-4" />
              New course
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md flex-1 space-y-2">
          <label className="text-sm font-medium">Search courses</label>
          <Input
            placeholder="Search by name…"
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
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No courses match your search.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => {
              return (
                <SubjectCard
                  key={s.id}
                  subject={s}
                  href={`${generatePath(ROUTES.SUBJECT_DETAILS, { id: s.id })}?from=explore`}
                />
              );
            })}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-6">
              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages} ({meta.total} courses)
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
