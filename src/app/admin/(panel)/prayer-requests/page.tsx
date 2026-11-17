import Link from "next/link";
import { CheckCircle2, HandHeart, RotateCcw } from "lucide-react";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { CHURCH_TIME_ZONE, todayIn, toIsoDay } from "@/lib/occasions";
import PrayerRequestForm from "@/components/admin/PrayerRequestForm";
import { setPrayerRequestClosedAction } from "../../actions";

export const metadata = { title: "Prayer Requests" };

interface MemberOption {
  member_uuid: string;
  family_sequence_id: number;
  full_name: string;
}

interface RequestRow {
  request_uuid: string;
  request_date: string;
  member_uuid: string;
  prayer_request: string;
  request_type: string | null;
  is_closed: boolean;
  closed_at: string | null;
  created_by: string | null;
  created_at: string;
}

const FILTERS = [
  { key: "open", label: "Open" },
  { key: "closed", label: "Closed" },
  { key: "all", label: "All" },
] as const;

const DATE = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const DATE_TIME = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: CHURCH_TIME_ZONE,
});

// Names are shown without a title (Mr./Mrs./Miss).
function displayName(m: MemberOption | undefined) {
  return m ? m.full_name.trim() : "Unknown member";
}

export default async function PrayerRequestsPage({ searchParams }: PageProps<"/admin/prayer-requests">) {
  await requireAdmin();
  const params = await searchParams;
  const show = FILTERS.some((f) => f.key === params.show) ? String(params.show) : "open";

  const [membersRes, requestsRes] = await Promise.all([
    supabaseAdmin
      .from("members")
      .select("member_uuid, family_sequence_id, full_name")
      .order("full_name", { ascending: true }),
    supabaseAdmin
      .from("member_prayer_requests")
      .select("request_uuid, request_date, member_uuid, request_type, prayer_request, is_closed, closed_at, created_by, created_at")
      .order("request_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);
  if (membersRes.error) throw membersRes.error;

  const members = (membersRes.data ?? []) as MemberOption[];
  const memberById = new Map(members.map((m) => [m.member_uuid, m]));
  const tableMissing = Boolean(requestsRes.error);
  if (requestsRes.error) console.error("Loading prayer requests failed:", requestsRes.error);
  const all = (requestsRes.data ?? []) as RequestRow[];
  const counts = { open: all.filter((r) => !r.is_closed).length, closed: all.filter((r) => r.is_closed).length, all: all.length };
  const visible = all.filter((r) => (show === "all" ? true : show === "closed" ? r.is_closed : !r.is_closed));

  const today = todayIn();
  const card = "bg-white rounded-2xl shadow-sm border border-gray-200";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 flex items-center gap-2">
          <HandHeart size={28} />
          Prayer Requests
        </h1>
        <p className="text-gray-600 mt-1">Record a member&rsquo;s prayer request and mark it closed once answered.</p>
      </div>

      {tableMissing && (
        <p className="text-sm rounded-lg px-4 py-3 border bg-amber-50 border-amber-200 text-amber-900">
          The prayer requests table isn&rsquo;t set up yet. Run{" "}
          <code className="font-mono">supabase/member_prayer_requests_2026-11-17.sql</code> in the Supabase SQL Editor.
        </p>
      )}
      {params.saved && (
        <p className="text-sm rounded-lg px-4 py-3 border bg-green-50 border-green-200 text-green-800">
          Prayer request saved.
        </p>
      )}
      {params.error && (
        <p className="text-sm rounded-lg px-4 py-3 border bg-red-50 border-red-200 text-red-800">{String(params.error)}</p>
      )}

      <div id="new">
        <PrayerRequestForm
          today={toIsoDay(today)}
          members={members.map((m) => ({
            id: m.member_uuid,
            label: `${m.full_name.trim()} (F-${String(m.family_sequence_id).padStart(4, "0")})`,
          }))}
        />
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-bold text-blue-900 mr-auto">Saved Requests</h2>
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={`/admin/prayer-requests?show=${f.key}`}
              className={`text-sm px-3 py-1.5 rounded-full border ${
                show === f.key ? "bg-blue-900 text-white border-blue-900" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {f.label} ({counts[f.key]})
            </Link>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className={`${card} px-4 py-6 text-center text-gray-500`}>
            {all.length === 0 ? "No prayer requests recorded yet." : `No ${show} prayer requests.`}
          </p>
        ) : (
          <ul className="space-y-3">
            {visible.map((r) => (
              <li key={r.request_uuid} className={`${card} p-4 space-y-2`}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold text-gray-900">{displayName(memberById.get(r.member_uuid))}</span>
                  <span className="text-sm text-gray-500">{DATE.format(new Date(`${r.request_date}T00:00:00Z`))}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      r.is_closed
                        ? "bg-green-50 text-green-800 border-green-200"
                        : "bg-amber-50 text-amber-900 border-amber-200"
                    }`}
                  >
                    {r.is_closed ? "Closed" : "Open"}
                  </span>
                  {r.request_type && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-100">
                      {r.request_type}
                    </span>
                  )}
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{r.prayer_request}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                  <span>
                    Recorded {DATE_TIME.format(new Date(r.created_at))}
                    {r.created_by ? ` by ${displayName(memberById.get(r.created_by))}` : ""}
                  </span>
                  {r.is_closed && r.closed_at && <span>Closed {DATE_TIME.format(new Date(r.closed_at))}</span>}
                  <form action={setPrayerRequestClosedAction} className="ml-auto">
                    <input type="hidden" name="request_uuid" value={r.request_uuid} />
                    <input type="hidden" name="close" value={r.is_closed ? "0" : "1"} />
                    <input type="hidden" name="show" value={show} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-900 hover:underline"
                    >
                      {r.is_closed ? <RotateCcw size={14} /> : <CheckCircle2 size={14} />}
                      {r.is_closed ? "Reopen" : "Mark closed"}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
