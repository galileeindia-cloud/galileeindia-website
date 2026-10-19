import "server-only";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CalendarDay } from "@/lib/occasions";

// A 1920x1080 "Happy Birthday" slide for the church LED screens. It shows
// names only -- the pilot document promises members that dates of birth
// are never displayed.

const [greatVibes, notoBold, notoMedium, logo] = await Promise.all([
  readFile(join(process.cwd(), "src/assets/fonts/GreatVibes-Regular.ttf")),
  readFile(join(process.cwd(), "src/assets/fonts/NotoSans-Bold.ttf")),
  readFile(join(process.cwd(), "src/assets/fonts/NotoSans-Medium.ttf")),
  readFile(join(process.cwd(), "public/images/logo.png")),
]);
const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

const NBSP = String.fromCharCode(160);
const GOLD = "#f5d27a";
const SOFT = "#c9d4f5";

/** "25 – 31 October 2026", or "29 November – 5 December 2026" across months. */
function weekLabel(days: CalendarDay[]) {
  const first = days[0];
  const last = days[days.length - 1];
  const month = (d: CalendarDay) =>
    new Intl.DateTimeFormat("en-IN", { month: "long", timeZone: "UTC" }).format(d.date);
  if (first.year !== last.year) {
    return `${first.day} ${month(first)} ${first.year} – ${last.day} ${month(last)} ${last.year}`;
  }
  if (first.month !== last.month) {
    return `${first.day} ${month(first)} – ${last.day} ${month(last)} ${last.year}`;
  }
  return `${first.day} – ${last.day} ${month(last)} ${last.year}`;
}

/** More names -> more columns and smaller text, so a busy week still fits. */
function layoutFor(count: number) {
  if (count <= 4) return { columns: 1, fontSize: 68 };
  if (count <= 8) return { columns: 2, fontSize: 58 };
  if (count <= 12) return { columns: 2, fontSize: 46 };
  if (count <= 18) return { columns: 3, fontSize: 40 };
  return { columns: 3, fontSize: 32 };
}

/** PNG bytes of the birthday slide for `names` in the week `days`. */
export async function renderBirthdaySlide(names: string[], days: CalendarDay[]): Promise<Buffer> {
  const { columns, fontSize } = layoutFor(names.length);

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "radial-gradient(ellipse at 50% 0%, #24408f 0%, #0f1f4d 55%, #0a1433 100%)",
          fontFamily: "Noto Sans",
          color: "#ffffff",
          padding: "70px 120px 70px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 36,
            right: 36,
            bottom: 36,
            border: "3px solid rgba(232,184,74,0.55)",
            borderRadius: 28,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            width={120}
            height={120}
            alt=""
            style={{ borderRadius: 60, background: "#ffffff", padding: 6 }}
          />
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 2, color: GOLD }}>
            GALILEE PRAYER FELLOWSHIP
          </div>
        </div>

        <div
          style={{
            fontFamily: "Great Vibes",
            fontSize: 170,
            lineHeight: 1.1,
            color: GOLD,
            marginTop: 10,
            marginBottom: 24,
          }}
        >
          Happy Birthday
        </div>

        <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: 5, color: SOFT, textTransform: "uppercase" }}>
          {weekLabel(days)}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexWrap: "wrap",
            alignContent: "center",
            justifyContent: "center",
            width: "100%",
            rowGap: 18,
          }}
        >
          {names.length === 0 ? (
            <div style={{ fontSize: 48, color: SOFT }}>God bless every member this week!</div>
          ) : (
            names.map((name) => (
              <div
                key={name}
                style={{
                  width: `${100 / columns}%`,
                  display: "flex",
                  justifyContent: "center",
                  fontSize,
                  fontWeight: 700,
                }}
              >
                {/* One unbreakable "word": the renderer kerns "r." in "Mr." when
                    drawing but not when measuring word widths, which leaves a
                    visible gap after whichever word contains it. */}
                {name.replaceAll(" ", NBSP)}
              </div>
            ))
          )}
        </div>

        <div style={{ fontSize: 30, fontWeight: 500, color: SOFT }}>
          “The Lord bless you and keep you.” — Numbers 6:24
        </div>
      </div>
    ),
    {
      width: 1920,
      height: 1080,
      fonts: [
        { name: "Great Vibes", data: greatVibes, weight: 400, style: "normal" },
        { name: "Noto Sans", data: notoBold, weight: 700, style: "normal" },
        { name: "Noto Sans", data: notoMedium, weight: 500, style: "normal" },
      ],
    }
  );

  return Buffer.from(await image.arrayBuffer());
}
