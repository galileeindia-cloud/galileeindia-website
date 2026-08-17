import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Galilee Prayer Fellowship | Visakhapatnam",
  description:
    "Galilee Prayer Fellowship is a Bible-believing church in Lawsons Bay Colony, Visakhapatnam, committed to proclaiming the Gospel of Jesus Christ, making disciples, and glorifying God through worship, prayer, fellowship, and the teaching of God's Word.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
