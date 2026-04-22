import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  Plus,
  Sparkles,
  Trophy,
  Upload,
} from 'lucide-react';
import { useGetSubjects } from '@/hooks/useSubjects';
import { useGetDocuments } from '@/hooks/useDocuments';
import { getDocuments } from '@/services/api/document';
import { IS_DEVELOPMENT, ROUTES } from '@/config';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { pickDocumentUploader } from '@/utils/displayUser';
import type { SubjectDocument } from '@/types/document';

const EMPTY_LEADERBOARD = [] as Array<{
  userId: string;
  name: string;
  profilePictureUrl: string | null;
  uploads: number;
}>;

export const Dashboard = () => {
  const { user } = useAuth();
  const { data: subjectsData, isLoading: subjectsLoading } = useGetSubjects({
    page: 1,
    limit: 6,
  });
  const { data: documentsData, isLoading: documentsLoading } = useGetDocuments({
    page: 1,
    limit: 6,
    visibility: 'PUBLIC',
  });

  const totalSubjects = subjectsData?.meta.total ?? 0;
  const totalPublicDocuments = documentsData?.meta.total ?? 0;
  const recentSubjects = subjectsData?.items ?? [];
  const recentDocuments = documentsData?.items ?? [];
  const loading = subjectsLoading || documentsLoading;

  type LeaderboardRow = {
    userId: string;
    name: string;
    profilePictureUrl: string | null;
    uploads: number;
  };

  const { data: leaderboardRows, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['dashboard', 'leaderboard', 'uploads'],
    queryFn: async () => {
      const limit = 100;
      const first = await getDocuments({ page: 1, limit, visibility: 'PUBLIC' });
      const all: SubjectDocument[] = [...first.items];
      const totalPages = Math.min(first.meta.totalPages ?? 1, 10);
      for (let page = 2; page <= totalPages; page += 1) {
        const next = await getDocuments({ page, limit, visibility: 'PUBLIC' });
        all.push(...next.items);
      }

      const map = new Map<string, LeaderboardRow>();
      for (const doc of all) {
        const uploader = pickDocumentUploader(doc);
        if (!uploader.id) continue;
        const existing = map.get(uploader.id);
        if (existing) {
          existing.uploads += 1;
        } else {
          map.set(uploader.id, {
            userId: uploader.id,
            name: uploader.label,
            profilePictureUrl: uploader.profilePictureUrl,
            uploads: 1,
          });
        }
      }

      return Array.from(map.values())
        .sort((a, b) => b.uploads - a.uploads)
        .slice(0, 8);
    },
  });

  const leaderboard = leaderboardRows ?? EMPTY_LEADERBOARD;
  const totalUploads = useMemo(
    () => leaderboard.reduce((sum, row) => sum + row.uploads, 0),
    [leaderboard],
  );

  const stats = [
    {
      title: 'All courses',
      description: 'Shared courses across the workspace',
      value: loading ? '—' : String(totalSubjects),
      icon: BookOpen,
      href: ROUTES.EXPLORE_COURSES,
      cta: 'Explore courses',
      accent: 'from-blue-500/20 to-indigo-500/10 text-blue-800 dark:text-blue-200',
      iconBg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
    },
    {
      title: 'Public materials',
      description: 'Files visible to everyone',
      value: loading ? '—' : String(totalPublicDocuments),
      icon: FileText,
      href: ROUTES.EXPLORE_MATERIALS,
      cta: 'Explore materials',
      accent:
        'from-violet-500/20 to-indigo-500/10 text-violet-800 dark:text-violet-200',
      iconBg: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
    },
    {
      title: 'Leaderboard uploads',
      description: 'Uploads by top community contributors',
      value: leaderboardLoading ? '—' : String(totalUploads),
      icon: Trophy,
      href: ROUTES.LEADERBOARD,
      cta: 'View leaderboard',
      accent: 'from-indigo-500/20 to-blue-500/10 text-indigo-800 dark:text-indigo-200',
      iconBg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
    },
  ];

  return (
    <div className="space-y-6 lg:min-h-[calc(100dvh-9rem)] lg:w-full">
      <Card className="overflow-hidden border border-white/30 bg-linear-to-r from-violet-600/90 via-indigo-600/90 to-blue-600/90 text-white shadow-xl backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-white/90">Your space</p>
              <CardTitle className="text-2xl font-bold tracking-tight md:text-3xl">
                Welcome back, {user?.name?.split(' ')[0] ?? 'learner'}
              </CardTitle>
              <CardDescription className="text-base text-white/90">
                Real-time view of courses, materials, and top contributors.
              </CardDescription>
              <div className="flex flex-wrap gap-2 pt-3">
                {IS_DEVELOPMENT && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-white/40 bg-white/10 text-white hover:bg-white/20"
                    asChild
                  >
                    <Link to={ROUTES.SUBJECT_CREATE}>
                      <Plus className="mr-2 h-4 w-4" />
                      New course
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-white/40 bg-white/10 text-white hover:bg-white/20"
                  asChild
                >
                  <Link to={ROUTES.ADD_DOCUMENT}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload file
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white sm:flex">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:min-h-[calc(100dvh-20rem)] lg:grid-cols-[1.35fr_1fr]">
        <section className="space-y-6">
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              At a glance
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {stats.map((stat) => (
                <Card
                  key={stat.title}
                  className="group border-violet-200/70 bg-linear-to-br from-white/75 via-violet-50/60 to-indigo-50/50 shadow-md backdrop-blur-md transition-shadow hover:shadow-lg dark:border-violet-500/20 dark:from-background/80 dark:via-violet-500/10 dark:to-indigo-500/10"
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold">
                        {stat.title}
                      </CardTitle>
                      <CardDescription className="text-xs leading-relaxed">
                        {stat.description}
                      </CardDescription>
                    </div>
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg}`}
                    >
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading || (stat.title === 'Leaderboard uploads' && leaderboardLoading) ? (
                      <Skeleton className="h-9 w-20 rounded-lg" />
                    ) : (
                      <p
                        className={`inline-flex min-h-9 items-baseline gap-1 rounded-lg bg-linear-to-br px-3 py-1.5 text-3xl font-bold tabular-nums ${stat.accent}`}
                      >
                        {stat.value}
                      </p>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full rounded-lg sm:w-auto"
                      asChild
                    >
                      <Link to={stat.href}>{stat.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-violet-200/60 bg-linear-to-br from-white/75 via-violet-50/60 to-indigo-50/50 shadow-sm backdrop-blur-md dark:border-violet-500/20 dark:from-background/80 dark:via-violet-500/10 dark:to-indigo-500/10">
              <CardHeader>
                <CardTitle className="text-base">Recent courses</CardTitle>
                <CardDescription>Latest added courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {subjectsLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-10 w-full rounded-lg" />
                  ))
                ) : recentSubjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No courses yet.</p>
                ) : (
                  recentSubjects.slice(0, 4).map((subject) => (
                    <Link
                      key={subject.id}
                      to={`/learn/subject/${subject.id}`}
                      className="flex items-center justify-between rounded-lg border border-violet-200/60 bg-white/65 px-3 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-violet-50/80 dark:border-violet-500/20 dark:bg-background/70 dark:hover:bg-violet-500/10"
                    >
                      <span className="truncate font-medium">{subject.name}</span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-violet-200/60 bg-linear-to-br from-white/75 via-violet-50/60 to-indigo-50/50 shadow-sm backdrop-blur-md dark:border-violet-500/20 dark:from-background/80 dark:via-violet-500/10 dark:to-indigo-500/10">
              <CardHeader>
                <CardTitle className="text-base">Material sneak peek</CardTitle>
                <CardDescription>Recently uploaded public files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {documentsLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-10 w-full rounded-lg" />
                  ))
                ) : recentDocuments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No public materials yet.
                  </p>
                ) : (
                  recentDocuments.slice(0, 4).map((doc) => (
                    <Link
                      key={doc.id}
                      to={`/learn/document/${doc.id}`}
                      className="flex items-center justify-between rounded-lg border border-violet-200/60 bg-white/65 px-3 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-violet-50/80 dark:border-violet-500/20 dark:bg-background/70 dark:hover:bg-violet-500/10"
                    >
                      <span className="truncate font-medium">{doc.title}</span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <Card className="h-full min-h-112 border-violet-200/70 bg-linear-to-br from-white/75 via-violet-50/60 to-indigo-50/50 shadow-md backdrop-blur-md dark:border-violet-500/20 dark:from-background/80 dark:via-violet-500/10 dark:to-indigo-500/10 lg:min-h-full">
          <CardHeader className="pb-3">
            <div className="mb-1 inline-flex w-fit items-center gap-2 rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-800 dark:text-violet-200">
              <Trophy className="h-3.5 w-3.5" />
              Leaderboard
            </div>
            <CardTitle className="text-lg">Top uploaders</CardTitle>
            <CardDescription>
              Ranked by total public material uploads.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-7rem)] overflow-y-auto pr-2">
            {leaderboardLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No uploads yet. Start sharing to appear here.
              </p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((row, index) => (
                  <div
                    key={row.userId}
                    className="flex items-center justify-between rounded-lg border border-violet-200/70 bg-white/65 px-3 py-2 backdrop-blur-sm dark:border-violet-500/20 dark:bg-background/70"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <p className="w-8 shrink-0 text-xs font-semibold text-muted-foreground">
                        #{index + 1}
                      </p>
                      <UserAvatar
                        profilePictureUrl={row.profilePictureUrl}
                        name={row.name}
                        size="sm"
                        className="h-8 w-8"
                      />
                      <p className="truncate text-sm font-medium">{row.name}</p>
                    </div>
                    <p className="rounded-md bg-muted px-2 py-1 text-xs font-semibold">
                      {row.uploads}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
