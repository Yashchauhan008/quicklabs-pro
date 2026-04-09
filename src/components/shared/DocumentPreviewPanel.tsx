import type { SyntheticEvent } from 'react';
import { Loader2 } from 'lucide-react';
import type { DocumentPreviewState } from '@/hooks/useDocumentPreview';
import type { DocumentPreviewMode } from '@/utils/documentPreview';
import { PdfCanvasPreview } from '@/components/shared/PdfCanvasPreview';
import { PptxPreview } from '@/components/shared/PptxPreview';
import { cn } from '@/lib/utils';

type Props = {
  mode: DocumentPreviewMode;
  state: DocumentPreviewState;
  /** Used for image preview `alt` text */
  documentTitle?: string;
};

/** Reduce “Save image / open in new tab” from the preview surface only (not a security boundary). */
function blockPreviewExfiltration(e: SyntheticEvent) {
  e.preventDefault();
}

export function DocumentPreviewPanel({
  mode,
  state,
  documentTitle,
}: Props) {
  if (mode === 'none') {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center text-sm text-muted-foreground">
        <p className="max-w-sm">
          No inline preview for this type (for example ZIP archives or older
          .doc files). Use <span className="font-medium text-foreground/80">Download</span> to open it on your device.
        </p>
      </div>
    );
  }

  if (state.status === 'loading' || state.status === 'idle') {
    const progress = state.status === 'loading' ? state.progressPercent : undefined;
    const width = Math.max(6, Math.min(100, progress ?? 12));
    const label =
      state.status === 'loading' && state.stage === 'processing'
        ? 'Preparing preview...'
        : 'Downloading preview...';
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 px-6 text-sm text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
        <div className="w-full max-w-sm space-y-2">
          <p className="text-center">{label}</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${width}%` }}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground/90">
            {state.status === 'loading' && progress != null ? `${progress}%` : 'Starting...'}
          </p>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="px-6 py-10 text-center text-sm text-destructive">
        {state.message || 'Could not load preview. Try Download.'}
      </div>
    );
  }

  if (state.status === 'ready' && state.mode === 'pdf') {
    return <PdfCanvasPreview blobUrl={state.blobUrl} />;
  }

  if (state.status === 'ready' && state.mode === 'image') {
    return (
      <div
        className="flex max-h-[min(75vh,820px)] flex-col bg-gradient-to-b from-muted/30 to-muted/10"
        onContextMenu={blockPreviewExfiltration}
      >
        <div className="flex max-h-[min(70vh,760px)] justify-center overflow-auto overscroll-contain px-4 py-6">
          <div
            className={cn(
              'inline-block rounded-xl border border-border/50 bg-background p-2 shadow-md',
              'ring-1 ring-black/5 dark:ring-white/10',
            )}
          >
            <img
              src={state.blobUrl}
              alt={documentTitle ? `Preview: ${documentTitle}` : 'Image preview'}
              className="max-h-[min(65vh,700px)] max-w-full object-contain select-none"
              draggable={false}
              onContextMenu={blockPreviewExfiltration}
              onDragStart={blockPreviewExfiltration}
            />
          </div>
        </div>
        <p className="border-t border-border/40 px-4 py-2.5 text-center text-[11px] text-muted-foreground">
          Preview only — use <span className="font-medium text-foreground/80">Download</span> to save a copy.
        </p>
      </div>
    );
  }

  if (state.status === 'ready' && state.mode === 'docx') {
    return (
      <div
        className="flex max-h-[75vh] flex-col bg-gradient-to-b from-muted/25 to-muted/10"
        onContextMenu={blockPreviewExfiltration}
      >
        <div
          className={cn(
            'document-preview-docx max-h-[min(68vh,720px)] overflow-auto px-5 py-5 text-sm leading-relaxed',
            'select-text rounded-b-none border-x border-t-0 border-border/40 bg-card/50',
            '[&_p]:mb-2 [&_table]:mb-4 [&_table]:w-full [&_table]:border-collapse',
            '[&_td]:border [&_td]:border-border/60 [&_td]:p-1.5',
            '[&_th]:border [&_th]:border-border/60 [&_th]:p-1.5',
          )}
          dangerouslySetInnerHTML={{ __html: state.html }}
        />
        <p className="border-t border-border/40 px-4 py-2.5 text-center text-[11px] text-muted-foreground">
          Preview only — use <span className="font-medium text-foreground/80">Download</span> to save a copy.
        </p>
      </div>
    );
  }

  if (state.status === 'ready' && state.mode === 'pptx') {
    return <PptxPreview arrayBuffer={state.arrayBuffer} />;
  }

  return null;
}
