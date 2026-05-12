import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PeerAttributionRow } from '@/components/shared/PeerAttributionRow';
import { DOCUMENT_KIND_LABELS, type SubjectDocument } from '@/types/document';
import { cn } from '@/lib/utils';
import { formatFileSize, truncateText } from '@/utils/formate';
import { getDocumentFileExtension } from '@/utils/documentPreview';
import { pickDocumentUploader } from '@/utils/displayUser';
import { subjectDocumentIconClass } from '@/utils/subjectAccent';
import { ArrowUpRight, FileText } from 'lucide-react';

type MaterialCardProps = {
  document: SubjectDocument;
  href: string;
  courseName?: string;
  isStudent?: boolean;
  compact?: boolean;
  showUploader?: boolean;
  showVisibility?: boolean;
  variant?: 'default' | 'explore';
  className?: string;
};

export function MaterialCard({
  document,
  href,
  courseName,
  isStudent,
  compact = false,
  showUploader = true,
  showVisibility = false,
  variant = 'default',
  className,
}: MaterialCardProps) {
  void isStudent;
  const uploader = pickDocumentUploader(document);
  const totalFiles = document.file_count ?? 1;
  if (compact) {
    return (
      <Link
        to={href}
        className={cn(
          'group aspect-square overflow-hidden rounded-lg border border-violet-200/60 bg-linear-to-br from-white/88 via-violet-50/40 to-indigo-50/30 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md dark:border-violet-500/20 dark:from-background/90 dark:via-violet-500/8 dark:to-indigo-500/8 dark:ring-white/10',
          className,
        )}
      >
        <Card className="h-full gap-0 border-0 bg-transparent py-0 shadow-none">
          <CardContent className="flex h-full flex-col p-2.5 pt-2">
            <div
              className={cn(
                'mb-1.5 flex h-7 w-7 items-center justify-center',
                subjectDocumentIconClass(document.subject_id),
              )}
            >
              <FileText className="h-3.5 w-3.5 opacity-90" />
            </div>
            <p className="line-clamp-3 text-left text-[11px] font-semibold leading-tight group-hover:text-primary">
              {document.title}
            </p>
            {courseName ? (
              <p className="mt-1 line-clamp-1 text-[10px] text-muted-foreground">
                {courseName}
              </p>
            ) : null}
            {document.kind ? (
              <Badge
                variant="secondary"
                className="mt-auto w-fit px-1 py-0 text-[9px] font-normal"
              >
                {DOCUMENT_KIND_LABELS[document.kind]}
              </Badge>
            ) : null}
            <div className="mt-1 flex flex-wrap items-center gap-1">
              <Badge variant="outline" className="px-1 py-0 text-[9px] uppercase">
                .{getDocumentFileExtension(document)}
              </Badge>
              <Badge variant="outline" className="px-1 py-0 text-[9px]">
                {totalFiles} {totalFiles === 1 ? 'file' : 'files'}
              </Badge>
            </div>
            {document.file_size != null ? (
              <span className="mt-1 text-[10px] text-muted-foreground">
                {formatFileSize(document.file_size)}
              </span>
            ) : null}
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (variant === 'explore') {
    return (
      <Link
        to={href}
        className={cn(
          'group block h-full rounded-2xl border border-border/60 bg-card p-3 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              subjectDocumentIconClass(document.subject_id),
            )}
          >
            <FileText className="h-5 w-5 opacity-90" />
          </div>
          <div className="flex items-center gap-1.5">
            {showVisibility ? (
              <Badge variant="secondary" className="shrink-0 font-mono text-[10px]">
                {document.visibility}
              </Badge>
            ) : document.kind ? (
              <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px]">
                {DOCUMENT_KIND_LABELS[document.kind]}
              </Badge>
            ) : null}
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition group-hover:text-primary">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          <h2 className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-primary">
            {document.title}
          </h2>

          {courseName ? (
            <p className="line-clamp-1 text-xs font-medium text-muted-foreground">
              {courseName}
            </p>
          ) : null}

          {document.description ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {truncateText(document.description, 96)}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="rounded-md px-2 py-0 text-[10px] uppercase">
              .{getDocumentFileExtension(document)}
            </Badge>
            <Badge variant="outline" className="rounded-md px-2 py-0 text-[10px]">
              {totalFiles} {totalFiles === 1 ? 'file' : 'files'}
            </Badge>
            <Badge variant="outline" className="rounded-md px-2 py-0 text-[10px]">
              {document.download_count ?? 0} download
              {(document.download_count ?? 0) === 1 ? '' : 's'}
            </Badge>
            {document.file_size != null ? (
              <Badge variant="outline" className="rounded-md px-2 py-0 text-[10px]">
                {formatFileSize(document.file_size)}
              </Badge>
            ) : null}
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
          <div className="mb-2 flex items-start justify-between gap-2">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center',
                subjectDocumentIconClass(document.subject_id),
              )}
            >
              <FileText className="h-4 w-4 opacity-90" />
            </div>
            {showVisibility ? (
              <Badge variant="secondary" className="shrink-0 font-mono text-[10px]">
                {document.visibility}
              </Badge>
            ) : document.kind ? (
              <Badge
                variant="secondary"
                className="shrink-0 px-1.5 py-0 text-[11px] font-normal leading-tight"
              >
                {DOCUMENT_KIND_LABELS[document.kind]}
              </Badge>
            ) : null}
          </div>
          <h2 className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-primary">
            {document.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {courseName ? (
              <Badge variant="secondary" className="rounded-md px-2 py-0 text-[10px]">
                {courseName}
              </Badge>
            ) : null}
            <Badge
              variant="outline"
              className="rounded-md px-2 py-0 text-[10px] uppercase"
            >
              .{getDocumentFileExtension(document)}
            </Badge>
            <Badge variant="outline" className="rounded-md px-2 py-0 text-[10px]">
              {totalFiles} {totalFiles === 1 ? 'file' : 'files'}
            </Badge>
          </div>
          {document.description ? (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {truncateText(document.description, 100)}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
            {document.file_size != null ? (
              <span>{formatFileSize(document.file_size)}</span>
            ) : null}
          </div>
        </Link>
        {showUploader ? (
          <PeerAttributionRow
            label="Uploaded by"
            userId={uploader.id}
            displayName={uploader.label}
            profilePictureUrl={uploader.profilePictureUrl}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
