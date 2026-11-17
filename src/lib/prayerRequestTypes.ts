// The "Type of Request" choices on the admin Prayer Requests page. Stored
// as this exact text in member_prayer_requests.request_type; the database
// check constraint (supabase/add_request_type_2026-11-17.sql) lists the
// same values, so keep the two in step when changing this list.
export const PRAYER_REQUEST_TYPES = [
  "Job and Promotion",
  "Health and Healing",
  "Spiritual Growth",
  "Exam and Studies",
  "Family Issues",
  "Bereavement and Comfort",
  "Marriages and Life Partners",
  "Financial Needs",
  "Pregnant Mothers",
  "Seeking Children",
  "Travel",
] as const;

export type PrayerRequestType = (typeof PRAYER_REQUEST_TYPES)[number];
