import { supabase } from "@/lib/supabase";
import { withRetry } from "@/lib/withRetry";

export type Relationship = "head" | "spouse" | "child" | "parent" | "in_law";

export interface MemberInput {
  full_name: string;
  relationship: Relationship;
  /** Always given together; the year is independently optional. */
  birth_day?: number | null;
  birth_month?: number | null;
  birth_year?: number | null;
  phone?: string | null;
  email?: string | null;
  consent: boolean;
  is_baptized: boolean;
}

export interface FamilyInput {
  head_name: string;
  anniversary_date?: string | null;
  /** Year-month only; pass the 1st of the month (e.g. "2012-06-01"). */
  attending_since?: string | null;
  address?: string | null;
  city?: string | null;
  zip_code?: string | null;
}

// Supabase's unique_violation code. A retry that lands on a row already
// inserted by a previous (unacknowledged) attempt counts as success rather
// than an error, same pattern as contactService/prayerService.
const UNIQUE_VIOLATION = "23505";

/**
 * Inserts one `families` row and its `members` rows (head plus any
 * dependents). All UUIDs are generated client-side before the request, so
 * a dropped response can be safely retried without risking a duplicate
 * family or member.
 */
export async function registerFamily(family: FamilyInput, members: MemberInput[]) {
  const family_uuid = crypto.randomUUID();

  await withRetry(async () => {
    const { error } = await supabase.from("families").insert([
      {
        family_uuid,
        head_name: family.head_name,
        anniversary_date: family.anniversary_date || null,
        attending_since: family.attending_since || null,
        address: family.address || null,
        city: family.city || null,
        zip_code: family.zip_code || null,
      },
    ]);
    if (error) {
      if (error.code === UNIQUE_VIOLATION) return;
      throw error;
    }
  }, "registerFamily:families");

  for (const member of members) {
    const member_uuid = crypto.randomUUID();
    await withRetry(async () => {
      const { error } = await supabase.from("members").insert([
        {
          member_uuid,
          family_uuid,
          full_name: member.full_name,
          relationship: member.relationship,
          birth_day: member.birth_day || null,
          birth_month: member.birth_month || null,
          birth_year: member.birth_year || null,
          phone: member.phone || null,
          email: member.email || null,
          consent: member.consent,
          is_baptized: member.is_baptized,
        },
      ]);
      if (error) {
        if (error.code === UNIQUE_VIOLATION) return;
        throw error;
      }
    }, "registerFamily:members");
  }

  return { family_uuid };
}
