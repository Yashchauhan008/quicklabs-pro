import { z } from 'zod';

export const enquiryFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title is too long')
    .trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description is too long')
    .trim(),
  topic: z.enum(['subject', 'document', 'report', 'other']),
  is_private: z.boolean(),
});

export type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;
