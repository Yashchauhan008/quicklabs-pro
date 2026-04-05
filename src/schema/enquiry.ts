import { z } from 'zod';

export const enquiryFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title is too long')
    .trim(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message is too long')
    .trim(),
});

export type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;
