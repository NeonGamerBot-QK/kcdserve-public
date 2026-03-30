import { z } from "zod";

function isValidDate(dateStr: string): boolean {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

function isWithinSchoolYear(dateStr: string): boolean {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const month = d.getMonth(); // 0-indexed
  return month >= 8 || month <= 5; // Sep–Jun
}

export const page1Schema = z.object({
  suborg: z.string().optional(),
  hours: z.number().int().min(0).max(100),
  minutes: z.union([z.literal(0), z.literal(15), z.literal(30), z.literal(45)]),
  serviceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .refine(isValidDate, "Enter a valid date")
    .refine(
      isWithinSchoolYear,
      "Date must be within the school year (Sep–Jun)",
    ),
  organizationName: z.string().min(1, "Organization is required"),
  category: z.string().min(1, "Category is required"),
  description: z
    .string()
    .min(10, "At least 10 characters")
    .max(500, "500 character max"),
  location: z.string().nullable().optional(),
});

export const page2Schema = z.object({
  supervisorName: z.string().min(1, "Supervisor name is required"),
  supervisorEmail: z.string().email({ message: "Enter a valid email" }),
  signature: z.string().optional(),
  photos: z.array(z.string()).default([]),
});

export const serviceHourSchema = page1Schema.extend(page2Schema.shape);

export type Page1Values = z.infer<typeof page1Schema>;
export type Page2Values = z.infer<typeof page2Schema>;
export type ServiceHourFormValues = z.infer<typeof serviceHourSchema>;
