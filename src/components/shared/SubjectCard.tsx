import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PeerAttributionRow } from '@/components/shared/PeerAttributionRow';
import { type Subject } from '@/types/subject';
import { cn } from '@/lib/utils';
import { truncateText } from '@/utils/formate';
import { resolvePublicFileUrl } from '@/utils/publicFileUrl';
import { pickSubjectCreator } from '@/utils/displayUser';
import { BookOpen } from 'lucide-react';

type SubjectCardProps = {
  subject: Subject;
  href: string;
  compact?: boolean;
  showCreator?: boolean;
  className?: string;
};

export function SubjectCard({
  subject,
  href,
  compact = false,
  showCreator = true,
  className,
}: SubjectCardProps) {
  const creator = pickSubjectCreator(subject);
  const subjectImageSrc = resolvePublicFileUrl(subject.banner_url);

  if (compact) {
    return (
      <Link
        to={href}
        className={cn(
          'group aspect-square overflow-hidden rounded-lg border border-violet-200/60 bg-linear-to-br from-white/88 via-violet-50/40 to-indigo-50/30 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md dark:border-violet-500/20 dark:from-background/90 dark:via-violet-500/8 dark:to-indigo-500/8 dark:ring-white/10',
          className,
        )}
      >
        <div className="flex h-full flex-col justify-between p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="space-y-1.5">
            <p className="line-clamp-2 text-left text-xs font-semibold leading-snug group-hover:text-primary">
              {subject.name}
            </p>
            <Badge variant="outline" className="w-fit px-1 py-0 text-[9px]">
              Course
            </Badge>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Card
      className={cn(
        'h-full gap-0 rounded-xl border border-violet-200/50 bg-linear-to-br from-white/90 via-violet-50/45 to-indigo-50/35 py-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-violet-500/20 dark:from-background/90 dark:via-violet-500/8 dark:to-indigo-500/8',
        className,
      )}
    >
      <CardContent className="flex flex-col p-3.5 pt-3">
        <Link
          to={href}
          className="group -m-3.5 mb-0 rounded-t-xl p-3.5 pb-0 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="mb-2 flex items-start gap-3">
            <div className="shrink-0">
              {subjectImageSrc ? (
                <img
                  src={subjectImageSrc}
                  alt={`${subject.name} course`}
                  className="h-20 w-20 rounded-lg border border-border/30 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border/30 bg-primary/10 text-primary shadow-sm">
                  <BookOpen className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <h2 className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-primary">
                {subject.name}
              </h2>
              <div className="mt-1.5">
                <Badge variant="secondary" className="rounded-md px-2 py-0 text-[10px]">
                  Course
                </Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {subject.description ? truncateText(subject.description, 120) : 'No description.'}
              </p>
            </div>
          </div>
        </Link>
        {showCreator ? (
          <PeerAttributionRow
            label="Created by"
            userId={creator.id}
            displayName={creator.label}
            profilePictureUrl={creator.profilePictureUrl}
            className="border-border/60 pt-2.5"
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
