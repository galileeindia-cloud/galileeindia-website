import Image from "next/image";
import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";
import { getAdmin } from "@/lib/adminAuth";
import PasswordInput from "@/components/admin/PasswordInput";
import { loginAction } from "../actions";

export const metadata = { title: "Admin Login" };

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <form
        action={loginAction}
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 space-y-5"
      >
        <div className="flex flex-col items-center text-center gap-2">
          <Image src="/images/logo.png" alt="" width={64} height={64} className="w-16 h-16" />
          <h1 className="text-2xl font-bold text-blue-900">Admin Login</h1>
          <p className="text-sm text-gray-500">Galilee Prayer Fellowship</p>
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            Phone number or password is incorrect.
          </p>
        )}

        <div>
          <label htmlFor="phone" className="block font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="username"
            required
            className="w-full min-w-0 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </div>

        <div>
          <label htmlFor="password" className="block font-medium text-gray-700 mb-2">
            Password
          </label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
            className="w-full min-w-0 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition"
        >
          <LogIn size={18} />
          Log In
        </button>

        <p className="text-xs text-gray-500 text-center">
          Forgot your password? Ask another admin to reset it.
        </p>
      </form>
    </main>
  );
}
