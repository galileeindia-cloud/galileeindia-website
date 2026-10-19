import type { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { todayIn, weekOf } from "@/lib/occasions";
import { getWeeklyOccasions } from "@/lib/weeklyOccasions";
import { buildWeeklyReportEmail } from "@/lib/weeklyReportEmail";
import { renderBirthdaySlide } from "@/lib/birthdaySlide";

// Called by Vercel Cron every Sunday at 00:30 UTC (06:00 IST) -- see
// vercel.json. Emails the week's (Sunday to Saturday, IST) birthdays and
// wedding anniversaries, plus a "Happy Birthday" slide for the LED screens,
// to REPORT_RECIPIENTS from GMAIL_USER.
//
// The response contains members' personal details, so every request must
// carry `Authorization: Bearer <CRON_SECRET>`; Vercel Cron sends that header
// automatically when CRON_SECRET is set on the project.
//
// For testing with the same header: `?dryRun=1` returns the email as HTML
// instead of sending it, `?slide=1` returns just the slide PNG, and
// `?weekOffset=1` uses next week instead of this one.
export const dynamic = "force-dynamic";

const SLIDE_CID = "birthday-slide@galileeindia.com";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const weekOffset = Number(params.get("weekOffset") ?? 0) || 0;
  const days = weekOf(todayIn(), weekOffset);

  const { birthdays, anniversaries } = await getWeeklyOccasions(days);
  const slide = await renderBirthdaySlide(
    birthdays.map((b) => b.name),
    days
  );

  if (params.get("slide") === "1") {
    return new Response(new Uint8Array(slide), { headers: { "Content-Type": "image/png" } });
  }

  if (params.get("dryRun") === "1") {
    const preview = buildWeeklyReportEmail(
      days,
      birthdays,
      anniversaries,
      `data:image/png;base64,${slide.toString("base64")}`
    );
    return new Response(preview.html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.REPORT_RECIPIENTS;
  if (!user || !pass || !to) {
    return Response.json(
      { error: "GMAIL_USER, GMAIL_APP_PASSWORD and REPORT_RECIPIENTS must all be set" },
      { status: 500 }
    );
  }

  const email = buildWeeklyReportEmail(days, birthdays, anniversaries, `cid:${SLIDE_CID}`);
  const first = days[0];
  const fileName = `happy-birthday-${first.year}-${String(first.month).padStart(2, "0")}-${String(first.day).padStart(2, "0")}.png`;

  const transport = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  await transport.sendMail({
    from: `Galilee Prayer Fellowship <${user}>`,
    to,
    subject: email.subject,
    html: email.html,
    text: email.text,
    attachments: [{ filename: fileName, content: slide, contentType: "image/png", cid: SLIDE_CID }],
  });

  return Response.json({
    sent: true,
    to,
    week: email.subject,
    birthdays: birthdays.length,
    anniversaries: anniversaries.length,
  });
}
