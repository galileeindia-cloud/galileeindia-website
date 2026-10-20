import Link from "next/link";
import { ChevronRight, Pencil, Search } from "lucide-react";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MONTHS } from "@/types/familyRegistrationSchema";

export const metadata = { title: "Families" };

const RELATIONSHIP: Record<string, string> = {
  head: "Head",
  spouse: "Spouse",
  child: "Child",
  parent: "Parent",
  in_law: "In-law",
};

// Head first, then spouse, children, parents, in-laws.
const RELATIONSHIP_ORDER = ["head", "spouse", "child", "parent", "in_law"];

interface FamilyRow {
  family_uuid: string;
  sequence_id: number;
  city: string | null;
  anniversary_date: string | null;
}

interface MemberRow {
  member_uuid: string;
  family_uuid: string;
  salutation: string | null;
  full_name: string;
  relationship: string;
  birth_day: number | null;
  birth_month: number | null;
  birth_year: number | null;
  phone: string | null;
  email: string | null;
  is_baptized: boolean;
}

function displayName(m: MemberRow) {
  return m.salutation ? `${m.salutation} ${m.full_name}` : m.full_name;
}

function birthday(m: MemberRow) {
  if (!m.birth_day || !m.birth_month) return "—";
  return `${m.birth_day} ${MONTHS[m.birth_month - 1].slice(0, 3)}${m.birth_year ? ` ${m.birth_year}` : ""}`;
}

export default async function FamiliesPage({ searchParams }: PageProps<"/admin/families">) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const q = String(params.q ?? "").trim().toLowerCase();
  const expandAll = params.open === "all";

  const [familiesRes, membersRes] = await Promise.all([
    supabaseAdmin
      .from("families")
      .select("family_uuid, sequence_id, city, anniversary_date")
      .order("sequence_id", { ascending: true }),
    supabaseAdmin
      .from("members")
      .select("member_uuid, family_uuid, salutation, full_name, relationship, birth_day, birth_month, birth_year, phone, email, is_baptized")
      .order("sequence_id", { ascending: true }),
  ]);
  if (familiesRes.error) throw familiesRes.error;
  if (membersRes.error) throw membersRes.error;

  const families = familiesRes.data as FamilyRow[];
  const allMembers = membersRes.data as MemberRow[];

  const membersOf = new Map<string, MemberRow[]>();
  for (const m of allMembers) {
    const list = membersOf.get(m.family_uuid) ?? [];
    list.push(m);
    membersOf.set(m.family_uuid, list);
  }
  for (const list of membersOf.values()) {
    list.sort((a, b) => RELATIONSHIP_ORDER.indexOf(a.relationship) - RELATIONSHIP_ORDER.indexOf(b.relationship));
  }

  // A family matches the search if any of its members, its number or city does.
  const visible = families.filter((f) => {
    if (!q) return true;
    const members = membersOf.get(f.family_uuid) ?? [];
    const haystack = [
      `f-${f.sequence_id}`,
      `f-${String(f.sequence_id).padStart(4, "0")}`,
      f.city ?? "",
      ...members.flatMap((m) => [m.full_name, m.phone ?? "", m.email ?? ""]),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
  const visibleMemberCount = visible.reduce((n, f) => n + (membersOf.get(f.family_uuid)?.length ?? 0), 0);

  const toggleHref = (open: boolean) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (open) query.set("open", "all");
    const s = query.toString();
    return `/admin/families${s ? `?${s}` : ""}`;
  };

  const th = "text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-2 whitespace-nowrap";
  const td = "px-3 py-2 text-sm text-gray-800 align-top";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Families</h1>
        <p className="text-gray-600 mt-1">Tap a family to see its members.</p>
      </div>

      <div className="grid grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-2xl overflow-hidden max-w-md">
        <div className="bg-white p-4">
          <p className="text-3xl font-bold text-blue-900 tabular-nums">{q ? visible.length : families.length}</p>
          <p className="text-sm text-gray-500">Families{q ? " found" : ""}</p>
        </div>
        <div className="bg-white p-4">
          <p className="text-3xl font-bold text-blue-900 tabular-nums">{q ? visibleMemberCount : allMembers.length}</p>
          <p className="text-sm text-gray-500">Members{q ? " in them" : ""}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form method="get" className="relative flex-1 min-w-[16rem]">
          {expandAll && <input type="hidden" name="open" value="all" />}
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name, phone, email, city or family no."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </form>
        <Link href={toggleHref(!expandAll)} className="text-sm font-medium text-blue-900 hover:underline">
          {expandAll ? "Collapse all" : "Expand all"}
        </Link>
      </div>

      {visible.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          {families.length === 0 ? "No families registered yet." : "No families match that search."}
        </p>
      )}

      <div className="space-y-3">
        {visible.map((f) => {
          const members = membersOf.get(f.family_uuid) ?? [];
          const head = members.find((m) => m.relationship === "head");
          return (
            <details
              key={f.family_uuid}
              open={expandAll || undefined}
              className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer list-none hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
                <ChevronRight size={18} className="text-gray-400 shrink-0 transition-transform group-open:rotate-90" />
                <span className="font-mono text-xs text-gray-500 shrink-0">
                  F-{String(f.sequence_id).padStart(4, "0")}
                </span>
                <span className="font-semibold text-gray-900 min-w-0 truncate">
                  {head ? displayName(head) : "No head recorded"}
                </span>
                <span className="hidden sm:inline text-sm text-gray-500 truncate">{f.city ?? ""}</span>
                <span className="ml-auto shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-100">
                  {members.length} {members.length === 1 ? "member" : "members"}
                </span>
              </summary>

              <div className="border-t border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className={th}>Name</th>
                        <th className={th}>Relationship</th>
                        <th className={th}>Birthday</th>
                        <th className={th}>Phone</th>
                        <th className={th}>Email</th>
                        <th className={th}>Baptized</th>
                        {admin.canEdit && <th className={th}></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => (
                        <tr key={m.member_uuid} className="border-t border-gray-100">
                          <td className={`${td} font-semibold whitespace-nowrap`}>{displayName(m)}</td>
                          <td className={td}>{RELATIONSHIP[m.relationship] ?? m.relationship}</td>
                          <td className={`${td} whitespace-nowrap`}>{birthday(m)}</td>
                          <td className={`${td} whitespace-nowrap`}>
                            {m.phone ? <a href={`tel:${m.phone}`} className="text-blue-900 hover:underline">{m.phone}</a> : "—"}
                          </td>
                          <td className={td}>{m.email ?? "—"}</td>
                          <td className={td}>{m.is_baptized ? "Yes" : "No"}</td>
                          {admin.canEdit && (
                            <td className={td}>
                              <Link href={`/admin/members/${m.member_uuid}`} className="inline-flex items-center gap-1 text-blue-900 hover:underline">
                                <Pencil size={14} />
                                Edit
                              </Link>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {admin.canEdit && (
                  <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-sm">
                    <Link href={`/admin/families/${f.family_uuid}`} className="text-blue-900 font-medium hover:underline">
                      Edit family details or add a member →
                    </Link>
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
