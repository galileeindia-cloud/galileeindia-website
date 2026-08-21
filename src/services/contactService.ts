import { supabase } from "@/lib/supabase";
import { withRetry } from "@/lib/withRetry";

export interface ContactInput {
  full_name: string;
  email: string;
  phone: string;
  consent: boolean;
}

export async function createContact(contact: ContactInput) {
  const contact_uuid = crypto.randomUUID();

  await withRetry(async () => {
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
      // 23505 = unique_violation: the row already made it through on a
      // previous attempt (we only failed to receive the response), so
      // treat a retry hitting our own contact_uuid as success.
      if (error.code === "23505") return;
      throw error;
    }
  }, "createContact");

  return { contact_uuid };
}
