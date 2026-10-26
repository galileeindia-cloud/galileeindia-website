import "server-only";
import type { CalendarDay } from "@/lib/occasions";
import { getWeeklyOccasions } from "@/lib/weeklyOccasions";
import { buildWeeklyReportEmail } from "@/lib/weeklyReportEmail";
import { renderBirthdaySlide } from "@/lib/birthdaySlide";
import { sendEmail } from "@/lib/mailer";

const SLIDE_CID = "birthday-slide@galileeindia.com";

/**
 * Emails the birthdays and anniversaries on `days`, with the LED slide
 * embedded and attached, to REPORT_RECIPIENTS from GMAIL_USER. Used by the
 * Sunday cron job and the admin page's "Email now" button.
 */
export async function sendOccasionsReport(days: CalendarDay[]) {
  const to = process.env.REPORT_RECIPIENTS;
  if (!to) throw new Error("REPORT_RECIPIENTS must be set");

  const { birthdays, anniversaries } = await getWeeklyOccasions(days);
  const slide = await renderBirthdaySlide(
    birthdays.map((b) => b.name),
    days
  );
  const email = buildWeeklyReportEmail(days, birthdays, anniversaries, `cid:${SLIDE_CID}`);

  const first = days[0];
  const fileName = `happy-birthday-${first.year}-${String(first.month).padStart(2, "0")}-${String(first.day).padStart(2, "0")}.png`;

  await sendEmail({
    to,
    subject: email.subject,
    html: email.html,
    text: email.text,
    attachments: [{ filename: fileName, content: slide, contentType: "image/png", cid: SLIDE_CID }],
  });

  return { to, subject: email.subject, birthdays: birthdays.length, anniversaries: anniversaries.length };
}
