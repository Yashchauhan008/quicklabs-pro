import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

type Props = {
  arrayBuffer: ArrayBuffer;
};

export function DocxPreview({ arrayBuffer }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    let resizeObserver: ResizeObserver | null = null;

    const fitPagesToContainer = (host: HTMLDivElement) => {
      const wrappers = Array.from(
        host.querySelectorAll<HTMLElement>('.docx-wrapper'),
      );
      const pages = Array.from(
        host.querySelectorAll<HTMLElement>(
          '.docx-wrapper > section, section.docx',
        ),
      );
      if (!container) return;

      for (const wrapper of wrappers) {
        wrapper.style.background = 'transparent';
        wrapper.style.boxShadow = 'none';
      }

      if (!pages.length) return;

      const availableWidth = Math.max(0, container.clientWidth - 8);
      for (const page of pages) {
        page.style.boxShadow = 'none';
        page.style.border = '1px solid hsl(var(--border) / 0.5)';
        page.style.backgroundColor = 'white';
        // Reset before measuring natural width.
        page.style.removeProperty('zoom');
        const naturalWidth = page.offsetWidth || page.scrollWidth;
        if (!naturalWidth) continue;
        const scale = Math.min(1, availableWidth / naturalWidth);
        page.style.setProperty('zoom', `${scale}`);
        page.style.marginLeft = 'auto';
        page.style.marginRight = 'auto';
      }
    };

    const render = async () => {
      if (!container) return;

      container.innerHTML = '';
      const host = document.createElement('div');
      host.style.width = '100%';
      container.appendChild(host);

      const docxPreview = await import('docx-preview');
      if (cancelled) return;

      host.innerHTML = '';
      await docxPreview.renderAsync(arrayBuffer, host, undefined, {
        className: 'docx',
        inWrapper: true,
        breakPages: true,
        renderHeaders: true,
        renderFooters: true,
        useBase64URL: true,
      });

      fitPagesToContainer(host);
      resizeObserver = new ResizeObserver(() => fitPagesToContainer(host));
      resizeObserver.observe(container);
    };

    void render();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      if (container) container.innerHTML = '';
    };
  }, [arrayBuffer]);

  return (
    <div className="flex w-full min-w-0 max-h-[min(88vh,920px)] flex-col overflow-hidden bg-linear-to-b from-muted/25 to-muted/10">
      <div
        ref={containerRef}
        className="document-preview-docx min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4"
      >
        <div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Preparing document preview...
        </div>
      </div>
      <p className="shrink-0 border-t border-border/40 px-4 py-2.5 text-center text-[11px] text-muted-foreground sm:px-6">
        Preview only — use <span className="font-medium text-foreground/80">Download</span> to save a copy.
      </p>
    </div>
  );
}
