import type { PaginationMeta } from '@/types/general';

function fallbackMeta(page: number, limit: number): PaginationMeta {
  return {
    page,
    limit,
    total: 0,
    totalPages: 0,
  };
}

function normalizeMeta(
  raw: Record<string, unknown> | undefined,
  page: number,
  limit: number,
): PaginationMeta {
  if (!raw || typeof raw !== 'object') {
    return fallbackMeta(page, limit);
  }
  const total = Number(
    raw.total ??
      raw.total_count ??
      raw.totalCount ??
      raw.total_items ??
      raw.totalItems ??
      0,
  );
  const lim = Number(raw.limit ?? raw.per_page ?? raw.page_size ?? limit);
  const pg = Number(raw.page ?? raw.current_page ?? raw.currentPage ?? page);
  let totalPages = Number(
    raw.totalPages ?? raw.total_pages ?? raw.page_count ?? raw.total_pages_count ?? 0,
  );
  if (!totalPages && total > 0 && lim > 0) {
    totalPages = Math.ceil(total / lim);
  }
  return { page: pg, limit: lim, total, totalPages };
}

export function parsePaginatedList<T>(
  body: unknown,
  params: { page: number; limit: number },
): { items: T[]; meta: PaginationMeta } {
  if (!body || typeof body !== 'object') {
    return { items: [], meta: fallbackMeta(params.page, params.limit) };
  }
  const o = body as Record<string, unknown>;
  const meta: PaginationMeta = normalizeMeta(
    (o.meta ?? o.pagination) as Record<string, unknown> | undefined,
    params.page,
    params.limit,
  );

  if (Array.isArray(o.data)) {
    return { items: o.data as T[], meta };
  }

  const nested = o.data as { items?: T[]; meta?: PaginationMeta } | null | undefined;
  if (nested && typeof nested === 'object' && Array.isArray(nested.items)) {
    const innerMeta = nested.meta as Record<string, unknown> | undefined;
    return {
      items: nested.items,
      meta: innerMeta
        ? normalizeMeta(innerMeta, params.page, params.limit)
        : meta,
    };
  }

  return { items: [], meta };
}

export function parseEntity<T>(body: unknown): T | null {
  if (!body || typeof body !== 'object') return null;
  const data = (body as { data?: T }).data;
  return data === undefined ? null : data;
}
