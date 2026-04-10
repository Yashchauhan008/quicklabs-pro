import { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Worker version must match the pdfjs API bundled inside react-pdf.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type Props = {
  blobUrl: string;
  className?: string;
};

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
const SCALE_STEP = 0.25;

export function PdfCanvasPreview({ blobUrl, className }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageWidthPx, setPageWidthPx] = useState(640);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [docError, setDocError] = useState<string | null>(null);
  const rafRef = useRef<number>(0);
  const lastWidthRef = useRef(0);

  // Keep page width in sync with scroll area — debounced via rAF.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      const pad = 40; // account for px-5 (20px × 2)
      if (w < pad + 80) return;
      const next = Math.min(Math.max(w - pad, 280), 960);
      if (Math.abs(next - lastWidthRef.current) < 2) return;
      lastWidthRef.current = next;
      setPageWidthPx(next);
    };

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    });
    ro.observe(el);
    update();
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  // Reset on new file.
  useEffect(() => {
    setNumPages(0);
    setDocError(null);
    setScale(1);
    lastWidthRef.current = 0;
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = 0;
      const w = el.clientWidth;
      const pad = 40;
      if (w >= pad + 80) {
        const next = Math.min(Math.max(w - pad, 280), 960);
        lastWidthRef.current = next;
        setPageWidthPx(next);
      }
    }
  }, [blobUrl]);

  const onDocLoad = useCallback(({ numPages: n }: { numPages: number }) => {
    setDocError(null);
    setNumPages(n);
  }, []);

  const onDocError = useCallback((err: unknown) => {
    setDocError(err instanceof Error ? err.message : String(err || 'Could not load PDF.'));
  }, []);

  return (
    <div
      className={cn(
        'flex max-h-[min(88vh,920px)] w-full min-w-0 flex-col overflow-hidden rounded-b-xl bg-muted/10',
        className,
      )}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Toolbar — zoom only */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/50 bg-card/90 px-4 py-2.5 backdrop-blur-sm sm:px-5">
        <span className="text-xs text-muted-foreground tabular-nums">
          {numPages > 0 ? `${numPages} page${numPages !== 1 ? 's' : ''}` : '—'}
        </span>
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={scale <= MIN_SCALE}
            onClick={() => setScale((s) => Math.max(MIN_SCALE, Math.round((s - SCALE_STEP) * 100) / 100))}
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={scale >= MAX_SCALE}
            onClick={() => setScale((s) => Math.min(MAX_SCALE, Math.round((s + SCALE_STEP) * 100) / 100))}
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* All pages — vertical scroll */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]"
        onContextMenu={(e) => e.preventDefault()}
      >
        {docError ? (
          <p className="py-12 text-center text-sm text-destructive">{docError}</p>
        ) : (
          <Document
            key={blobUrl}
            file={blobUrl}
            onLoadSuccess={onDocLoad}
            onLoadError={onDocError}
            loading={
              <div className="flex min-h-[320px] items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading PDF…
              </div>
            }
            className="flex flex-col items-center gap-3 px-5 py-4"
          >
            {numPages > 0
              ? Array.from({ length: numPages }, (_, i) => (
                  <div
                    key={i + 1}
                    className="w-full rounded-md border border-border/40 bg-background shadow-sm ring-1 ring-black/5 dark:ring-white/10 [&_.react-pdf__Page]:transition-none [&_.react-pdf__Page__canvas]:transition-none"
                  >
                    <Page
                      pageNumber={i + 1}
                      width={pageWidthPx}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="max-w-full [&_.react-pdf__Page__canvas]:max-w-full"
                    />
                  </div>
                ))
              : null}
          </Document>
        )}
      </div>

      <p className="shrink-0 border-t border-border/40 px-4 py-2.5 text-center text-[11px] text-muted-foreground sm:px-6">
        Preview only — use <span className="font-medium text-foreground/80">Download</span> to save a copy.
      </p>
    </div>
  );
}
