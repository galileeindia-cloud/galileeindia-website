import { supabase } from "@/lib/supabase";

export interface ContactInput {
  full_name: string;
  email: string;
  phone: string;
  consent: boolean;
}

export async function createContact(contact: ContactInput) {
  const contact_uuid = crypto.randomUUID();

  const { error } = await supabase.from("contacts").insert([
    {
      contact_uuid,
      full_name: contact.full_name,
      email: contact.email || null,
      phone: contact.phone || null,
      consent: contact.consent,
    },
  ]);

  if (error) {
    throw error;
  }

  return { contact_uuid };
}
