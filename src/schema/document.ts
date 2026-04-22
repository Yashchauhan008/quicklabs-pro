import { z } from 'zod';
import { MAX_FILE_SIZE } from '@/config/var';

const visibilitySchema = z.enum(['PUBLIC', 'PRIVATE']);

export const documentKindSchema = z.enum(['informational', 'lab_solutions']);

const fileItemSchema = z
  .instanceof(File, { message: 'Invalid file' })
  .refine((f) => f.size > 0, 'File is empty')
  .refine((f) => f.size <= MAX_FILE_SIZE, 'Each file must be 75MB or smaller');

export const documentUploadSchema = z
  .object({
    subject_id: z.string().uuid('Select a valid course'),
    title: z
      .string()
      .min(1, 'Title is required')
      .max(500, 'Title is too long')
      .trim(),
    description: z
      .string()
      .max(2000, 'Description is too long')
      .optional(),
    visibility: visibilitySchema,
    kind: documentKindSchema,
    university_id: z.string().uuid().optional().or(z.literal('')),
    batch_year: z.string().optional(),
    semester: z.string().optional(),
    files: z
      .array(fileItemSchema)
      .min(1, 'Add at least one file')
      .max(10, 'You can attach at most 10 files'),
    main_file_index: z.number().int().min(0),
    /** Required display title per file, max 50 chars — aligned with `files` index */
    file_titles: z.array(z.string().max(50, 'Max 50 characters')).optional(),
    /** Per-file notes aligned with `files` index */
    file_descriptions: z.array(z.string().max(1000)).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.main_file_index >= data.files.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Pick which file is the main file',
        path: ['main_file_index'],
      });
    }
    const titles = data.file_titles ?? [];
    if (titles.length !== data.files.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Each file needs a title',
        path: ['file_titles'],
      });
      return;
    }
    data.files.forEach((_, i) => {
      const t = titles[i]?.trim() ?? '';
      if (!t) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Title is required',
          path: ['file_titles', i],
        });
      }
    });
  });

export type DocumentUploadFormValues = z.infer<typeof documentUploadSchema>;

export const documentUpdateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title is too long')
    .trim(),
  description: z.string().max(2000, 'Description is too long').optional(),
  visibility: visibilitySchema,
  kind: documentKindSchema,
  university_id: z.string().uuid().optional().or(z.literal('')),
  batch_year: z.string().optional(),
  semester: z.string().optional(),
});

export type DocumentUpdateFormValues = z.infer<typeof documentUpdateSchema>;
