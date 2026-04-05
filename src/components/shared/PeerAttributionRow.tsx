import type { ReactNode } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { ROUTES } from '@/config';
import { useAuth } from '@/context/AuthContext';
import { isStudentRole } from '@/utils/roles';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import {
  useListBookmarkedPeers,
  usePinPeer,
  useUnpinPeer,
} from '@/hooks/useStudentFeatures';
import { cn } from '@/lib/utils';

type Variant = 'footer' | 'detail';

export type PeerAttributionRowProps = {
  label: string;
  userId?: string | null;
  displayName: string;
  profilePictureUrl?: string | null;
  className?: string;
  avatarClassName?: string;
  variant?: Variant;
  children?: ReactNode;
  /** When false, hide bookmark control even for students */
  showPin?: boolean;
  /** After the name (footer only), e.g. file counts */
  trailing?: ReactNode;
  /** Skip default footer top border / margin */
  hideFooterBorder?: boolean;
  /** Footer: override label row (e.g. accent banner) */
  labelClassName?: string;
  /** Footer: name link / span typography (default text-xs) */
  footerNameClassName?: string;
  /** Footer: trailing fragment (e.g. counts) */
  trailingClassName?: string;
};

const profileLinkFocus =
  'rounded-md outline-none ring-offset-background transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring';

export function PeerAttributionRow({
  label,
  userId,
  displayName,
  profilePictureUrl,
  className,
  avatarClassName,
  variant = 'footer',
  children,
  showPin,
  trailing,
  hideFooterBorder,
  labelClassName,
  footerNameClassName,
  trailingClassName,
}: PeerAttributionRowProps) {
  const { user } = useAuth();
  const isSelf =
    !!user?.id && !!userId && String(user.id) === String(userId);
  const isStudent = isStudentRole(user?.role);
  const effectiveShowPin =
    showPin !== false && isStudent && !!userId && !isSelf;
  const { data: bookmarks = [] } = useListBookmarkedPeers();
  const pinMutation = usePinPeer();
  const unpinMutation = useUnpinPeer();
  const isPinned = !!userId && bookmarks.some((b) => b.id === userId);
  const pinBusy =
    (pinMutation.isPending && pinMutation.variables === userId) ||
    (unpinMutation.isPending && unpinMutation.variables === userId);

  const profileTo =
    userId == null || userId === ''
      ? null
      : isSelf
        ? ROUTES.PROFILE
        : generatePath(ROUTES.PEER_PROFILE, { peerId: userId });

  const footerNameClass = cn(
    'block min-w-0 truncate text-xs font-medium leading-tight text-foreground/90',
    footerNameClassName,
  );

  const pinBtn =
    effectiveShowPin && userId ? (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
        disabled={pinBusy}
        title={isPinned ? 'Unpin' : 'Pin peer'}
        aria-label={isPinned ? 'Unpin peer' : 'Pin peer'}
        onClick={() =>
          isPinned ? unpinMutation.mutate(userId) : pinMutation.mutate(userId)
        }
      >
        {isPinned ? (
          <BookmarkCheck className="h-4 w-4 text-primary" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </Button>
    ) : null;

  if (variant === 'detail') {
    return (
      <div
        className={cn(
          'flex max-w-lg items-start gap-2 text-xs text-muted-foreground',
          className,
        )}
      >
        <div className="min-w-0 flex-1">
          {profileTo ? (
            <Link
              to={profileTo}
              className={cn(
                'group flex items-start gap-2',
                profileLinkFocus,
                '-m-1 p-1',
              )}
            >
              <UserAvatar
                profilePictureUrl={profilePictureUrl}
                name={displayName}
                size="sm"
                className={cn('h-6 w-6 shrink-0 opacity-90', avatarClassName)}
              />
              <p className="min-w-0 flex-1 leading-snug">
                <span className="text-muted-foreground/90">{label}</span>
                <span className="text-muted-foreground/50"> · </span>
                <span className="font-medium text-primary group-hover:underline">
                  {displayName}
                </span>
              </p>
            </Link>
          ) : (
            <div className="flex items-start gap-2">
              <UserAvatar
                profilePictureUrl={profilePictureUrl}
                name={displayName}
                size="sm"
                className={cn('h-6 w-6 shrink-0 opacity-90', avatarClassName)}
              />
              <p className="min-w-0 flex-1 leading-snug">
                <span className="text-muted-foreground/90">{label}</span>
                <span className="text-muted-foreground/50"> · </span>
                <span className="font-medium text-foreground/85">
                  {displayName}
                </span>
              </p>
            </div>
          )}
          {children}
        </div>
        {pinBtn ? (
          <div className="shrink-0 self-center pt-0.5">{pinBtn}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        !hideFooterBorder && 'mt-3 border-t border-border/50 pt-2',
        className,
      )}
    >
      {profileTo ? (
        <Link
          to={profileTo}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2',
            profileLinkFocus,
            '-my-1 -ml-1 py-1 pl-1 pr-0',
          )}
        >
          <UserAvatar
            profilePictureUrl={profilePictureUrl}
            name={displayName}
            size="sm"
            className={cn('h-6 w-6 shrink-0', avatarClassName)}
          />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'text-[10px] font-medium uppercase tracking-wide text-muted-foreground',
                labelClassName,
              )}
            >
              {label}
            </p>
            <div className="flex min-w-0 items-baseline gap-1.5">
              <span className={cn(footerNameClass, 'flex-1')}>
                {displayName}
              </span>
              {trailing ? (
                <span
                  className={cn(
                    'shrink-0 text-xs font-normal text-muted-foreground',
                    trailingClassName,
                  )}
                >
                  {trailing}
                </span>
              ) : null}
            </div>
          </div>
        </Link>
      ) : (
        <>
          <UserAvatar
            profilePictureUrl={profilePictureUrl}
            name={displayName}
            size="sm"
            className={cn('h-6 w-6 shrink-0', avatarClassName)}
          />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'text-[10px] font-medium uppercase tracking-wide text-muted-foreground',
                labelClassName,
              )}
            >
              {label}
            </p>
            <div className="flex min-w-0 items-baseline gap-1.5">
              <span className={cn(footerNameClass, 'flex-1 text-foreground/85')}>
                {displayName}
              </span>
              {trailing ? (
                <span
                  className={cn(
                    'shrink-0 text-xs font-normal text-muted-foreground',
                    trailingClassName,
                  )}
                >
                  {trailing}
                </span>
              ) : null}
            </div>
          </div>
        </>
      )}
      {pinBtn}
    </div>
  );
}
