/** Stable key so the same logical file is not added twice from repeated picks. */
export function fileDedupeKey(f: File): string {
  return `${f.name}\0${f.size}\0${f.lastModified}`;
}

export type MergeIntoFileListResult = {
  merged: File[];
  skippedDupes: number;
  capped: boolean;
};

/** Append `picked` to `existing` without duplicates, stopping at `maxTotal` files. */
export function mergeIntoFileList(
  existing: File[],
  picked: File[],
  maxTotal: number,
): MergeIntoFileListResult {
  const merged: File[] = [...existing];
  const keys = new Set(existing.map(fileDedupeKey));
  let skippedDupes = 0;
  let capped = false;

  for (const f of picked) {
    if (merged.length >= maxTotal) {
      capped = true;
      break;
    }
    const k = fileDedupeKey(f);
    if (keys.has(k)) {
      skippedDupes += 1;
      continue;
    }
    keys.add(k);
    merged.push(f);
  }

  return { merged, skippedDupes, capped };
}
