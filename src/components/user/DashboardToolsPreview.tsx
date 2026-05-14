import { Link } from 'react-router-dom';
import { ExternalLink, Wrench } from 'lucide-react';
import { useGetTools, type Tool } from '@/hooks/useTools';
import { ROUTES } from '@/config';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getFileUrl } from '@/utils/fileUrl';
import { cn } from '@/lib/utils';

const statusClass: Record<Tool['status'], string> = {
  online: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  beta: 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
  new: 'bg-violet-500/15 text-violet-800 dark:text-violet-200',
};

export function DashboardToolsPreview() {
  const { data, isLoading } = useGetTools({ page: 1, limit: 4 });
  const tools = data?.data ?? [];

  return (
    <Card className="border-violet-200/70 bg-white/80 shadow-sm dark:border-violet-500/20 dark:bg-background/80">
      <CardHeader className="pb-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-500/15 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-200">
          <Wrench className="h-3.5 w-3.5" />
          Toolbox
        </div>
        <CardTitle className="text-base">QuickLabs tools</CardTitle>
        <CardDescription>Launch apps from the ecosystem</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-14 rounded-lg" />
          ))
        ) : tools.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tools listed yet. Check back soon.
          </p>
        ) : (
          tools.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center gap-3 rounded-lg border border-violet-200/70 bg-white p-2 dark:border-violet-500/20 dark:bg-background"
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-slate-700">
                {tool.logo_url ? (
                  <img
                    src={getFileUrl(tool.logo_url)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <Wrench className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{tool.title}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  {tool.category ? (
                    <span className="text-[11px] text-muted-foreground">{tool.category}</span>
                  ) : null}
                  <span
                    className={cn(
                      'rounded px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide',
                      statusClass[tool.status],
                    )}
                  >
                    {tool.status}
                  </span>
                </div>
              </div>
              <a
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-200/80 text-violet-700 transition-colors hover:bg-violet-50 dark:border-violet-500/30 dark:text-violet-300 dark:hover:bg-violet-500/10"
                aria-label={`Open ${tool.title}`}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ))
        )}
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to={ROUTES.EXPLORE_TOOLS}>Browse all tools</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
