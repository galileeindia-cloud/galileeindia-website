"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hashPassword, logIn, logOut, requireAdmin } from "@/lib/adminAuth";
import { daysBetween, parseIsoDay } from "@/lib/occasions";
import { sendOccasionsReport } from "@/lib/sendOccasionsReport";
import { SALUTATIONS } from "@/types/familyRegistrationSchema";

const MAX_REPORT_DAYS = 366;

// ---------- login ----------

export async function loginAction(formData: FormData) {
  const phone = String(formData.get("phone") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!(await logIn(phone, password))) {
    // A short pause slows down password guessing.
    await new Promise((resolve) => setTimeout(resolve, 800));
    redirect("/admin/login?error=1");
  }
  redirect("/admin");
}

export async function logoutAction() {
  await logOut();
  redirect("/admin/login");
}

// ---------- reports ----------

export async function emailReportAction(formData: FormData) {
  await requireAdmin();
  const from = parseIsoDay(String(formData.get("from")));
  const to = parseIsoDay(String(formData.get("to")));
  const query = `from=${formData.get("from")}&to=${formData.get("to")}`;
  if (!from || !to) redirect(`/admin?${query}&notice=bad-dates`);

  const days = daysBetween(from, to);
  if (days.length === 0 || days.length > MAX_REPORT_DAYS) redirect(`/admin?${query}&notice=bad-dates`);

  try {
    await sendOccasionsReport(days);
  } catch (err) {
    console.error("Admin report email failed:", err);
    redirect(`/admin?${query}&notice=email-failed`);
  }
  redirect(`/admin?${query}&notice=emailed`);
}

// ---------- members ----------

const optional = (schema: z.ZodTypeAny) =>
  z.preprocess((value) => (value === "" || value === null ? undefined : value), schema.optional());

const memberFields = z
  .object({
    salutation: z.enum(SALUTATIONS),
    full_name: z.string().trim().min(2, "Enter a name"),
    relationship: z.enum(["head", "spouse", "child", "parent", "in_law"]),
    birth_day: optional(z.coerce.number().int().min(1).max(31)),
    birth_month: optional(z.coerce.number().int().min(1).max(12)),
    birth_year: optional(z.coerce.number().int().min(1900).max(2100)),
    phone: optional(z.string().trim()),
    email: optional(z.string().trim().email("Enter a valid email")),
    is_baptized: z.boolean(),
    consent: z.boolean(),
  })
  .refine((m) => (m.birth_day === undefined) === (m.birth_month === undefined), {
    message: "Enter both day and month of birth, or neither",
  });

