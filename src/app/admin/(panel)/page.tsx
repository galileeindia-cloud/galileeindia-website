import { Cake, Download, Heart, Mail, Search } from "lucide-react";
import { requireAdmin } from "@/lib/adminAuth";
import {
  addDays,
  daysBetween,
  formatDay,
  formatWeek,
  parseIsoDay,
  todayIn,
  toIsoDay,
  type CalendarDay,
} from "@/lib/occasions";
import { MONTHS } from "@/types/familyRegistrationSchema";
import { getWeeklyOccasions } from "@/lib/weeklyOccasions";
import { emailReportAction } from "../actions";

const MAX_REPORT_DAYS = 366;

const RELATIONSHIP: Record<string, string> = {
  head: "Head",
  spouse: "Spouse",
  child: "Child",
  parent: "Parent",
  in_law: "In-law",
};

const NOTICES: Record<string, { tone: "ok" | "error"; text: string }> = {
  emailed: { tone: "ok", text: "The report was emailed." },
  "email-failed": { tone: "error", text: "The email couldn't be sent. Please try again later." },
  "bad-dates": { tone: "error", text: "That date doesn't exist (for example 31 Feb). Please pick another day." },
  "password-reset": { tone: "ok", text: "Your new password is saved, and you're logged in." },
  "view-only": { tone: "error", text: "Your access is for reports only, so you can't edit members." },
};

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const pad = (n: number) => String(n).padStart(2, "0");

/** A day + month picked in the form, placed in `year` (null if not a real date, e.g. 31 Feb). */
function dayIn(year: number, day: unknown, month: unknown): CalendarDay | null {
  const d = Number(day);
  const m = Number(month);
  if (!d || !m) return null;
  return parseIsoDay(`${year}-${pad(m)}-${pad(d)}`);
}

/**
 * The report range. The form picks only day and month: From is in the
 * current year, and To is too unless it falls before From, in which case
 * it rolls into next year (so 28 Dec -> 3 Jan works). Full ISO dates in
 * ?from=&to= are also accepted, as used by the Email Now redirect.
 */
function resolveRange(params: Record<string, string | string[] | undefined>, today: CalendarDay) {
  if (params.fd || params.fm || params.td || params.tm) {
    const from = dayIn(today.year, params.fd, params.fm);
    let to = dayIn(today.year, params.td, params.tm);
    if (from && to && to.date < from.date) to = dayIn(today.year + 1, params.td, params.tm);
    return { from, to };
  }
  const from = parseIsoDay(String(params.from ?? "")) ?? today;
  return { from, to: parseIsoDay(String(params.to ?? "")) ?? addDays(from, 2) };
}

function ordinal(n: number) {
  const suffix = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
}

