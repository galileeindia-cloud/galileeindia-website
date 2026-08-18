import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Galilee Prayer Fellowship";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoData = await readFile(join(process.cwd(), "public/images/logo.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #172554 0%, #1e3a8a 60%, #1e40af 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 14,
            background: "#ffd54f",
          }}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={180}
          height={180}
          alt=""
          style={{ borderRadius: "50%", background: "white", padding: 12 }}
        />

        <div
          style={{
            marginTop: 36,
            fontSize: 64,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            display: "flex",
          }}
        >
          Galilee Prayer Fellowship
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 32,
            fontWeight: 600,
            color: "#ffd54f",
            display: "flex",
          }}
        >
          A Bible-believing Church in Visakhapatnam
        </div>
      </div>
    ),
    { ...size }
  );
}
