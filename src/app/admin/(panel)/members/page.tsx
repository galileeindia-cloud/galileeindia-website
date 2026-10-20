import Link from "next/link";
import { Pencil, Search, UserPlus } from "lucide-react";
import { ACCESS_LABELS, requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MONTHS } from "@/types/familyRegistrationSchema";

const RELATIONSHIP: Record<string, string> = {
  head: "Head",
  spouse: "Spouse",
  child: "Child",
  parent: "Parent",
  in_law: "In-law",
};

interface Row {
  member_uuid: string;
  family_uuid: string;
  family_sequence_id: number;
  salutation: string | null;
  full_name: string;
  relationship: string;
  birth_day: number | null;
  birth_month: number | null;
  phone: string | null;
  email: string | null;
  access_level: number;
}

export const metadata = { title: "Members" };

export default async function AdminMembersPage({ searchParams }: PageProps<"/admin/members">) {
  await requireAdmin({ edit: true });
  const q = String((await searchParams).q ?? "").trim().toLowerCase();

  const [membersRes, familiesRes] = await Promise.all([
    supabaseAdmin
      .from("members")
      .select("member_uuid, family_uuid, family_sequence_id, salutation, full_name, relationship, birth_day, birth_month, phone, email, access_level")
      .order("family_sequence_id", { ascending: true })
      .order("sequence_id", { ascending: true }),
    supabaseAdmin.from("families").select("family_uuid, city"),
  ]);
  if (membersRes.error) throw membersRes.error;
  if (familiesRes.error) throw familiesRes.error;

  const cityOf = new Map((familiesRes.data as { family_uuid: string; city: string | null }[]).map((f) => [f.family_uuid, f.city]));
  const all = membersRes.data as Row[];
  const rows = q
    ? all.filter((m) =>
        [
          m.full_name,
          m.phone ?? "",
          m.email ?? "",
          `f-${m.family_sequence_id}`,
          `f-${String(m.family_sequence_id).padStart(4, "0")}`,
          cityOf.get(m.family_uuid) ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
    : all;

  const th = "text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-2 whitespace-nowrap";
  const td = "px-3 py-2 text-sm text-gray-800 align-top";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Members</h1>
          <p className="text-gray-600 mt-1">
            {all.length} members in {cityOf.size} families. Open a family to add a member.
          </p>
        </div>
        <Link
          href="/member-registration"
          target="_blank"
          className="inline-flex items-center gap-2 border border-blue-900 text-blue-900 hover:bg-blue-50 font-semibold px-4 py-2 rounded-lg"
        >
          <UserPlus size={16} />
          Register a New Family
        </Link>
      </div>

      <form method="get" className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name, phone, email, city or family no. (e.g. F-11)"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
        />
      </form>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className={th}>Family</th>
              <th className={th}>Name</th>
              <th className={th}>Relationship</th>
              <th className={th}>Birthday</th>
              <th className={th}>Phone</th>
              <th className={th}>Access</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.member_uuid} className="border-t border-gray-100 hover:bg-gray-50">
                <td className={`${td} whitespace-nowrap`}>
                  <Link href={`/admin/families/${m.family_uuid}`} className="font-mono text-blue-900 hover:underline">
                    F-{String(m.family_sequence_id).padStart(4, "0")}
                  </Link>
                </td>
                <td className={`${td} font-semibold whitespace-nowrap`}>
                  {m.salutation ? `${m.salutation} ` : ""}
                  {m.full_name}
                </td>
                <td className={td}>{RELATIONSHIP[m.relationship] ?? m.relationship}</td>
                <td className={`${td} whitespace-nowrap`}>
                  {m.birth_day && m.birth_month ? `${m.birth_day} ${MONTHS[m.birth_month - 1].slice(0, 3)}` : "—"}
                </td>
                <td className={`${td} whitespace-nowrap`}>{m.phone ?? "—"}</td>
                <td className={td}>
                  {m.access_level > 0 ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 whitespace-nowrap">
                      {ACCESS_LABELS[m.access_level]}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Member</span>
                  )}
                </td>
                <td className={td}>
                  <Link
                    href={`/admin/members/${m.member_uuid}`}
                    className="inline-flex items-center gap-1 text-blue-900 hover:underline text-sm font-medium"
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                  No members match that search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
