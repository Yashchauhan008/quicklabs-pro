import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Crown, Medal, Trophy, Upload } from 'lucide-react';
import { getDocuments } from '@/services/api/document';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { pickDocumentUploader } from '@/utils/displayUser';
import type { SubjectDocument } from '@/types/document';

type LeaderboardRow = {
  userId: string;
  name: string;
  profilePictureUrl: string | null;
  uploads: number;
};

async function fetchLeaderboardDocuments(): Promise<SubjectDocument[]> {
  const limit = 100;
  const first = await getDocuments({ page: 1, limit, visibility: 'PUBLIC' });
  const all = [...first.items];
  const totalPages = Math.min(first.meta.totalPages ?? 1, 50);

  for (let page = 2; page <= totalPages; page += 1) {
    const res = await getDocuments({ page, limit, visibility: 'PUBLIC' });
    all.push(...res.items);
  }
  return all;
}

function rankIcon(index: number) {
  if (index === 0) return <Crown className="h-4 w-4 text-amber-500" />;
  if (index === 1) return <Medal className="h-4 w-4 text-slate-500" />;
  if (index === 2) return <Medal className="h-4 w-4 text-orange-500" />;
  return <Trophy className="h-4 w-4 text-muted-foreground" />;
}

export const LeaderboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', 'uploads'],
    queryFn: fetchLeaderboardDocuments,
  });

  const leaderboard = useMemo<LeaderboardRow[]>(() => {
    const rows = new Map<string, LeaderboardRow>();

    for (const doc of data ?? []) {
      const uploader = pickDocumentUploader(doc);
      if (!uploader.id) continue;

      const existing = rows.get(uploader.id);
      if (existing) {
        existing.uploads += 1;
      } else {
        rows.set(uploader.id, {
          userId: uploader.id,
          name: uploader.label,
          profilePictureUrl: uploader.profilePictureUrl,
          uploads: 1,
        });
      }
    }

    return Array.from(rows.values()).sort((a, b) => b.uploads - a.uploads);
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
          <Trophy className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wide">
            Community
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Upload leaderboard</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Ranked by number of public materials uploaded.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No uploads yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((row, index) => (
            <Card key={row.userId} className="shadow-sm">
              <CardContent className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex w-10 shrink-0 items-center gap-1 text-sm font-semibold">
                    {rankIcon(index)}
                    <span>#{index + 1}</span>
                  </div>
                  <UserAvatar
                    profilePictureUrl={row.profilePictureUrl}
                    name={row.name}
                    size="sm"
                    className="h-9 w-9"
                  />
                  <p className="truncate text-sm font-medium">{row.name}</p>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold">
                  <Upload className="h-3.5 w-3.5" />
                  {row.uploads} upload{row.uploads === 1 ? '' : 's'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
