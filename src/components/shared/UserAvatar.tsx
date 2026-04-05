import { useState } from 'react';
import { User } from 'lucide-react';
import { resolvePublicFileUrl } from '@/utils/publicFileUrl';
import { cn } from '@/lib/utils';

type UserAvatarProps = {
  /** Raw `profile_picture_url` from API (path or absolute URL) */
  profilePictureUrl?: string | null;
  name: string;
  className?: string;
  /** Pixel size hint for initials fallback */
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-lg',
};

export function UserAvatar({
  profilePictureUrl,
  name,
  className,
  size = 'md',
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const src = resolvePublicFileUrl(profilePictureUrl);
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || '?';

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        className={cn(
          'shrink-0 rounded-full object-cover ring-1 ring-border/60',
          sizeClasses[size],
          className,
        )}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary ring-1 ring-border/40',
        sizeClasses[size],
        className,
      )}
      aria-hidden
    >
      {initial !== '?' ? (
        <span>{initial}</span>
      ) : (
        <User className="h-[45%] w-[45%]" />
      )}
    </div>
  );
}
