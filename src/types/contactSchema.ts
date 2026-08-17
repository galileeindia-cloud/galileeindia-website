import { z } from "zod";

export const contactSchema = z.object({
  full_name: z.string().min(2, "Please enter your full name"),

  email: z.string().email("Please enter a valid email").or(z.literal("")),

  phone: z.string().min(10, "Please enter a valid phone number"),

  prayer_request: z.string().optional(),

  consent: z.boolean().refine((value) => value === true, {
    message: "Please agree before submitting the form",
  }),
});

export type ContactSchema = z.infer<typeof contactSchema>;
