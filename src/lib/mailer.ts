import "server-only";
import nodemailer from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer";

/**
 * Sends one email from GMAIL_USER (the church's Gmail, via an app
 * password). Used by the weekly birthday report and admin password resets.
 */
export async function sendEmail(message: {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: Attachment[];
}) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set");

  const transport = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  await transport.sendMail({ from: `Galilee Prayer Fellowship <${user}>`, ...message });
}

/**
 * The site's own address for links in emails. Fixed rather than taken from
 * the request, so a forged Host header can't point a reset link elsewhere.
 */
export function siteUrl() {
  return process.env.NODE_ENV === "production" ? "https://galileeindia.com" : "http://localhost:3000";
}
