import { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  GraduationCap,
  Users,
  CircleHelp,
  Globe2,
  LayoutGrid,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ROUTES } from '@/config';
import { cn } from '@/lib/utils';
import { isStudentRole } from '@/utils/roles';
import { UserAvatar } from '@/components/shared/UserAvatar';

type NavItem = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  isActive: (pathname: string) => boolean;
};

const learnNav: NavItem[] = [
  {
    name: 'Home',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    isActive: (p) =>
      p === ROUTES.DASHBOARD || p === '/learn' || /^\/learn\/?$/.test(p),
  },
  {
    name: 'All courses',
    href: ROUTES.EXPLORE_COURSES,
    icon: Globe2,
    isActive: (p) => p === ROUTES.EXPLORE_COURSES,
  },
  {
    name: 'All materials',
    href: ROUTES.EXPLORE_MATERIALS,
    icon: LayoutGrid,
    isActive: (p) => p === ROUTES.EXPLORE_MATERIALS,
  },
];

const studentNav: NavItem[] = [
  {
    name: 'Peers',
    href: ROUTES.PEERS,
    icon: Users,
    isActive: (p) => p.startsWith('/learn/peers'),
  },
  {
    name: 'Get help',
    href: ROUTES.ENQUIRIES,
    icon: CircleHelp,
    isActive: (p) => p.startsWith('/learn/enquiries'),
  },
];

const tailNav: NavItem[] = [
  {
    name: 'Profile',
    href: ROUTES.PROFILE,
    icon: User,
    isActive: (p) => p.startsWith('/learn/profile'),
  },
  {
    name: 'Preferences',
    href: ROUTES.SETTINGS,
    icon: Settings,
    isActive: (p) => p.startsWith('/learn/settings'),
  },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: logoutContext } = useAuth();
  const logoutMutation = useLogout();

  const navigation = useMemo(() => {
    if (isStudentRole(user?.role)) {
      return { primary: learnNav, mid: studentNav, tail: tailNav };
    }
    return { primary: learnNav, mid: [] as NavItem[], tail: tailNav };
  }, [user?.role]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      logoutContext();
      toast.success('Signed out. See you soon!');
      navigate('/login');
    } catch {
      logoutContext();
      navigate('/login');
    }
  };

  const renderLink = (item: NavItem) => {
    const active = item.isActive(location.pathname);
    return (
      <Link
        key={item.name}
        to={item.href}
        className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
          active
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
        )}
      >
        <item.icon className="h-5 w-5 shrink-0 opacity-90" />
        {item.name}
      </Link>
    );
  };

  return (
    <aside className="w-full shrink-0 border-b border-border/60 bg-card/80 p-3 backdrop-blur-sm md:flex md:h-full md:min-h-0 md:w-[280px] md:border-b-0 md:border-r md:bg-transparent md:p-4 md:backdrop-blur-0">
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-col rounded-2xl border bg-card shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06] md:mx-0 md:h-full md:max-w-none">
        <div className="shrink-0 p-5 pb-4">
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-start gap-3 rounded-xl p-2 -m-2 transition-colors hover:bg-muted/60"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-lg font-semibold tracking-tight leading-tight">
                QuickLabs
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                Learning
              </p>
            </div>
          </Link>
        </div>

        <Separator className="shrink-0 opacity-60" />

        <ScrollArea className="min-h-0 flex-1 overflow-hidden px-3 py-4">
          <nav className="space-y-1">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Learn
            </p>
            {navigation.primary.map(renderLink)}
            {navigation.mid.length > 0 && (
              <>
                <p className="mb-2 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Connect
                </p>
                {navigation.mid.map(renderLink)}
              </>
            )}
            <p className="mb-2 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </p>
            {navigation.tail.map(renderLink)}
          </nav>
        </ScrollArea>

        <Separator className="shrink-0 opacity-60" />

        <div className="shrink-0 p-3">
          <Card className="border-0 bg-muted/50 shadow-none">
            <CardContent className="space-y-3 p-3">
              <div className="flex items-center gap-3">
                <UserAvatar
                  profilePictureUrl={user?.profile_picture_url}
                  name={user?.name ?? '?'}
                  size="sm"
                  className="h-10 w-10 text-sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{user?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full justify-center rounded-lg"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </aside>
  );
};
