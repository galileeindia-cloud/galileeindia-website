/**
 * Reduces a phone number to its last 10 digits so "+91 98765 43210",
 * "098765-43210" and "9876543210" all match. Indian mobile numbers are 10
 * digits; the country code and leading 0 are dropped.
 */
export function normalizePhone(phone: string | null | undefined): string {
  return (phone ?? "").replace(/\D/g, "").slice(-10);
}
