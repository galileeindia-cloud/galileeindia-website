import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizePhone } from "@/lib/phone";

// Admin login for /admin. Admins are members with access_level 1 (reports
// + add/edit members) or 2 (reports only), who log in with their phone
// number and a password stored as a bcrypt hash in members.password_hash.
//
// The session is a signed cookie holding the member's id and expiry. Every
// request re-reads the member, so removing their access or changing their
// password ends existing sessions straight away.

export const ACCESS_LEVELS = { member: 0, admin: 1, reportsOnly: 2 } as const;
export const ACCESS_LABELS: Record<number, string> = {
  0: "Member",
  1: "Admin",
  2: "Reports only",
};

const COOKIE = "gpf_admin";
const SESSION_HOURS = 12;

export interface Admin {
  memberUuid: string;
  name: string;
  accessLevel: 1 | 2;
  canEdit: boolean;
}

interface AdminRow {
  member_uuid: string;
  salutation: string | null;
  full_name: string;
  phone: string | null;
  access_level: number;
  password_hash: string | null;
}

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("ADMIN_SESSION_SECRET must be set (32+ characters)");
  return value;
}

/** Changes whenever the password does, so a reset ends old sessions. */
function passwordStamp(hash: string) {
  return createHash("sha256").update(hash).digest("base64url").slice(0, 16);
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function encodeSession(memberUuid: string, hash: string) {
  const payload = Buffer.from(
    JSON.stringify({ m: memberUuid, p: passwordStamp(hash), e: Date.now() + SESSION_HOURS * 3_600_000 })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decodeSession(token: string | undefined): { m: string; p: string; e: number } | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof session.m === "string" && typeof session.e === "number" && session.e > Date.now()
      ? session
      : null;
  } catch {
    return null;
  }
}

export const PASSWORD_RULE = "At least 10 characters, including a letter and a number.";

/** Why `password` is too weak, or null if it meets PASSWORD_RULE. */
export function passwordProblem(password: string): string | null {
  if (password.length < 10) return "Passwords must be at least 10 characters";
  if (!/[A-Za-z]/.test(password)) return "Passwords must include at least one letter";
  if (!/[0-9]/.test(password)) return "Passwords must include at least one number";
  return null;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// Compared against when no admin has the given phone, so a wrong phone
// takes as long as a wrong password and can't be told apart by timing.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

/**
 * Checks a phone + password and, on success, sets the session cookie.
 * Returns false for any failure without saying which part was wrong.
 */
export async function logIn(phone: string, password: string): Promise<boolean> {
  const wanted = normalizePhone(phone);
  const { data, error } = await supabaseAdmin
    .from("members")
    .select("member_uuid, salutation, full_name, phone, access_level, password_hash")
    .in("access_level", [1, 2])
    .not("password_hash", "is", null);
  if (error) throw error;

  const candidates = ((data ?? []) as AdminRow[]).filter(
    (row) => wanted.length === 10 && normalizePhone(row.phone) === wanted
  );

  let match: AdminRow | null = null;
  for (const row of candidates) {
    if (await bcrypt.compare(password, row.password_hash!)) {
      match = row;
      break;
    }
  }
  if (candidates.length === 0) await bcrypt.compare(password, DUMMY_HASH);
  if (!match) return false;

  await setSessionCookie(match.member_uuid, match.password_hash!);
  return true;
}

async function setSessionCookie(memberUuid: string, hash: string) {
  (await cookies()).set(COOKIE, encodeSession(memberUuid, hash), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_HOURS * 3600,
  });
}

/**
 * After admins change their own password: a new session for this browser,
 * since the old one (tied to the old password) has just stopped working.
 * Sessions in other browsers still end, as intended.
 */
export async function renewOwnSession(memberUuid: string, newHash: string) {
  await setSessionCookie(memberUuid, newHash);
}

export async function logOut() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

/** The logged-in admin for this request, or null. */
export const getAdmin = cache(async (): Promise<Admin | null> => {
  const session = decodeSession((await cookies()).get(COOKIE)?.value);
  if (!session) return null;

  const { data, error } = await supabaseAdmin
    .from("members")
    .select("member_uuid, salutation, full_name, phone, access_level, password_hash")
    .eq("member_uuid", session.m)
    .maybeSingle();
  if (error) throw error;

  const row = data as AdminRow | null;
  if (!row || (row.access_level !== 1 && row.access_level !== 2) || !row.password_hash) return null;
  if (passwordStamp(row.password_hash) !== session.p) return null;

  return {
    memberUuid: row.member_uuid,
    name: row.salutation ? `${row.salutation} ${row.full_name}` : row.full_name,
    accessLevel: row.access_level,
    canEdit: row.access_level === 1,
  };
});

/** For admin pages and actions: the admin, or a redirect to the login page. */
export async function requireAdmin(options: { edit?: boolean } = {}): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  if (options.edit && !admin.canEdit) redirect("/admin?notice=view-only");
  return admin;
}
