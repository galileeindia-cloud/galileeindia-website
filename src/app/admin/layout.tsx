import type { Metadata } from "next";

// Nothing under /admin should ever show up in search results.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
