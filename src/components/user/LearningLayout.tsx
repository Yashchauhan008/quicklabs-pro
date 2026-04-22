import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { BreadcrumbNav } from './BreadcrumbNav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { BookOpen, House, Library, Menu, UserRound } from 'lucide-react';
import { ROUTES } from '@/config';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from '@/components/shared/UserAvatar';

const headerNav = [
  {
    label: 'Home',
    to: ROUTES.DASHBOARD,
    icon: House,
    active: (path: string) => path === ROUTES.DASHBOARD || path === '/learn',
  },
  {
    label: 'Courses',
    to: ROUTES.EXPLORE_COURSES,
    icon: BookOpen,
    active: (path: string) =>
      path.startsWith('/learn/courses') || path.startsWith('/learn/subject'),
  },
  {
    label: 'Materials',
    to: ROUTES.EXPLORE_MATERIALS,
    icon: Library,
    active: (path: string) =>
      path.startsWith('/learn/materials') || path.startsWith('/learn/document'),
  },
  {
    label: 'Profile',
    to: ROUTES.PROFILE,
    icon: UserRound,
    active: (path: string) =>
      path.startsWith('/learn/profile') || path.startsWith('/learn/settings'),
  },
];

export const LearningLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col overflow-x-hidden bg-linear-to-br from-violet-100/70 via-blue-50/50 to-indigo-100/70',
        'dark:from-background dark:via-background dark:to-indigo-950/30',
        /* Pin shell to viewport on md+ so sidebar height is the screen, not the page */
        'lg:h-dvh lg:max-h-dvh lg:min-h-0 lg:flex-row lg:overflow-hidden',
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.14),transparent_50%)]" />
      <Sidebar mode="desktop" />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:min-h-0 lg:overflow-hidden">
        <header className="z-10 shrink-0 border-b rounded-bl-2xl border-violet-300/30 bg-white/45 shadow-sm backdrop-blur-xl supports-backdrop-filter:bg-white/35 dark:border-violet-500/20 dark:bg-background/50 lg:sticky lg:top-0">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 lg:hidden"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <BreadcrumbNav />
            </div>
            <nav className="hidden items-center gap-1 lg:flex">
              {headerNav.map((item) => {
                const isActive = item.active(location.pathname);
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                        : 'text-muted-foreground hover:bg-violet-500/10 hover:text-foreground',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <Link to={ROUTES.PROFILE} className="hidden lg:block">
              <UserAvatar
                profilePictureUrl={user?.profile_picture_url}
                name={user?.name ?? '?'}
                size="sm"
                className="h-9 w-9"
              />
            </Link>
          </div>
          <div className="mx-auto w-full max-w-6xl px-4 pb-3 sm:px-6 lg:hidden">
            <nav className="grid grid-cols-4 gap-2">
              {headerNav.map((item) => {
                const isActive = item.active(location.pathname);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={cn(
                      'flex min-h-12 flex-col items-center justify-center rounded-xl border border-white/50 bg-white/45 px-2 py-1.5 text-[11px] font-medium shadow-sm backdrop-blur-md transition-colors dark:border-violet-500/20 dark:bg-background/60',
                      isActive
                        ? 'border-violet-400/60 bg-violet-500/15 text-violet-700 dark:text-violet-200'
                        : 'text-muted-foreground hover:border-violet-300/60 hover:text-foreground',
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="mb-0.5 h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <main className="flex-1 overflow-y-visible lg:min-h-0 lg:overflow-y-auto lg:overscroll-y-contain">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[92vw] max-w-[360px] p-0">
          <Sidebar
            mode="mobile"
            onNavigate={() => setMobileSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};
