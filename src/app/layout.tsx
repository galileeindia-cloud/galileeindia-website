import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const SITE_NAME = "Galilee Prayer Fellowship";
const SITE_DESCRIPTION =
  "Galilee Prayer Fellowship is a Bible-believing church in Lawsons Bay Colony, Visakhapatnam, committed to proclaiming the Gospel of Jesus Christ, making disciples, and glorifying God through worship, prayer, fellowship, and the teaching of God's Word.";

export const metadata: Metadata = {
  metadataBase: new URL("https://galileeindia.com"),
  title: {
    default: `${SITE_NAME} | Visakhapatnam`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Visakhapatnam`,
    description: SITE_DESCRIPTION,
    url: "/",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Visakhapatnam`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
