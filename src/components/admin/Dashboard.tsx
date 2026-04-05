import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpen, FileText, Plus, Sparkles, Upload } from 'lucide-react';
import { useGetSubjects } from '@/hooks/useSubjects';
import { useGetDocuments } from '@/hooks/useDocuments';
import { ROUTES } from '@/config';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const Dashboard = () => {
  const { user } = useAuth();
  const { data: subjectsData, isLoading: subjectsLoading } = useGetSubjects({
    page: 1,
    limit: 1,
  });
  const { data: documentsData, isLoading: documentsLoading } = useGetDocuments({
    page: 1,
    limit: 1,
    visibility: 'PUBLIC',
  });

  const totalSubjects = subjectsData?.meta.total ?? 0;
  const totalPublicDocuments = documentsData?.meta.total ?? 0;
  const loading = subjectsLoading || documentsLoading;

  const stats = [
    {
      title: 'All courses',
      description: 'Shared courses across the workspace',
      value: loading ? '—' : String(totalSubjects),
      icon: BookOpen,
      href: ROUTES.EXPLORE_COURSES,
      cta: 'Explore courses',
      accent: 'from-sky-500/15 to-sky-500/5 text-sky-700 dark:text-sky-300',
      iconBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    },
    {
      title: 'Public materials',
      description: 'Files visible to everyone',
      value: loading ? '—' : String(totalPublicDocuments),
      icon: FileText,
      href: ROUTES.EXPLORE_MATERIALS,
      cta: 'Explore materials',
      accent: 'from-violet-500/15 to-violet-500/5 text-violet-700 dark:text-violet-300',
      iconBg: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    },
  ];

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-md ring-1 ring-primary/10">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">Your space</p>
              <CardTitle className="text-2xl font-bold tracking-tight md:text-3xl">
                Welcome back, {user?.name?.split(' ')[0] ?? 'learner'}
              </CardTitle>
              <CardDescription className="text-base">
                Explore what others shared, or add a new course or upload from
                here.
              </CardDescription>
              <div className="flex flex-wrap gap-2 pt-3">
                <Button variant="outline" size="sm" className="rounded-lg" asChild>
                  <Link to={ROUTES.SUBJECT_CREATE}>
                    <Plus className="mr-2 h-4 w-4" />
                    New course
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-lg" asChild>
                  <Link to={ROUTES.ADD_DOCUMENT}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload file
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary sm:flex">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          At a glance
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="group border-0 shadow-md ring-1 ring-black/[0.04] transition-shadow hover:shadow-lg dark:ring-white/[0.06]"
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
                {loading ? (
                  <Skeleton className="h-9 w-20 rounded-lg" />
                ) : (
                  <p
                    className={`inline-flex min-h-[2.25rem] items-baseline gap-1 rounded-lg bg-gradient-to-br px-3 py-1.5 text-3xl font-bold tabular-nums ${stat.accent}`}
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

      <Card className="border-dashed shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Continue learning</CardTitle>
          <CardDescription>
            Activity from your courses will show up here as you engage with
            materials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent activity yet. Open a course or upload a resource to get
            started.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
