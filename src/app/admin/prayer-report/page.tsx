import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { todayIn, toIsoDay } from "@/lib/occasions";
import PrintReportButton from "@/components/admin/PrintReportButton";

// The page title becomes the PDF's default file name.
export async function generateMetadata() {
  return { title: { absolute: `Active-Prayer-Requests-${toIsoDay(todayIn())}` } };
}

export const dynamic = "force-dynamic";

interface Member {
  member_uuid: string;
  family_uuid: string;
  full_name: string;
  relationship: string;
}

interface Request {
  request_uuid: string;
  request_date: string;
  member_uuid: string;
  request_type: string | null;
  prayer_request: string;
}

interface Entry {
  id: string;
  date: string;
  dateLabel: string;
  name: string;
  request: string;
}

interface FamilyGroup {
  head: string;
  entries: Entry[];
}

const NO_TYPE = "Type not given";
const DAY_MONTH = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
const DAY_MONTH_YEAR = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** Single spaces only, and no leading title such as "Mr." or "Mrs.". */
const tidyName = (name: string) => tidy(name).replace(/^(mr|mrs|miss|ms|dr)\.?\s+/i, "");
const tidy = (text: string) => text.replace(/\s+/g, " ").trim();
const byText = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "base" });

/**
 * Printable report of every open (not closed) member prayer request,
 * arranged Problem → Family → Person, for saving as a PDF.
 */
export default async function PrayerReportPage() {
  await requireAdmin();

  const [membersRes, requestsRes] = await Promise.all([
    supabaseAdmin.from("members").select("member_uuid, family_uuid, full_name, relationship"),
    supabaseAdmin
      .from("member_prayer_requests")
      .select("request_uuid, request_date, member_uuid, request_type, prayer_request")
      .eq("is_closed", false),
  ]);
  if (membersRes.error) throw membersRes.error;
  if (requestsRes.error) throw requestsRes.error;

  const members = (membersRes.data ?? []) as Member[];
  const requests = (requestsRes.data ?? []) as Request[];
  const memberById = new Map(members.map((m) => [m.member_uuid, m]));
  const headOf = new Map(members.filter((m) => m.relationship === "head").map((m) => [m.family_uuid, m]));

  const thisYear = `${todayIn().year}-`;

  // Problem → family → requests.
  const problems = new Map<string, Map<string, FamilyGroup>>();
  for (const r of requests) {
    const person = memberById.get(r.member_uuid);
    const familyKey = person?.family_uuid ?? r.member_uuid;
    const problem = r.request_type ?? NO_TYPE;
    const families = problems.get(problem) ?? new Map<string, FamilyGroup>();
    const group = families.get(familyKey) ?? {
      head: person ? tidyName(headOf.get(person.family_uuid)?.full_name ?? "—") : "—",
      entries: [],
    };
    group.entries.push({
      id: r.request_uuid,
      date: r.request_date,
      // The year is left out unless it isn't this year.
      dateLabel: (r.request_date.startsWith(thisYear) ? DAY_MONTH : DAY_MONTH_YEAR).format(
        new Date(`${r.request_date}T00:00:00Z`)
      ),
      name: person ? tidyName(person.full_name) : "Unknown member",
      request: tidy(r.prayer_request),
    });
    families.set(familyKey, group);
    problems.set(problem, families);
  }

  // Problems A–Z (requests without a type last), families by head's name,
  // people by name, then oldest request first.
  const report = [...problems.entries()]
    .sort(([a], [b]) => (a === NO_TYPE ? 1 : b === NO_TYPE ? -1 : byText(a, b)))
    .map(([problem, families]) => {
      const groups = [...families.values()].sort((a, b) => byText(a.head, b.head));
      for (const g of groups) g.entries.sort((a, b) => byText(a.name, b.name) || a.date.localeCompare(b.date));
      return { problem, groups, count: groups.reduce((n, g) => n + g.entries.length, 0) };
    });

  return (
    <div className="bg-white min-h-screen print:min-h-0">
      <style>{`@page { size: A4 landscape; margin: 8mm; }`}</style>

      <div className="print:hidden sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <Link href="/admin/prayer-requests" className="inline-flex items-center gap-1 text-sm text-blue-900 hover:underline mr-auto">
            <ArrowLeft size={16} />
            Back to Prayer Requests
          </Link>
          <PrintReportButton />
        </div>
        <p className="max-w-6xl mx-auto px-4 pb-3 text-xs text-gray-500">
          In the print window, choose <strong>Save as PDF</strong> (or your printer) and <strong>Landscape</strong>. On
          iPhone: Share → Print → pinch out the preview → Share → Save to Files.
        </p>
      </div>

      <article className="max-w-6xl mx-auto px-4 py-6 print:p-0 print:max-w-none text-black text-[15px] leading-snug">
        <header className="flex flex-wrap items-baseline justify-between gap-x-4 border-b-2 border-blue-900 pb-1 mb-2">
          <h1 className="text-xl font-bold">Galilee Prayer Fellowship · Active Prayer Requests</h1>
          <p className="text-sm">
            {requests.length} request{requests.length === 1 ? "" : "s"} · {DAY_MONTH_YEAR.format(todayIn().date)}
          </p>
        </header>

        {report.length === 0 ? (
          <p>There are no active prayer requests.</p>
        ) : (
          <table className="w-full border-collapse [&_td]:border [&_td]:border-gray-400 [&_th]:border [&_th]:border-gray-400 [&_td]:px-2 [&_td]:py-1 [&_th]:px-2 [&_th]:py-1">
            <colgroup>
              <col className="w-[15%]" />
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[7%]" />
              <col />
            </colgroup>
            <thead>
              <tr className="bg-blue-900 text-white text-left [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
                <th>Problem</th>
                <th>Family Head</th>
                <th>Name</th>
                <th>Date</th>
                <th>Prayer Request</th>
              </tr>
            </thead>
            {report.map((p, pi) => (
              // One tbody per problem keeps its merged cells together.
              <tbody key={p.problem} className="break-inside-avoid">
                {p.groups.flatMap((g, gi) =>
                  g.entries.map((e, ei) => (
                    <tr key={e.id} className="align-top">
                      {gi === 0 && ei === 0 && (
                        <td rowSpan={p.count} className="font-bold text-blue-900 bg-blue-50 [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
                          {pi + 1}. {p.problem} ({p.count})
                        </td>
                      )}
                      {ei === 0 && <td rowSpan={g.entries.length}>{g.head}</td>}
                      <td className="font-semibold">{e.name}</td>
                      <td className="whitespace-nowrap">{e.dateLabel}</td>
                      <td>{e.request}</td>
                    </tr>
                  ))
                )}
              </tbody>
            ))}
            <tbody>
              <tr className="font-bold bg-gray-100 [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
                <td colSpan={4} className="text-right">Total</td>
                <td>{requests.length}</td>
              </tr>
            </tbody>
          </table>
        )}
      </article>
    </div>
  );
}
