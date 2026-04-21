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
        'flex min-h-screen flex-col overflow-x-hidden bg-linear-to-br from-sky-50/80 via-background to-violet-50/40',
        'dark:from-background dark:via-background dark:to-primary/5',
        /* Pin shell to viewport on md+ so sidebar height is the screen, not the page */
        'lg:h-dvh lg:max-h-dvh lg:min-h-0 lg:flex-row lg:overflow-hidden',
      )}
    >
      <Sidebar mode="desktop" />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:min-h-0">
        <header className="z-10 shrink-0 border-b border-border/60 bg-background/75 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-background/60 lg:sticky lg:top-0">
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
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
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
                      'flex min-h-12 flex-col items-center justify-center rounded-xl border px-2 py-1.5 text-[11px] font-medium transition-colors',
                      isActive
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border/70 bg-background/60 text-muted-foreground hover:text-foreground',
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
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
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
