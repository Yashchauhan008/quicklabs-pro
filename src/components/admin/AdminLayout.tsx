import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { BreadcrumbNav } from './BreadcrumbNav';

export const LearningLayout = () => {
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-br from-sky-50/80 via-background to-violet-50/40',
        'dark:from-background dark:via-background dark:to-primary/5',
        /* Pin shell to viewport on md+ so sidebar height is the screen, not the page */
        'md:h-[100dvh] md:max-h-[100dvh] md:min-h-0 md:flex-row md:overflow-hidden',
      )}
    >
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:min-h-0">
        <header className="z-10 shrink-0 border-b border-border/60 bg-background/75 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/60 md:sticky md:top-0">
          <div className="mx-auto flex h-14 max-w-6xl items-center px-4 md:px-8">
            <BreadcrumbNav />
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
