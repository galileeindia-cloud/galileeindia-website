import Link from "next/link";
import { KeyRound } from "lucide-react";
import { PASSWORD_RULE, adminForResetToken } from "@/lib/adminAuth";
import PasswordInput from "@/components/admin/PasswordInput";
import { resetPasswordAction } from "../actions";

export const metadata = { title: "Reset Password" };

const card = "w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 space-y-5";
const input =
  "w-full min-w-0 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-900";

export default async function ResetPasswordPage({ searchParams }: PageProps<"/admin/reset-password">) {
  const params = await searchParams;
  const token = String(params.token ?? "");
  const admin = token ? await adminForResetToken(token) : null;

  if (!admin) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className={`${card} text-center`}>
          <h1 className="text-2xl font-bold text-blue-900">Link expired</h1>
          <p className="text-gray-600">
            This reset link has expired or has already been used. Please ask for a new one.
          </p>
          <Link
            href="/admin/forgot-password"
            className="block w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg"
          >
            Get a New Link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <form action={resetPasswordAction} className={card}>
        <input type="hidden" name="token" value={token} />
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-blue-900">Choose a New Password</h1>
          <p className="text-sm text-gray-500">For {admin.name}</p>
        </div>

        {params.error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {String(params.error)}
          </p>
        )}

        <div>
          <label htmlFor="password" className="block font-medium text-gray-700 mb-2">
            New Password
          </label>
          <PasswordInput id="password" name="password" autoComplete="new-password" minLength={10} required className={input} />
          <p className="text-xs text-gray-500 mt-1">{PASSWORD_RULE}</p>
        </div>

        <div>
          <label htmlFor="confirm" className="block font-medium text-gray-700 mb-2">
            Type It Again
          </label>
          <PasswordInput id="confirm" name="confirm" autoComplete="new-password" minLength={10} required className={input} />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition"
        >
          <KeyRound size={18} />
          Save New Password
        </button>
      </form>
    </main>
  );
}
