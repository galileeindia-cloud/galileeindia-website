import { formatDay, formatWeek, type CalendarDay } from "@/lib/occasions";
import type { AnniversaryEntry, BirthdayEntry } from "@/lib/weeklyOccasions";

const RELATIONSHIP_LABELS: Record<string, string> = {
  head: "Head of Family",
  spouse: "Spouse",
  child: "Child",
  parent: "Parent",
  in_law: "In-law",
};

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ordinal(n: number) {
  const suffix = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
}

const cell = "padding:8px 10px;border-bottom:1px solid #e5e7eb;vertical-align:top;font-size:14px;color:#111827";
const headCell =
  "padding:8px 10px;border-bottom:2px solid #1e3a8a;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280";

/** Subject, HTML and plain-text bodies for the weekly birthday email. */
export function buildWeeklyReportEmail(
  days: CalendarDay[],
  birthdays: BirthdayEntry[],
  anniversaries: AnniversaryEntry[]
) {
  const week = formatWeek(days);
  const subject = `Birthdays & Anniversaries: ${week}`;
  const ledLine = birthdays.map((b) => b.name).join("  •  ");

  const birthdayRows = birthdays
    .map((b) => {
      const who = [RELATIONSHIP_LABELS[b.relationship] ?? b.relationship, b.headName ? `of ${b.headName}` : ""]
        .filter(Boolean)
        .join(" ");
      return `<tr>
        <td style="${cell};white-space:nowrap">${formatDay(b.on)}</td>
        <td style="${cell};font-weight:600">${escapeHtml(b.name)}</td>
        <td style="${cell}">${escapeHtml(who)}</td>
        <td style="${cell}">${b.turning ? `Turns ${b.turning}` : "—"}</td>
        <td style="${cell};white-space:nowrap">${escapeHtml(b.phone ?? "—")}</td>
      </tr>`;
    })
    .join("");

  const anniversaryRows = anniversaries
    .map(
      (a) => `<tr>
        <td style="${cell};white-space:nowrap">${formatDay(a.on)}</td>
        <td style="${cell};font-weight:600">${escapeHtml(a.couple)}</td>
        <td style="${cell}">${ordinal(a.years)} anniversary</td>
        <td style="${cell};white-space:nowrap">${escapeHtml(a.phone ?? "—")}</td>
      </tr>`
    )
    .join("");

  const html = `<!doctype html>
<html><body style="margin:0;background:#f3f4f6;font-family:Segoe UI,Helvetica,Arial,sans-serif">
  <div style="max-width:680px;margin:0 auto;padding:24px 16px">
    <div style="background:#ffffff;border-radius:12px;padding:24px;border:1px solid #e5e7eb">
      <p style="margin:0;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#b7861a;font-weight:600">Galilee Prayer Fellowship · Weekly Report</p>
      <h1 style="margin:8px 0 4px;font-size:22px;color:#1e3a8a">Birthdays &amp; Anniversaries</h1>
      <p style="margin:0 0 20px;color:#4b5563;font-size:14px">${week}</p>

      <h2 style="margin:0 0 8px;font-size:16px;color:#1e3a8a">🎂 Birthdays (${birthdays.length})</h2>
      ${
        birthdays.length
          ? `<table style="width:100%;border-collapse:collapse;margin-bottom:20px">
              <tr><th style="${headCell}">Day</th><th style="${headCell}">Name</th><th style="${headCell}">Who</th><th style="${headCell}">Age</th><th style="${headCell}">Phone</th></tr>
              ${birthdayRows}
            </table>`
          : `<p style="color:#6b7280;font-size:14px;margin:0 0 20px">No birthdays this week.</p>`
      }

      <h2 style="margin:0 0 8px;font-size:16px;color:#1e3a8a">💍 Wedding Anniversaries (${anniversaries.length})</h2>
      ${
        anniversaries.length
          ? `<table style="width:100%;border-collapse:collapse;margin-bottom:20px">
              <tr><th style="${headCell}">Day</th><th style="${headCell}">Couple</th><th style="${headCell}">Occasion</th><th style="${headCell}">Phone</th></tr>
              ${anniversaryRows}
            </table>`
          : `<p style="color:#6b7280;font-size:14px;margin:0 0 20px">No anniversaries this week.</p>`
      }

      ${
        birthdays.length
          ? `<h2 style="margin:0 0 8px;font-size:16px;color:#1e3a8a">Text for the LED screens</h2>
             <div style="background:#111827;border-radius:8px;padding:14px 16px">
               <p style="margin:0 0 4px;color:#fcd34d;font-size:14px">Happy Birthday!</p>
               <p style="margin:0;color:#ffffff;font-size:15px">${escapeHtml(ledLine)}</p>
             </div>`
          : ""
      }
    </div>
    <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px">
      Sent automatically every Sunday morning from galileeindia.com. Contains members' personal details — please don't forward.
    </p>
  </div>
</body></html>`;

  const text = [
    `Galilee Prayer Fellowship — Birthdays & Anniversaries`,
    week,
    "",
    `BIRTHDAYS (${birthdays.length})`,
    ...(birthdays.length
      ? birthdays.map(
          (b) =>
            `${formatDay(b.on)}  ${b.name}${b.turning ? ` (turns ${b.turning})` : ""}${b.headName ? `, ${RELATIONSHIP_LABELS[b.relationship] ?? b.relationship} of ${b.headName}` : ""}  ${b.phone ?? ""}`
        )
      : ["None this week."]),
    "",
    `WEDDING ANNIVERSARIES (${anniversaries.length})`,
    ...(anniversaries.length
      ? anniversaries.map((a) => `${formatDay(a.on)}  ${a.couple} — ${ordinal(a.years)} anniversary  ${a.phone ?? ""}`)
      : ["None this week."]),
    ...(birthdays.length ? ["", "LED SCREENS", "Happy Birthday!", ledLine] : []),
  ].join("\n");

  return { subject, html, text };
}
