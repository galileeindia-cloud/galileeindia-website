import { z } from "zod";

export const DEPENDENT_RELATIONSHIPS = ["spouse", "child", "parent", "in_law"] as const;

export const RELATIONSHIP_LABELS: Record<string, string> = {
  head: "Head of Family",
  spouse: "Spouse",
  child: "Child",
  parent: "Parent",
  in_law: "In-law",
};

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const optionalEmail = z
  .string()
  .email("Please enter a valid email")
  .optional()
  .or(z.literal(""));

// Day and month come from <select> elements, so they arrive as strings
// ("" when unset). The birth year is a free-entry number field and is
// always optional — someone may know their birthday but not want to share
// their age, so it's kept independent of day/month.
export const dependentSchema = z
  .object({
    relationship: z.enum(DEPENDENT_RELATIONSHIPS),
    full_name: z.string().min(2, "Please enter a name"),
    birth_day: z.string().optional(),
    birth_month: z.string().optional(),
    birth_year: z.string().optional(),
    phone: z.string().optional(),
    email: optionalEmail,
    is_baptized: z.boolean(),
  })
  .refine((data) => Boolean(data.birth_day) === Boolean(data.birth_month), {
    message: "Enter both day and month, or leave both blank",
    path: ["birth_day"],
  });

export const familyRegistrationSchema = z
  .object({
    head_name: z.string().min(2, "Please enter the head of family's name"),
    head_birth_day: z.string().min(1, "Please select a day"),
    head_birth_month: z.string().min(1, "Please select a month"),
    head_birth_year: z.string().optional(),
    head_phone: z.string().min(10, "Please enter a valid phone number"),
    head_email: optionalEmail,
    head_is_baptized: z.boolean(),
    anniversary_date: z.string().optional(),
    // From an <input type="month">, e.g. "2012-06" — the day is never
    // captured, matching `families.attending_since` only using year + month.
    attending_since: z.string().optional(),
    dependents: z.array(dependentSchema),
    consent: z.boolean().refine((value) => value === true, {
      message: "Please agree before submitting the form",
    }),
  });

export type DependentSchema = z.infer<typeof dependentSchema>;
export type FamilyRegistrationSchema = z.infer<typeof familyRegistrationSchema>;
