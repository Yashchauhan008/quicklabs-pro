import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetSubjects, useDeleteSubject } from '@/hooks/useSubjects';
import { ROUTES } from '@/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDateTime, truncateText } from '@/utils/formate';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { generatePath } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { isStudentRole } from '@/utils/roles';

export const SubjectsPage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const listParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
    }),
    [page, debouncedSearch],
  );

  const { data, isLoading, isFetching } = useGetSubjects(listParams);
  const deleteMutation = useDeleteSubject();

  const items = data?.items ?? [];
  const meta = data?.meta;

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
    if (items.length <= 1 && page > 1) setPage((p) => Math.max(1, p - 1));
  };

  return (
    <div className="space-y-8">
      <Card className="border-0 shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Courses
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Create, edit, or remove courses you own. Discover everyone&apos;s
              courses from{' '}
              <Link
                to={ROUTES.EXPLORE_COURSES}
                className="font-medium text-primary hover:underline"
              >
                All courses
              </Link>
              .
            </p>
            {isStudentRole(user?.role) && (
              <p className="text-xs text-muted-foreground">
                Student accounts: up to 2 active courses (server enforced).
              </p>
            )}
          </div>
          <Button asChild className="rounded-lg shrink-0">
            <Link to={ROUTES.SUBJECT_CREATE}>
              <Plus className="mr-2 h-4 w-4" />
              New course
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="min-w-[200px] flex-1 space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Find a course by name…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="max-w-md rounded-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ) : items.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              No courses yet. Create your first course to add materials.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto px-4 pb-2 pt-2 md:px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Description
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">Updated</TableHead>
                    <TableHead className="text-right w-[140px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground max-w-md">
                        {s.description
                          ? truncateText(s.description, 80)
                          : '—'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                        {s.updated_at
                          ? formatDateTime(s.updated_at)
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild title="View">
                            <Link
                              to={generatePath(ROUTES.SUBJECT_DETAILS, {
                                id: s.id,
                              })}
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild title="Edit">
                            <Link
                              to={generatePath(ROUTES.SUBJECT_EDIT, {
                                id: s.id,
                              })}
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete"
                            onClick={() => setDeleteId(s.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-6 py-4">
                  <p className="text-sm text-muted-foreground">
                    Page {meta.page} of {meta.totalPages} ({meta.total} total)
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
        </CardContent>
      </Card>

      <ConfirmationModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Remove this course?"
        description="This hides the course and its materials from your workspace. You can only remove courses you own."
        confirmText="Remove"
        variant="destructive"
      />
    </div>
  );
};
