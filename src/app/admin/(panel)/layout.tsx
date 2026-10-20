import Link from "next/link";
import { LogOut } from "lucide-react";
import { ACCESS_LABELS, requireAdmin } from "@/lib/adminAuth";
import { logoutAction } from "../actions";

export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();

  return (
    <>
      <header className="bg-blue-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/admin" className="font-bold text-lg">
            Galilee Admin
          </Link>
          <nav className="flex gap-4 text-sm font-medium">
            <Link href="/admin" className="hover:text-amber-300">
              Reports
            </Link>
            <Link href="/admin/families" className="hover:text-amber-300">
              Families
            </Link>
            {admin.canEdit && (
              <Link href="/admin/members" className="hover:text-amber-300">
                Members
              </Link>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-blue-200">
              {admin.name} · {ACCESS_LABELS[admin.accessLevel]}
            </span>
            <form action={logoutAction}>
              <button type="submit" className="inline-flex items-center gap-1 hover:text-amber-300">
                <LogOut size={16} />
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    </>
  );
}
