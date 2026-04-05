import { z } from 'zod';

const profileEntrySchema = z.object({
  key: z.string().min(1, 'Label required').max(64).trim(),
  value: z.string().min(1, 'URL or handle required').max(500).trim(),
});

export const socialProfilesFormSchema = z.object({
  profiles: z
    .array(profileEntrySchema)
    .max(30, 'At most 30 links'),
});

export type SocialProfilesFormValues = z.infer<typeof socialProfilesFormSchema>;
