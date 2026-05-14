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
  Layers,
  Plus,
  Trophy,
  Upload,
  Wrench,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useGetSubjects } from '@/hooks/useSubjects';
import { useGetDocuments } from '@/hooks/useDocuments';
import { useGetTools } from '@/hooks/useTools';
import { getDocuments } from '@/services/api/document';
import { IS_DEVELOPMENT, ROUTES } from '@/config';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardToolsPreview } from '@/components/user/DashboardToolsPreview';
import { pickDocumentUploader } from '@/utils/displayUser';
import type { SubjectDocument } from '@/types/document';

const PIE_COLORS = ['#7c3aed', '#6366f1', '#8b5cf6', '#a855f7', '#818cf8', '#c084fc'];

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
  const { data: toolsData, isLoading: toolsLoading } = useGetTools({ page: 1, limit: 1 });

  const totalSubjects = subjectsData?.meta.total ?? 0;
  const totalPublicDocuments = documentsData?.meta.total ?? 0;
  const totalTools = toolsData?.pagination?.total ?? 0;
  const loading = subjectsLoading || documentsLoading || toolsLoading;

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

  const chartData = useMemo(
    () =>
      (courseUploadsRows ?? []).map((row) => ({
        course: row.course.length > 22 ? `${row.course.slice(0, 22)}...` : row.course,
        uploads: row.uploads,
      })),
    [courseUploadsRows],
  );

  const coursePieData = useMemo(() => {
    const rows = courseUploadsRows ?? [];
    return rows.slice(0, 6).map((row, i) => ({
      name: row.course.length > 16 ? `${row.course.slice(0, 16)}…` : row.course,
      value: row.uploads,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [courseUploadsRows]);

  const leaderboardBars = useMemo(
    () =>
      leaderboard.slice(0, 6).map((row) => ({
        name: row.name.length > 14 ? `${row.name.slice(0, 14)}…` : row.name,
        uploads: row.uploads,
      })),
    [leaderboard],
  );

  const contributorChartPx = useMemo(() => {
    const n = leaderboardBars.length;
    if (n === 0) return 72;
    return Math.min(280, Math.max(100, n * 42 + 52));
  }, [leaderboardBars.length]);

  return (
    <div className="space-y-6 pb-3">
      <Card className="overflow-hidden border-violet-300/40 bg-linear-to-br from-violet-600 via-indigo-600 to-blue-600 text-white shadow-xl">
        <CardHeader className="space-y-4 pb-5">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl tracking-tight md:text-3xl">
              Welcome back, {user?.name?.split(' ')[0] ?? 'learner'}
            </CardTitle>
            <CardDescription className="max-w-xl text-base text-white/90">
              Snapshot of your courses, public materials, tools, and contributors.
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

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="flex h-full min-h-0 flex-col gap-3 py-4 border-violet-200/70 bg-white/80 shadow-sm dark:border-violet-500/20 dark:bg-background/80">
          <CardHeader className="shrink-0 space-y-0 pb-0 pt-0">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-700 dark:text-blue-300">
                <Layers className="h-4.5 w-4.5" />
              </div>
              <div>
                <CardTitle className="text-base">Workspace overview</CardTitle>
                <CardDescription>
                  Totals for courses, public materials, and tools in the ecosystem
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col justify-between gap-3 pb-2 pt-0">
            <div className="min-h-0">
              {loading ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl sm:h-24" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-blue-200/70 bg-blue-500/5 p-3 dark:border-blue-500/25 dark:bg-blue-500/10">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      Courses
                    </div>
                    <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-blue-700 dark:text-blue-200">
                      {totalSubjects}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Shared in workspace</p>
                  </div>
                  <div className="rounded-xl border border-violet-200/70 bg-violet-500/5 p-3 dark:border-violet-500/25 dark:bg-violet-500/10">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <FileText className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                      Materials
                    </div>
                    <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-violet-700 dark:text-violet-200">
                      {totalPublicDocuments}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Public & discoverable</p>
                  </div>
                  <div className="rounded-xl border border-indigo-200/70 bg-indigo-500/5 p-3 dark:border-indigo-500/25 dark:bg-indigo-500/10">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Wrench className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      Tools
                    </div>
                    <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-indigo-700 dark:text-indigo-200">
                      {totalTools}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">In QuickLabs toolbox</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <Link to={ROUTES.EXPLORE_COURSES}>
                  <BookOpen className="h-3.5 w-3.5" />
                  Courses
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <Link to={ROUTES.EXPLORE_MATERIALS}>
                  <FileText className="h-3.5 w-3.5" />
                  Materials
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <Link to={ROUTES.EXPLORE_TOOLS}>
                  <Wrench className="h-3.5 w-3.5" />
                  Tools
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex h-full min-h-0 flex-col gap-3 py-4 border-violet-200/70 bg-white/80 shadow-sm dark:border-violet-500/20 dark:bg-background/80">
          <CardHeader className="shrink-0 space-y-0 pb-0 pt-0">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-700 dark:text-violet-300">
                <Trophy className="h-4.5 w-4.5" />
              </div>
              <div>
                <CardTitle className="text-base">Top contributors</CardTitle>
                <CardDescription>Upload volume among leading sharers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col justify-between gap-2 pb-2 pt-0">
            <div className="min-h-0 w-full shrink-0">
              {leaderboardLoading ? (
                <Skeleton className="h-40 w-full rounded-xl" />
              ) : leaderboardBars.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No uploads yet. Share public materials to populate this chart.
                </p>
              ) : (
                <div className="w-full" style={{ height: contributorChartPx }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={leaderboardBars}
                      margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                    >
                      <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={92}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(124,58,237,0.06)' }}
                        formatter={(value) => [`${value ?? 0}`, 'Uploads']}
                      />
                      <Bar dataKey="uploads" fill="#7c3aed" radius={[0, 6, 6, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full shrink-0" asChild>
              <Link to={ROUTES.LEADERBOARD}>Open full leaderboard</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="gap-3 py-4 border-violet-200/70 bg-white/80 shadow-sm dark:border-violet-500/20 dark:bg-background/80">
          <CardHeader className="space-y-1 pb-0 pt-0">
            <CardTitle className="text-base">Activity by course</CardTitle>
            <CardDescription>
              Where public uploads concentrate — bars and share of total
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2 pt-2">
            {courseUploadsLoading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No uploads available yet to plot the chart.
              </p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr] lg:items-start">
                <div className="h-60 min-h-[200px] w-full sm:h-64">
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
                <div className="h-60 min-h-[200px] w-full sm:h-64">
                  {coursePieData.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nothing to chart yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={coursePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={88}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                        >
                          {coursePieData.map((entry, index) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.fill ?? PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value ?? 0} uploads`, 'Share']} />
                        <Legend
                          layout="vertical"
                          verticalAlign="middle"
                          align="right"
                          wrapperStyle={{ fontSize: 11 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
        <DashboardToolsPreview />
      </section>
    </div>
  );
};
