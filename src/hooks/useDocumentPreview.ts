import { useEffect, useRef, useState } from 'react';
import { downloadDocumentFile } from '@/services/api/document';
import type { DocumentPreviewMode } from '@/utils/documentPreview';

export type DocumentPreviewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message?: string }
  | { status: 'ready'; blobUrl: string; mode: 'pdf' | 'image' }
  | { status: 'ready'; html: string; mode: 'docx' };

export type DocumentPreviewOptions = {
  /** From GET document (`file_mime_type` / `mime_type`) — used when download response omits a useful type */
  mimeHint?: string | null;
};

function isPdfBuffer(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;
  const u8 = new Uint8Array(buffer, 0, 4);
  return (
    u8[0] === 0x25 &&
    u8[1] === 0x50 &&
    u8[2] === 0x44 &&
    u8[3] === 0x46
  );
}

function jsonErrorMessageFromBuffer(buffer: ArrayBuffer): string | null {
  if (buffer.byteLength > 256 * 1024) return null;
  const text = new TextDecoder().decode(buffer).trim();
  if (!text.startsWith('{') && !text.startsWith('[')) return null;
  try {
    const j = JSON.parse(text) as { message?: string };
    return typeof j.message === 'string' && j.message ? j.message : null;
  } catch {
    return null;
  }
}

function normalizeImageMime(
  responseBlob: Blob,
  mimeHint: string | undefined,
  responseContentType: string | null,
): string {
  const fromBlob = responseBlob.type?.split(';')[0]?.trim().toLowerCase();
  if (fromBlob && fromBlob.startsWith('image/')) return fromBlob;

  const fromHeader = responseContentType?.split(';')[0]?.trim().toLowerCase();
  if (fromHeader?.startsWith('image/')) return fromHeader;

  const hint = mimeHint?.split(';')[0]?.trim().toLowerCase();
  if (hint?.startsWith('image/')) return hint;

  return 'image/png';
}

/**
 * Authenticated download → Blob with a browser-useful MIME so iframe/img can render.
 * `res.download()` + octet-stream is fine; we re-type from bytes + document metadata.
 */
export function useDocumentPreview(
  documentId: string | undefined,
  mode: DocumentPreviewMode,
  options?: DocumentPreviewOptions,
): DocumentPreviewState {
  const mimeHint = options?.mimeHint ?? undefined;

  const [state, setState] = useState<DocumentPreviewState>(() =>
    mode === 'none' ? { status: 'idle' } : { status: 'loading' },
  );
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    if (!documentId || mode === 'none') {
      setState({ status: 'idle' });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    (async () => {
      try {
        const { blob, contentType } = await downloadDocumentFile(documentId);
        if (cancelled) return;

        if (mode === 'pdf') {
          const ab = await blob.arrayBuffer();
          if (cancelled) return;
          if (!isPdfBuffer(ab)) {
            const apiMsg = jsonErrorMessageFromBuffer(ab);
            throw new Error(
              apiMsg ??
                'The file is not a PDF or the server returned an error. Try Download.',
            );
          }
          const pdfBlob = new Blob([ab], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(pdfBlob);
          blobUrlRef.current = blobUrl;
          setState({ status: 'ready', blobUrl, mode: 'pdf' });
          return;
        }

        if (mode === 'image') {
          const ab = await blob.arrayBuffer();
          if (cancelled) return;
          const imageType = normalizeImageMime(blob, mimeHint, contentType);
          const imageBlob = new Blob([ab], { type: imageType });
          const blobUrl = URL.createObjectURL(imageBlob);
          blobUrlRef.current = blobUrl;
          setState({ status: 'ready', blobUrl, mode: 'image' });
          return;
        }

        if (mode === 'docx') {
          const ab = await blob.arrayBuffer();
          const { default: mammoth } = await import('mammoth');
          const result = await mammoth.convertToHtml({ arrayBuffer: ab });
          if (cancelled) return;
          setState({
            status: 'ready',
            html: result.value,
            mode: 'docx',
          });
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const message =
            e && typeof e === 'object' && 'message' in e
              ? String((e as { message: string }).message)
              : undefined;
          setState({ status: 'error', message });
        }
      }
    })();

    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [documentId, mode, mimeHint]);

  return state;
}
