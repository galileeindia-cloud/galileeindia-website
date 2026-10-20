import type { NextRequest } from "next/server";
import { getAdmin } from "@/lib/adminAuth";
import { daysBetween, parseIsoDay } from "@/lib/occasions";
import { getWeeklyOccasions } from "@/lib/weeklyOccasions";
import { renderBirthdaySlide } from "@/lib/birthdaySlide";

// Downloads the LED "Happy Birthday" slide for ?from=YYYY-MM-DD&to=YYYY-MM-DD
// (both included). Logged-in admins only, since it lists members' names.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await getAdmin())) {
    return Response.redirect(new URL("/admin/login", request.url), 303);
  }

  const params = request.nextUrl.searchParams;
  const from = parseIsoDay(params.get("from"));
  const to = parseIsoDay(params.get("to"));
  const days = from && to ? daysBetween(from, to) : [];
  if (days.length === 0 || days.length > 366) {
    return new Response("Choose a valid date range.", { status: 400 });
  }

  const { birthdays } = await getWeeklyOccasions(days);
  const slide = await renderBirthdaySlide(
    birthdays.map((b) => b.name),
    days
  );

  return new Response(new Uint8Array(slide), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="happy-birthday-${params.get("from")}-to-${params.get("to")}.png"`,
      "Cache-Control": "private, no-store",
    },
  });
}