function readMember(formData: FormData) {
  return memberFields.safeParse({
    salutation: formData.get("salutation"),
    full_name: formData.get("full_name"),
    relationship: formData.get("relationship"),
    birth_day: formData.get("birth_day"),
    birth_month: formData.get("birth_month"),
    birth_year: formData.get("birth_year"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    is_baptized: formData.get("is_baptized") === "on",
    consent: formData.get("consent") === "on",
  });
}

function memberRow(m: z.infer<typeof memberFields>) {
  return {
    salutation: m.salutation,
    full_name: m.full_name,
    relationship: m.relationship,
    birth_day: m.birth_day ?? null,
    birth_month: m.birth_month ?? null,
    birth_year: m.birth_year ?? null,
    phone: m.phone ?? null,
    email: m.email ?? null,
    is_baptized: m.is_baptized,
    consent: m.consent,
  };
}

function errorParam(message: string) {
  return `error=${encodeURIComponent(message)}`;
}

export async function updateMemberAction(formData: FormData) {
  const admin = await requireAdmin({ edit: true });
  const memberUuid = String(formData.get("member_uuid"));
  const back = `/admin/members/${memberUuid}`;

  const parsed = readMember(formData);
  if (!parsed.success) redirect(`${back}?${errorParam(parsed.error.issues[0].message)}`);

  const accessLevel = Number(formData.get("access_level"));
  if (![0, 1, 2].includes(accessLevel)) redirect(`${back}?${errorParam("Choose an access level")}`);
  const newPassword = String(formData.get("new_password") ?? "");

  const update: Record<string, unknown> = memberRow(parsed.data);

  // Admins can't change their own access, so nobody locks themselves out.
  if (memberUuid !== admin.memberUuid) {
    update.access_level = accessLevel;
    if (accessLevel === 0) update.password_hash = null;
  }

  if (newPassword) {
    if (newPassword.length < 8) redirect(`${back}?${errorParam("Passwords must be at least 8 characters")}`);
    const level = memberUuid === admin.memberUuid ? admin.accessLevel : accessLevel;
    if (level === 0) redirect(`${back}?${errorParam("Give admin access before setting a password")}`);
    update.password_hash = await hashPassword(newPassword);
  } else if (memberUuid !== admin.memberUuid && accessLevel > 0) {
    // Granting access needs a password, unless they already have one.
    const { data } = await supabaseAdmin
      .from("members")
      .select("password_hash")
      .eq("member_uuid", memberUuid)
      .single();
    if (!(data as { password_hash: string | null } | null)?.password_hash) {
      redirect(`${back}?${errorParam("Set a password to give this member admin access")}`);
    }
  }

  const effectiveLevel = memberUuid === admin.memberUuid ? admin.accessLevel : accessLevel;
  if (update.phone === null && effectiveLevel !== 0) {
    redirect(`${back}?${errorParam("Admins need a phone number to log in")}`);
  }

  const { error } = await supabaseAdmin.from("members").update(update).eq("member_uuid", memberUuid);
  if (error) {
    console.error("Member update failed:", error);
    redirect(`${back}?${errorParam("Couldn't save. Please try again.")}`);
  }

  revalidatePath("/admin", "layout");
  redirect(`${back}?saved=1`);
}

export async function addMemberAction(formData: FormData) {
  await requireAdmin({ edit: true });
  const familyUuid = String(formData.get("family_uuid"));
  const back = `/admin/families/${familyUuid}`;

  const parsed = readMember(formData);
  if (!parsed.success) redirect(`${back}?${errorParam(parsed.error.issues[0].message)}#add`);
  if (parsed.data.relationship === "head") {
    redirect(`${back}?${errorParam("A family can have only one head")}#add`);
  }

  const { error } = await supabaseAdmin
    .from("members")
    .insert([{ member_uuid: randomUUID(), family_uuid: familyUuid, ...memberRow(parsed.data) }]);
  if (error) {
    console.error("Add member failed:", error);
    redirect(`${back}?${errorParam("Couldn't add the member. Please try again.")}#add`);
  }

  revalidatePath("/admin", "layout");
  redirect(`${back}?added=1`);
}

// ---------- families ----------

const familyFields = z.object({
  anniversary_date: optional(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  attending_since: optional(z.string().regex(/^\d{4}-\d{2}$/)),
  address: optional(z.string().trim()),
  city: optional(z.string().trim()),
  zip_code: optional(z.string().trim()),
});

export async function updateFamilyAction(formData: FormData) {
  await requireAdmin({ edit: true });
  const familyUuid = String(formData.get("family_uuid"));
  const back = `/admin/families/${familyUuid}`;

  const parsed = familyFields.safeParse({
    anniversary_date: formData.get("anniversary_date"),
    attending_since: formData.get("attending_since"),
    address: formData.get("address"),
    city: formData.get("city"),
    zip_code: formData.get("zip_code"),
  });
  if (!parsed.success) redirect(`${back}?${errorParam("Check the dates and try again")}`);

  const f = parsed.data;
  const { error } = await supabaseAdmin
    .from("families")
    .update({
      anniversary_date: f.anniversary_date ?? null,
      attending_since: f.attending_since ? `${f.attending_since}-01` : null,
      address: f.address ?? null,
      city: f.city ?? null,
      zip_code: f.zip_code ?? null,
    })
    .eq("family_uuid", familyUuid);
  if (error) {
    console.error("Family update failed:", error);
    redirect(`${back}?${errorParam("Couldn't save. Please try again.")}`);
  }

  revalidatePath("/admin", "layout");
  redirect(`${back}?saved=1`);
}
