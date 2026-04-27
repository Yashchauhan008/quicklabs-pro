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
  Trophy,
  Upload,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
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

  const { data: courseUploadsRows, isLoading: courseUploadsLoading } = useQuery({
    queryKey: ['dashboard', 'course-uploads'],
    queryFn: async () => {
      const limit = 100;
      const first = await getDocuments({ page: 1, limit, visibility: 'PUBLIC' });
      const all: SubjectDocument[] = [...first.items];
      const totalPages = Math.min(first.meta.totalPages ?? 1, 10);

      for (let page = 2; page <= totalPages; page += 1) {
        const next = await getDocuments({ page, limit, visibility: 'PUBLIC' });
        all.push(...next.items);
      }

      const map = new Map<string, { subjectId: string; course: string; uploads: number }>();
      for (const doc of all) {
        const subjectId = doc.subject_id || 'unknown';
        const course = doc.subject_name || 'Untitled course';
        const existing = map.get(subjectId);
        if (existing) {
          existing.uploads += 1;
        } else {
          map.set(subjectId, { subjectId, course, uploads: 1 });
        }
      }

      return Array.from(map.values()).sort((a, b) => b.uploads - a.uploads).slice(0, 8);
    },
  });

  const leaderboard = leaderboardRows ?? EMPTY_LEADERBOARD;
  const totalUploads = useMemo(
    () => leaderboard.reduce((sum, row) => sum + row.uploads, 0),
    [leaderboard],
  );

  const stats = [
    {
      title: 'Courses in workspace',
      description: 'Total active shared courses',
      value: loading ? '—' : String(totalSubjects),
      icon: BookOpen,
      href: ROUTES.EXPLORE_COURSES,
      cta: 'Open courses',
      chipClass:
        'bg-blue-500/15 text-blue-700 ring-1 ring-blue-500/20 dark:text-blue-200',
      iconBg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
    },
    {
      title: 'Public materials',
      description: 'Files discoverable by everyone',
      value: loading ? '—' : String(totalPublicDocuments),
      icon: FileText,
      href: ROUTES.EXPLORE_MATERIALS,
      cta: 'Open materials',
      chipClass:
        'bg-violet-500/15 text-violet-700 ring-1 ring-violet-500/20 dark:text-violet-200',
      iconBg: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
    },
    {
      title: 'Leaderboard uploads',
      description: 'Cumulative uploads by top contributors',
      value: leaderboardLoading ? '—' : String(totalUploads),
      icon: Trophy,
      href: ROUTES.LEADERBOARD,
      cta: 'Open leaderboard',
      chipClass:
        'bg-indigo-500/15 text-indigo-700 ring-1 ring-indigo-500/20 dark:text-indigo-200',
      iconBg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
    },
  ];

  const leaderboardPreview = useMemo(
    () =>
      leaderboard.slice(0, 5).map((row, index) => ({
        ...row,
        rank: index + 1,
      })),
    [leaderboard],
  );

  const chartData = useMemo(
    () =>
      (courseUploadsRows ?? []).map((row) => ({
        course: row.course.length > 22 ? `${row.course.slice(0, 22)}...` : row.course,
        uploads: row.uploads,
      })),
    [courseUploadsRows],
  );

  return (
    <div className="space-y-6 pb-3">
      <Card className="overflow-hidden border-violet-300/40 bg-linear-to-br from-violet-600 via-indigo-600 to-blue-600 text-white shadow-xl">
        <CardHeader className="space-y-4 pb-5">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl tracking-tight md:text-3xl">
              Welcome back, {user?.name?.split(' ')[0] ?? 'learner'}
            </CardTitle>
            <CardDescription className="max-w-xl text-base text-white/90">
              Snapshot of your courses, public materials, and contributors.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {IS_DEVELOPMENT && (
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/95 text-indigo-700 hover:bg-white"
                asChild
              >
                <Link to={ROUTES.SUBJECT_CREATE}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create course
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="border-white/50 bg-white/10 text-white hover:bg-white/20"
              asChild
            >
              <Link to={ROUTES.ADD_DOCUMENT}>
                <Upload className="mr-2 h-4 w-4" />
                Upload material
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="border-violet-200/70 bg-white/80 shadow-sm dark:border-violet-500/20 dark:bg-background/80"
          >
            <CardHeader className="space-y-2 pb-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.iconBg}`}
                >
                  <stat.icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <CardDescription className="text-xs">{stat.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading || (stat.title === 'Leaderboard uploads' && leaderboardLoading) ? (
                <Skeleton className="h-8 w-20 rounded-md" />
              ) : (
                <p className={`inline-flex rounded-md px-2.5 py-1 text-3xl font-bold ${stat.chipClass}`}>
                  {stat.value}
                </p>
              )}
              <Button variant="secondary" size="sm" asChild>
                <Link to={stat.href}>{stat.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card className="border-violet-200/70 bg-white/80 shadow-sm dark:border-violet-500/20 dark:bg-background/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Course vs uploads</CardTitle>
            <CardDescription>Public materials uploaded per course</CardDescription>
          </CardHeader>
          <CardContent>
            {courseUploadsLoading ? (
              <Skeleton className="h-72 w-full rounded-lg" />
            ) : chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No uploads available yet to plot the chart.
              </p>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 8 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="course" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 11 }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(124,58,237,0.06)' }}
                      formatter={(value) => [`${value}`, 'Uploads']}
                    />
                    <Bar dataKey="uploads" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-violet-200/70 bg-white/80 shadow-sm dark:border-violet-500/20 dark:bg-background/80">
          <CardHeader className="pb-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-700 dark:text-violet-200">
              <Trophy className="h-3.5 w-3.5" />
              Community pulse
            </div>
            <CardTitle className="text-base">Top uploaders</CardTitle>
            <CardDescription>Who is sharing the most this cycle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {leaderboardLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <Skeleton key={idx} className="h-12 rounded-lg" />
              ))
            ) : leaderboardPreview.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No uploads yet. Start sharing to appear here.
              </p>
            ) : (
              leaderboardPreview.map((row) => (
                <div
                  key={row.userId}
                  className="flex items-center justify-between rounded-lg border border-violet-200/70 bg-white p-2.5 dark:border-violet-500/20 dark:bg-background"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <p className="w-7 text-xs font-semibold text-muted-foreground">
                      #{row.rank}
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
              ))
            )}
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to={ROUTES.LEADERBOARD}>View full leaderboard</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {[
          {
            title: 'Recent courses',
            emptyText: 'No courses yet.',
            loadingState: subjectsLoading,
            items: (subjectsData?.items ?? []).slice(0, 4).map((subject) => ({
              id: subject.id,
              label: subject.name,
              href: `/learn/subject/${subject.id}`,
            })),
          },
          {
            title: 'Recent materials',
            emptyText: 'No public materials yet.',
            loadingState: documentsLoading,
            items: (documentsData?.items ?? []).slice(0, 4).map((doc) => ({
              id: doc.id,
              label: doc.title,
              href: `/learn/document/${doc.id}`,
            })),
          },
        ].map((highlight) => (
          <Card
            key={highlight.title}
            className="border-violet-200/70 bg-white/80 shadow-sm dark:border-violet-500/20 dark:bg-background/80"
          >
            <CardHeader>
              <CardTitle className="text-base">{highlight.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {highlight.loadingState ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-10 rounded-lg" />
                ))
              ) : highlight.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">{highlight.emptyText}</p>
              ) : (
                highlight.items.map((item) => (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="flex items-center justify-between rounded-lg border border-violet-200/70 bg-white px-3 py-2 text-sm transition-colors hover:bg-violet-50 dark:border-violet-500/20 dark:bg-background dark:hover:bg-violet-500/10"
                  >
                    <span className="truncate font-medium">{item.label}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
};
