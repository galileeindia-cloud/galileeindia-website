import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { ACCESS_LABELS, requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import MemberFields, { adminInput, adminLabel } from "@/components/admin/MemberFields";
import { updateMemberAction } from "../../../actions";

export const metadata = { title: "Edit Member" };

interface MemberRow {
  member_uuid: string;
  family_uuid: string;
  family_sequence_id: number;
  salutation: string | null;
  full_name: string;
  relationship: string;
  birth_day: number | null;
  birth_month: number | null;
  birth_year: number | null;
  phone: string | null;
  email: string | null;
  is_baptized: boolean;
  consent: boolean;
  access_level: number;
  password_hash: string | null;
}

export default async function EditMemberPage({ params, searchParams }: PageProps<"/admin/members/[memberUuid]">) {
  const admin = await requireAdmin({ edit: true });
  const { memberUuid } = await params;
  const { saved, error } = await searchParams;

  const { data } = await supabaseAdmin
    .from("members")
    .select("member_uuid, family_uuid, family_sequence_id, salutation, full_name, relationship, birth_day, birth_month, birth_year, phone, email, is_baptized, consent, access_level, password_hash")
    .eq("member_uuid", memberUuid)
    .maybeSingle();
  const member = data as MemberRow | null;
  if (!member) notFound();

  const isSelf = member.member_uuid === admin.memberUuid;
  const familyNo = `F-${String(member.family_sequence_id).padStart(4, "0")}`;

  return (
    <div className="max-w-3xl space-y-5">
      <Link href={`/admin/families/${member.family_uuid}`} className="inline-flex items-center gap-1 text-sm text-blue-900 hover:underline">
        <ArrowLeft size={14} />
        Family {familyNo}
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
        {member.salutation ? `${member.salutation} ` : ""}
        {member.full_name}
      </h1>

      {saved && <p className="text-sm rounded-lg px-4 py-3 border bg-green-50 border-green-200 text-green-800">Saved.</p>}
      {error && <p className="text-sm rounded-lg px-4 py-3 border bg-red-50 border-red-200 text-red-800">{String(error)}</p>}

      <form action={updateMemberAction} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-6">
        <input type="hidden" name="member_uuid" value={member.member_uuid} />

        <MemberFields defaults={member} />

        <fieldset className="border-t border-gray-100 pt-5 space-y-4">
          <legend className="font-bold text-blue-900">Admin Access</legend>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="access_level" className={adminLabel}>Access level</label>
              <select
                id="access_level"
                name="access_level"
                defaultValue={member.access_level}
                disabled={isSelf}
                className={adminInput}
              >
                <option value={0}>0 · {ACCESS_LABELS[0]}</option>
                <option value={1}>1 · {ACCESS_LABELS[1]} (reports + edit members)</option>
                <option value={2}>2 · {ACCESS_LABELS[2]}</option>
              </select>
              {isSelf && (
                <>
                  <input type="hidden" name="access_level" value={member.access_level} />
                  <p className="text-xs text-gray-500 mt-1">You can&rsquo;t change your own access.</p>
                </>
              )}
            </div>
            <div>
              <label htmlFor="new_password" className={adminLabel}>
                {member.password_hash ? "New password (leave blank to keep)" : "Password"}
              </label>
              <input
                id="new_password"
                name="new_password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                className={adminInput}
              />
              <p className="text-xs text-gray-500 mt-1">
                At least 8 characters. They log in with their phone number and this password.
              </p>
            </div>
          </div>
        </fieldset>

        <button type="submit" className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-lg">
          <Save size={16} />
          Save Changes
        </button>
      </form>
    </div>
  );
}