export default async function AdminReportsPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const params = await searchParams;

  // Default: today and the next 2 days.
  const today = todayIn();
  const range = resolveRange(params, today);
  const from = range.from ?? today;
  const to = range.to ?? addDays(from, 2);
  const days = range.from && range.to ? daysBetween(from, to) : [];
  const validRange = days.length > 0 && days.length <= MAX_REPORT_DAYS;

  const { birthdays, anniversaries } = validRange
    ? await getWeeklyOccasions(days)
    : { birthdays: [], anniversaries: [] };

  const notice = NOTICES[String(params.notice ?? "")] ?? (!validRange ? NOTICES["bad-dates"] : null);
  const fromIso = toIsoDay(from);
  const toIso = toIsoDay(to);
  const ledLine = birthdays.map((b) => b.name).join("  •  ");
  const recipients = process.env.REPORT_RECIPIENTS ?? "(not configured)";

  const card = "bg-white rounded-2xl shadow-sm border border-gray-200";
  const th = "text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-3 py-2";
  const td = "px-3 py-2 text-sm text-gray-800 align-top";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Birthday &amp; Anniversary Report</h1>
        <p className="text-gray-600 mt-1">
          Pick a day and month range (both included). A To date before the From date runs into next year.
        </p>
      </div>

      {notice && (
        <p
          className={`text-sm rounded-lg px-4 py-3 border ${
            notice.tone === "ok"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {notice.text}
        </p>
      )}

      <form method="get" className={`${card} p-4 sm:p-5 flex flex-wrap items-end gap-4`}>
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-1">From</legend>
          <div className="flex gap-2">
            <select aria-label="From day" name="fd" defaultValue={from.day} className="rounded-lg border border-gray-300 px-2 py-2">
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select aria-label="From month" name="fm" defaultValue={from.month} className="rounded-lg border border-gray-300 px-2 py-2">
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m.slice(0, 3)}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-1">To</legend>
          <div className="flex gap-2">
            <select aria-label="To day" name="td" defaultValue={to.day} className="rounded-lg border border-gray-300 px-2 py-2">
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select aria-label="To month" name="tm" defaultValue={to.month} className="rounded-lg border border-gray-300 px-2 py-2">
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m.slice(0, 3)}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg"
        >
          <Search size={16} />
          Show Report
        </button>
      </form>

      {validRange && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-semibold text-gray-800 mr-auto">{formatWeek(days)}</p>
            <a
              href={`/admin/slide?from=${fromIso}&to=${toIso}`}
              className="inline-flex items-center gap-2 border border-blue-900 text-blue-900 hover:bg-blue-50 font-semibold px-4 py-2 rounded-lg"
            >
              <Download size={16} />
              Download LED Slide
            </a>
            <form action={emailReportAction}>
              <input type="hidden" name="from" value={fromIso} />
              <input type="hidden" name="to" value={toIso} />
              <button
                type="submit"
                title={`Sends to ${recipients}`}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-blue-950 font-semibold px-4 py-2 rounded-lg"
              >
                <Mail size={16} />
                Email Now
              </button>
            </form>
          </div>
          <p className="text-xs text-gray-500 -mt-3">Email Now sends this report to {recipients}.</p>

          <section className={`${card} overflow-hidden`}>
            <h2 className="flex items-center gap-2 px-4 py-3 font-bold text-blue-900 border-b border-gray-100">
              <Cake size={18} /> Birthdays ({birthdays.length})
            </h2>
            {birthdays.length === 0 ? (
              <p className="px-4 py-4 text-sm text-gray-500">No birthdays in this range.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className={th}>Day</th>
                      <th className={th}>Name</th>
                      <th className={th}>Who</th>
                      <th className={th}>Age</th>
                      <th className={th}>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {birthdays.map((b, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className={`${td} whitespace-nowrap`}>{formatDay(b.on)}</td>
                        <td className={`${td} font-semibold whitespace-nowrap`}>{b.name}</td>
                        <td className={td}>
                          {RELATIONSHIP[b.relationship] ?? b.relationship}
                          {b.headName ? ` of ${b.headName}` : ""}
                        </td>
                        <td className={`${td} whitespace-nowrap`}>{b.turning ? `Turns ${b.turning}` : "—"}</td>
                        <td className={`${td} whitespace-nowrap`}>
                          {b.phone ? <a href={`tel:${b.phone}`} className="text-blue-900 hover:underline">{b.phone}</a> : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className={`${card} overflow-hidden`}>
            <h2 className="flex items-center gap-2 px-4 py-3 font-bold text-blue-900 border-b border-gray-100">
              <Heart size={18} /> Wedding Anniversaries ({anniversaries.length})
            </h2>
            {anniversaries.length === 0 ? (
              <p className="px-4 py-4 text-sm text-gray-500">No anniversaries in this range.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className={th}>Day</th>
                      <th className={th}>Couple</th>
                      <th className={th}>Occasion</th>
                      <th className={th}>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anniversaries.map((a, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className={`${td} whitespace-nowrap`}>{formatDay(a.on)}</td>
                        <td className={`${td} font-semibold`}>{a.couple}</td>
                        <td className={`${td} whitespace-nowrap`}>{ordinal(a.years)} anniversary</td>
                        <td className={`${td} whitespace-nowrap`}>
                          {a.phone ? <a href={`tel:${a.phone}`} className="text-blue-900 hover:underline">{a.phone}</a> : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {birthdays.length > 0 && (
            <section className={`${card} p-4`}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Text for the LED screens</h2>
              <div className="rounded-lg bg-gray-900 px-4 py-3 select-all">
                <p className="text-amber-300 text-sm">Happy Birthday!</p>
                <p className="text-white">{ledLine}</p>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
