import type { NextRequest } from "next/server";
import { todayIn, weekOf } from "@/lib/occasions";
import { getWeeklyOccasions } from "@/lib/weeklyOccasions";
import { buildWeeklyReportEmail } from "@/lib/weeklyReportEmail";
import { renderBirthdaySlide } from "@/lib/birthdaySlide";
import { sendOccasionsReport } from "@/lib/sendOccasionsReport";

// Called by Vercel Cron every Sunday at 00:30 UTC (06:00 IST) -- see
// vercel.json. Emails the week's (Sunday to Saturday, IST) birthdays and
// wedding anniversaries, plus a "Happy Birthday" slide for the LED screens.
//
// The response contains members' personal details, so every request must
// carry `Authorization: Bearer <CRON_SECRET>`; Vercel Cron sends that header
// automatically when CRON_SECRET is set on the project.
//
// For testing with the same header: `?dryRun=1` returns the email as HTML
// instead of sending it, `?slide=1` returns just the slide PNG, and
// `?weekOffset=1` uses next week instead of this one.
export const dynamic = "force-dynamic";

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

  if (params.get("slide") === "1" || params.get("dryRun") === "1") {
    const { birthdays, anniversaries } = await getWeeklyOccasions(days);
    const slide = await renderBirthdaySlide(
      birthdays.map((b) => b.name),
      days
    );
    if (params.get("slide") === "1") {
      return new Response(new Uint8Array(slide), { headers: { "Content-Type": "image/png" } });
    }
    const preview = buildWeeklyReportEmail(
      days,
      birthdays,
      anniversaries,
      `data:image/png;base64,${slide.toString("base64")}`
    );
    return new Response(preview.html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  try {
    const result = await sendOccasionsReport(days);
    return Response.json({ sent: true, ...result });
  } catch (err) {
    console.error("Weekly birthday report failed:", err);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
