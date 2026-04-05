import { cn } from '@/lib/utils';

const N = 8;

const CARD_BG = [
  'bg-sky-500/[0.07]',
  'bg-violet-500/[0.07]',
  'bg-teal-500/[0.07]',
  'bg-amber-500/[0.07]',
  'bg-rose-500/[0.07]',
  'bg-emerald-500/[0.07]',
  'bg-orange-500/[0.07]',
  'bg-cyan-500/[0.07]',
] as const;

const BORDER = [
  'border-l-sky-500/50',
  'border-l-violet-500/50',
  'border-l-teal-500/50',
  'border-l-amber-500/50',
  'border-l-rose-500/50',
  'border-l-emerald-500/50',
  'border-l-orange-500/50',
  'border-l-cyan-500/50',
] as const;

const ICON = [
  'bg-sky-500/15 text-sky-800 dark:text-sky-200',
  'bg-violet-500/15 text-violet-800 dark:text-violet-200',
  'bg-teal-500/15 text-teal-800 dark:text-teal-200',
  'bg-amber-500/15 text-amber-900 dark:text-amber-200',
  'bg-rose-500/15 text-rose-800 dark:text-rose-200',
  'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200',
  'bg-orange-500/15 text-orange-800 dark:text-orange-200',
  'bg-cyan-500/15 text-cyan-800 dark:text-cyan-200',
] as const;

function subjectHueIndex(subjectId: string): number {
  if (!subjectId) return 0;
  let h = 0;
  for (let i = 0; i < subjectId.length; i++) {
    h = (h * 31 + subjectId.charCodeAt(i)) >>> 0;
  }
  return h % N;
}

/** Card / block: soft fill + left stripe (same subject → same colors). */
export function subjectDocumentCardClass(subjectId: string): string {
  const i = subjectHueIndex(subjectId);
  return cn(
    CARD_BG[i],
    'border-l-[3px]',
    BORDER[i],
    'ring-1 ring-black/[0.04] dark:ring-white/[0.06]',
  );
}

export function subjectDocumentIconClass(subjectId: string): string {
  return cn('rounded-xl', ICON[subjectHueIndex(subjectId)]);
}

/** Table row: light stripe + left accent */
export function subjectDocumentRowClass(subjectId: string): string {
  const i = subjectHueIndex(subjectId);
  return cn('border-l-[3px]', BORDER[i], CARD_BG[i]);
}
