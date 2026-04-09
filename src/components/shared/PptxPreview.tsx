import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

type Props = {
  arrayBuffer: ArrayBuffer;
};

export function PptxPreview({ arrayBuffer }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    let active = true;
    let disposer: { destroy: () => void } | null = null;

    const run = async () => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = '';
      setError(null);
      setIsRendering(true);
      try {
        const { PptxViewer } = await import('@aiden0z/pptx-renderer');
        if (!active || !containerRef.current) return;

        disposer = await PptxViewer.open(arrayBuffer, containerRef.current, {
          fitMode: 'contain',
          renderMode: 'list',
          listOptions: {
            windowed: true,
            batchSize: 4,
            initialSlides: 1,
            overscanViewport: 1.2,
          },
        });
      } catch (e: unknown) {
        if (!active) return;
        const message =
          e && typeof e === 'object' && 'message' in e
            ? String((e as { message: string }).message)
            : 'Could not render PPTX preview. Try Download.';
        setError(message);
      } finally {
        if (active) setIsRendering(false);
      }
    };

    void run();

    return () => {
      active = false;
      if (disposer && typeof disposer.destroy === 'function') {
        disposer.destroy();
      }
    };
  }, [arrayBuffer]);

  if (error) {
    return <div className="px-6 py-10 text-center text-sm text-destructive">{error}</div>;
  }

  return (
    <div className="relative max-h-[75vh] overflow-auto bg-muted/20">
      {isRendering ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-[1px]">
          <Loader2 className="h-7 w-7 animate-spin text-primary/80" />
          <p className="text-sm text-muted-foreground">Rendering slides...</p>
        </div>
      ) : null}
      <div ref={containerRef} className="pptx-preview-host min-h-[240px] p-3 sm:p-4" />
      <p className="border-t border-border/40 px-4 py-2.5 text-center text-[11px] text-muted-foreground">
        Slide preview only — use <span className="font-medium text-foreground/80">Download</span> for full file.
      </p>
    </div>
  );
}
