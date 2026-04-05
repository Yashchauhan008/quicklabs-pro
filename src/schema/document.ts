import { z } from 'zod';

const visibilitySchema = z.enum(['PUBLIC', 'PRIVATE']);

export const documentKindSchema = z.enum(['informational', 'lab_solutions']);

export const documentUploadSchema = z.object({
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
  file: z
    .instanceof(File, { message: 'A file is required' })
    .refine((f) => f.size > 0, 'A file is required'),
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
  file: z.instanceof(File).optional(),
});

export type DocumentUpdateFormValues = z.infer<typeof documentUpdateSchema>;
