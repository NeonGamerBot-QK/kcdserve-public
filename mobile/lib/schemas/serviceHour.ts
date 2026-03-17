import { z } from 'zod';

function isWithinSchoolYear(dateStr: string): boolean {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const month = d.getMonth(); // 0-indexed
  return month >= 8 || month <= 5; // Sep–Jun
}

export const serviceHourSchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required'),
  serviceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .refine((v) => !isNaN(new Date(v).getTime()), 'Enter a valid date')
    .refine(isWithinSchoolYear, 'Date must be within the school year (Sep–Jun)'),
  hours: z.coerce
    .number({ error: 'Hours must be a number' })
    .gt(0, 'Hours must be greater than 0')
    .max(24, 'Hours cannot exceed 24'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
});

export type ServiceHourFormValues = z.infer<typeof serviceHourSchema>;
