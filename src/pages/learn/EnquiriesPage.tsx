import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config';
import { useListEnquiries, useVoteEnquiry } from '@/hooks/useStudentFeatures';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EnquirySort, EnquiryStatus } from '@/types/student';
import { formatDateTime } from '@/utils/formate';
import { Plus } from 'lucide-react';

export const EnquiriesPage = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'all' | EnquiryStatus>('all');
  const [sort, setSort] = useState<EnquirySort>('recent');
  const voteMutation = useVoteEnquiry();

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      status: status === 'all' ? undefined : status,
      sort,
    }),
    [page, sort, status],
  );

  const { data, isLoading, isFetching } = useListEnquiries(params);
  const items = data?.items ?? [];
  const meta = data?.meta;

  const statusChip = (s: EnquiryStatus) => {
    if (s === 'open') return { label: '🟢 Open', className: 'bg-muted text-foreground' };
    if (s === 'in_progress') {
      return { label: '🛠️ In progress', className: 'bg-muted text-foreground' };
    }
    if (s === 'resolved') {
      return { label: '✅ Resolved', className: 'bg-muted text-foreground' };
    }
    return { label: '📦 Closed', className: 'bg-muted text-foreground' };
  };

  const topicChip = (topic: string) => {
    if (topic === 'subject') return '📘 Subject';
    if (topic === 'document') return '📄 Document';
    if (topic === 'report') return '🚩 Report';
    return '🧩 Other';
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-2 -ml-2 rounded-lg">
            <Link to={ROUTES.DASHBOARD}>← Home</Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Get help</h1>
          <p className="mt-1 text-muted-foreground">
            Browse recent and priority enquiries from all users.
          </p>
        </div>
        <Button asChild className="rounded-lg shrink-0">
          <Link to={ROUTES.ENQUIRY_NEW}>
            <Plus className="mr-2 h-4 w-4" />
            New enquiry
          </Link>
        </Button>
      </div>

      <Card className="border-0 shadow-md ring-1 ring-black/4 dark:ring-white/6">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">All enquiries</CardTitle>
          <div className="grid w-full grid-cols-1 gap-2 sm:w-[380px] sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v as 'all' | EnquiryStatus);
                  setPage(1);
                }}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort</label>
              <Select
                value={sort}
                onValueChange={(v) => {
                  setSort(v as EnquirySort);
                  setPage(1);
                }}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="priority">Priority (votes)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No enquiries yet. Start one when you need help with a lab or
              course.
            </p>
          ) : (
            <>
              <ul className="space-y-3">
                {items.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-xl border bg-card/80 p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-semibold">{e.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-transparent bg-muted text-foreground"
                        >
                          {topicChip(e.topic)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`border-transparent ${statusChip(e.status).className}`}
                        >
                          {statusChip(e.status).label}
                        </Badge>
                      </div>
                    </div>
                    {e.description && (
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {e.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">
                        Score: {e.score ?? 0}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={e.my_vote === 1 ? 'secondary' : 'outline'}
                          disabled={e.my_vote === 1 || voteMutation.isPending}
                          onClick={() =>
                            voteMutation.mutate({ enquiryId: e.id, vote: 'up' })
                          }
                        >
                          👍 {e.upvotes ?? 0}
                        </Button>
                        <Button
                          size="sm"
                          variant={e.my_vote === -1 ? 'secondary' : 'outline'}
                          disabled={e.my_vote === -1 || voteMutation.isPending}
                          onClick={() =>
                            voteMutation.mutate({ enquiryId: e.id, vote: 'down' })
                          }
                        >
                          👎 {e.downvotes ?? 0}
                        </Button>
                      </div>
                    </div>
                    {e.created_at && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDateTime(e.created_at)}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {meta.page} of {meta.totalPages}
                    {isFetching ? ' · …' : ''}
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
    </div>
  );
};
