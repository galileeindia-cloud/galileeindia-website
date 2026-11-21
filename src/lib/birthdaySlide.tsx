import "server-only";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CalendarDay } from "@/lib/occasions";

// A 1920x1080 "Happy Birthday" slide for the church LED screens. It shows
// each name with the day and month of the birthday (DD/MM) -- never the
// year.

const [greatVibes, notoBold, notoMedium, logo] = await Promise.all([
  readFile(join(process.cwd(), "src/fonts/GreatVibes-Regular.ttf")),
  readFile(join(process.cwd(), "src/fonts/NotoSans-Bold.ttf")),
  readFile(join(process.cwd(), "src/fonts/NotoSans-Medium.ttf")),
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

/**
 * Picks the largest text size (and fewest columns) at which every
 * "name  DD/MM" line fits its column and all rows fit the names area.
 * Widths are estimated generously (0.62 em per character) since the
 * renderer can't measure text in advance.
 */
function layoutFor(labels: string[]) {
  const AREA_WIDTH = 1640;
  const AREA_HEIGHT = 450;
  const longest = Math.max(0, ...labels.map((l) => l.length));
  for (let fontSize = 68; fontSize >= 20; fontSize -= 2) {
    for (let columns = 1; columns <= 3; columns++) {
      const rows = Math.ceil(labels.length / columns);
      const fitsWide = longest * 0.62 * fontSize <= AREA_WIDTH / columns - 30;
      const fitsTall = rows * (fontSize * 1.36 + 18) <= AREA_HEIGHT;
      if (fitsWide && fitsTall) return { columns, fontSize };
    }
  }
  return { columns: 3, fontSize: 20 };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** PNG bytes of the birthday slide for `people` in the week `days`. */
export async function renderBirthdaySlide(
  people: { name: string; on: CalendarDay }[],
  days: CalendarDay[]
): Promise<Buffer> {
  // Each line is the name plus about 7 characters of space and date.
  const { columns, fontSize } = layoutFor(people.map((p) => `${p.name}       `));

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

        {/* The logo sits in the top-left corner; everything else stays centred. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={170}
          height={170}
          alt=""
          style={{ position: "absolute", top: 70, left: 80, borderRadius: 85, background: "#ffffff", padding: 8 }}
        />

        <div style={{ display: "flex", alignItems: "center", minHeight: 120 }}>
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
          {people.length === 0 ? (
            <div style={{ fontSize: 48, color: SOFT }}>God bless every member this week!</div>
          ) : (
            people.map(({ name, on }, i) => (
              <div
                key={i}
                style={{
                  width: `${100 / columns}%`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "baseline",
                  fontSize,
                  fontWeight: 700,
                }}
              >
                {/* One unbreakable "word": the renderer kerns "r." in "Mr." when
                    drawing but not when measuring word widths, which leaves a
                    visible gap after whichever word contains it. */}
                {name.replaceAll(" ", NBSP)}
                <span style={{ marginLeft: fontSize * 0.45, fontSize: fontSize * 0.8, fontWeight: 500, color: GOLD }}>
                  {`${pad(on.day)}/${pad(on.month)}`}
                </span>
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
