import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { RESET_MINUTES } from "@/lib/adminAuth";
import { forgotPasswordAction } from "../actions";

export const metadata = { title: "Forgot Password" };

const card = "w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 space-y-5";

export default async function ForgotPasswordPage({ searchParams }: PageProps<"/admin/forgot-password">) {
  const { sent } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      {sent ? (
        <div className={`${card} text-center`}>
          <Mail className="mx-auto text-blue-900" size={40} />
          <h1 className="text-2xl font-bold text-blue-900">Check your email</h1>
          <p className="text-gray-600">
            If that phone number belongs to an admin with an email on file, we&rsquo;ve sent a link
            to reset the password. It works once and expires in {RESET_MINUTES} minutes.
          </p>
          <p className="text-sm text-gray-500">
            No email after a few minutes? Check your Spam folder, or ask another admin to reset
            your password.
          </p>
          <Link href="/admin/login" className="inline-flex items-center gap-1 text-sm text-blue-900 hover:underline">
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </div>
      ) : (
        <form action={forgotPasswordAction} className={card}>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-blue-900">Forgot Password</h1>
            <p className="text-sm text-gray-500">
              Enter your phone number. We&rsquo;ll email a reset link to the address on your member
              record.
            </p>
          </div>

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

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition"
          >
            <Mail size={18} />
            Email Me a Reset Link
          </button>

          <Link href="/admin/login" className="flex items-center justify-center gap-1 text-sm text-blue-900 hover:underline">
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </form>
      )}
    </main>
  );
}
