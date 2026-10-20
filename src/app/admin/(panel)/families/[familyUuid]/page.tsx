import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Plus, Save } from "lucide-react";
import { ACCESS_LABELS, requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import MemberFields, { adminInput, adminLabel } from "@/components/admin/MemberFields";
import { addMemberAction, updateFamilyAction } from "../../../actions";

export const metadata = { title: "Family" };

const RELATIONSHIP: Record<string, string> = {
  head: "Head",
  spouse: "Spouse",
  child: "Child",
  parent: "Parent",
  in_law: "In-law",
};

interface FamilyRow {
  family_uuid: string;
  sequence_id: number;
  anniversary_date: string | null;
  attending_since: string | null;
  address: string | null;
  city: string | null;
  zip_code: string | null;
}

interface MemberRow {
  member_uuid: string;
  salutation: string | null;
  full_name: string;
  relationship: string;
  phone: string | null;
  access_level: number;
}

export default async function FamilyPage({ params, searchParams }: PageProps<"/admin/families/[familyUuid]">) {
  await requireAdmin({ edit: true });
  const { familyUuid } = await params;
  const { saved, added, error } = await searchParams;

  const [familyRes, membersRes] = await Promise.all([
    supabaseAdmin
      .from("families")
      .select("family_uuid, sequence_id, anniversary_date, attending_since, address, city, zip_code")
      .eq("family_uuid", familyUuid)
      .maybeSingle(),
    supabaseAdmin
      .from("members")
      .select("member_uuid, salutation, full_name, relationship, phone, access_level")
      .eq("family_uuid", familyUuid)
      .order("sequence_id", { ascending: true }),
  ]);
  const family = familyRes.data as FamilyRow | null;
  if (!family) notFound();
  const members = (membersRes.data ?? []) as MemberRow[];
  const head = members.find((m) => m.relationship === "head");

  const card = "bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6";

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/members" className="inline-flex items-center gap-1 text-sm text-blue-900 hover:underline">
        <ArrowLeft size={14} />
        All members
      </Link>

      <div>
        <p className="font-mono text-sm text-gray-500">F-{String(family.sequence_id).padStart(4, "0")}</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
          {head ? `${head.salutation ?? ""} ${head.full_name}`.trim() : "Family"}&rsquo;s Family
        </h1>
      </div>

      {saved && <p className="text-sm rounded-lg px-4 py-3 border bg-green-50 border-green-200 text-green-800">Saved.</p>}
      {added && <p className="text-sm rounded-lg px-4 py-3 border bg-green-50 border-green-200 text-green-800">Member added.</p>}
      {error && <p className="text-sm rounded-lg px-4 py-3 border bg-red-50 border-red-200 text-red-800">{String(error)}</p>}

      <section className={card}>
        <h2 className="font-bold text-blue-900 mb-3">Members</h2>
        <ul className="divide-y divide-gray-100">
          {members.map((m) => (
            <li key={m.member_uuid} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2">
              <span className="font-semibold text-gray-900">
                {m.salutation ? `${m.salutation} ` : ""}
                {m.full_name}
              </span>
              <span className="text-sm text-gray-500">{RELATIONSHIP[m.relationship] ?? m.relationship}</span>
              {m.access_level > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {ACCESS_LABELS[m.access_level]}
                </span>
              )}
              <Link href={`/admin/members/${m.member_uuid}`} className="ml-auto inline-flex items-center gap-1 text-sm text-blue-900 hover:underline">
                <Pencil size={14} />
                Edit
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <form action={updateFamilyAction} className={`${card} space-y-4`}>
        <input type="hidden" name="family_uuid" value={family.family_uuid} />
        <h2 className="font-bold text-blue-900">Family Details</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="anniversary_date" className={adminLabel}>Wedding Anniversary</label>
            <input id="anniversary_date" name="anniversary_date" type="date" defaultValue={family.anniversary_date ?? ""} className={adminInput} />
          </div>
          <div>
            <label htmlFor="attending_since" className={adminLabel}>Attending Galilee Since</label>
            <input id="attending_since" name="attending_since" type="month" defaultValue={family.attending_since?.slice(0, 7) ?? ""} className={adminInput} />
          </div>
        </div>
        <div>
          <label htmlFor="address" className={adminLabel}>Address</label>
          <input id="address" name="address" defaultValue={family.address ?? ""} className={adminInput} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="city" className={adminLabel}>City</label>
            <input id="city" name="city" defaultValue={family.city ?? ""} className={adminInput} />
          </div>
          <div>
            <label htmlFor="zip_code" className={adminLabel}>ZIP / PIN Code</label>
            <input id="zip_code" name="zip_code" defaultValue={family.zip_code ?? ""} className={adminInput} />
          </div>
        </div>
        <button type="submit" className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-lg">
          <Save size={16} />
          Save Family Details
        </button>
      </form>

      <form id="add" action={addMemberAction} className={`${card} space-y-5`}>
        <input type="hidden" name="family_uuid" value={family.family_uuid} />
        <h2 className="font-bold text-blue-900">Add a Member to This Family</h2>
        <MemberFields allowHead={false} idPrefix="new_" />
        <button type="submit" className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-lg">
          <Plus size={16} />
          Add Member
        </button>
      </form>
    </div>
  );
}
