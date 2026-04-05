import { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Minus,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

type Props = {
  blobUrl: string;
  className?: string;
};

const MIN_SCALE = 0.75;
const MAX_SCALE = 2.5;
const SCALE_STEP = 0.15;

export function PdfCanvasPreview({ blobUrl, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState(640);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [docError, setDocError] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      if (w > 0) setPageWidth(Math.min(Math.max(w - 32, 280), 920));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onDocLoad = useCallback(({ numPages: n }: { numPages: number }) => {
    setDocError(null);
    setNumPages(n);
    setPage(1);
  }, []);

  const onDocError = useCallback((err: unknown) => {
    setDocError(
      err instanceof Error ? err.message : String(err || 'Could not read this PDF.'),
    );
  }, []);

  useEffect(() => {
    setPage(1);
    setNumPages(0);
    setDocError(null);
    setScale(1);
  }, [blobUrl]);

  return (
    <div
      className={cn(
        'flex flex-col rounded-b-xl bg-gradient-to-b from-muted/40 to-muted/15',
        className,
      )}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 bg-card/90 px-3 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[5.5rem] text-center text-xs tabular-nums text-muted-foreground">
            {numPages > 0 ? (
              <>
                {page} / {numPages}
              </>
            ) : (
              '—'
            )}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            disabled={numPages === 0 || page >= numPages}
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={scale <= MIN_SCALE}
            onClick={() =>
              setScale((s) =>
                Math.max(MIN_SCALE, Math.round((s - SCALE_STEP) * 100) / 100),
              )
            }
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
            onClick={() =>
              setScale((s) =>
                Math.min(MAX_SCALE, Math.round((s + SCALE_STEP) * 100) / 100),
              )
            }
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative max-h-[min(72vh,820px)] min-h-[320px] overflow-auto overscroll-contain px-3 py-4"
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
              <div className="flex min-h-[280px] items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Rendering PDF…
              </div>
            }
            className="flex flex-col items-center"
          >
            <div className="rounded-lg border border-border/40 bg-background shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              {numPages > 0 ? (
                <Page
                  pageNumber={page}
                  width={pageWidth}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="max-w-full [&_.react-pdf__Page__canvas]:max-w-full"
                />
              ) : null}
            </div>
          </Document>
        )}
      </div>

      <p className="border-t border-border/40 px-4 py-2 text-center text-[11px] text-muted-foreground">
        Preview only — use <span className="font-medium text-foreground/80">Download</span> to save a copy.
      </p>
    </div>
  );
}
