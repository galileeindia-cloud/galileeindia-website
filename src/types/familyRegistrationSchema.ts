import { z } from "zod";

export const DEPENDENT_RELATIONSHIPS = ["spouse", "child", "parent", "in_law"] as const;

export const RELATIONSHIP_LABELS: Record<string, string> = {
  head: "Head of Family",
  spouse: "Spouse",
  child: "Child",
  parent: "Parent",
  in_law: "In-law",
};

const optionalEmail = z
  .string()
  .email("Please enter a valid email")
  .optional()
  .or(z.literal(""));

export const dependentSchema = z.object({
  relationship: z.enum(DEPENDENT_RELATIONSHIPS),
  full_name: z.string().min(2, "Please enter a name"),
  date_of_birth: z.string().optional(),
  phone: z.string().optional(),
  email: optionalEmail,
  is_baptized: z.boolean(),
});

export const familyRegistrationSchema = z.object({
  head_name: z.string().min(2, "Please enter the head of family's name"),
  head_date_of_birth: z.string().min(1, "Please enter a date of birth"),
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
