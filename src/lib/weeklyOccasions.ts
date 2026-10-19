import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { fallsOn, type CalendarDay } from "@/lib/occasions";

export interface BirthdayEntry {
  on: CalendarDay;
  name: string;
  relationship: string;
  /** The age they turn, when their birth year is known. */
  turning: number | null;
  phone: string | null;
  headName: string | null;
}

export interface AnniversaryEntry {
  on: CalendarDay;
  couple: string;
  years: number;
  phone: string | null;
}

interface MemberRow {
  family_uuid: string;
  salutation: string | null;
  full_name: string;
  relationship: string;
  birth_day: number | null;
  birth_month: number | null;
  birth_year: number | null;
  phone: string | null;
}

interface FamilyRow {
  family_uuid: string;
  anniversary_date: string | null;
}

function displayName(member: MemberRow) {
  return member.salutation ? `${member.salutation} ${member.full_name}` : member.full_name;
}

/** Every birthday and wedding anniversary falling on one of `days`. */
export async function getWeeklyOccasions(days: CalendarDay[]) {
  const [membersRes, familiesRes] = await Promise.all([
    supabaseAdmin
      .from("members")
      .select("family_uuid, salutation, full_name, relationship, birth_day, birth_month, birth_year, phone")
      .order("sequence_id", { ascending: true }),
    supabaseAdmin.from("families").select("family_uuid, anniversary_date"),
  ]);
  if (membersRes.error) throw membersRes.error;
  if (familiesRes.error) throw familiesRes.error;

  const members = (membersRes.data ?? []) as MemberRow[];
  const families = (familiesRes.data ?? []) as FamilyRow[];

  const headOf = new Map<string, MemberRow>();
  const spouseOf = new Map<string, MemberRow>();
  for (const member of members) {
    if (member.relationship === "head") headOf.set(member.family_uuid, member);
    if (member.relationship === "spouse") spouseOf.set(member.family_uuid, member);
  }

  const birthdays: BirthdayEntry[] = days.flatMap((on) =>
    members
      .filter((member) => fallsOn(member.birth_day, member.birth_month, on))
      .map((member) => {
        const head = headOf.get(member.family_uuid);
        return {
          on,
          name: displayName(member),
          relationship: member.relationship,
          turning: member.birth_year ? on.year - member.birth_year : null,
          // Children often have no phone of their own; greet via the head.
          phone: member.phone || head?.phone || null,
          headName: head && head !== member ? displayName(head) : null,
        };
      })
  );

  const anniversaries: AnniversaryEntry[] = days.flatMap((on) =>
    families.flatMap((family) => {
      if (!family.anniversary_date) return [];
      const [year, month, day] = family.anniversary_date.split("-").map(Number);
      if (!fallsOn(day, month, on)) return [];
      const head = headOf.get(family.family_uuid);
      const spouse = spouseOf.get(family.family_uuid);
      const couple = [head, spouse].filter(Boolean).map((m) => displayName(m!)).join(" & ");
      return [{ on, couple: couple || "Unnamed family", years: on.year - year, phone: head?.phone ?? null }];
    })
  );

  return { birthdays, anniversaries };
}
