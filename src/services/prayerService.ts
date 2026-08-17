import { supabase } from "@/lib/supabase";

export interface PrayerInput {
  contact_uuid: string;
  prayer_request: string;
}

export async function createPrayerRequest(prayer: PrayerInput) {
  if (!prayer.prayer_request.trim()) {
    return;
  }

  const { error } = await supabase.from("prayer_requests").insert([
    {
      contact_uuid: prayer.contact_uuid,
      prayer_request: prayer.prayer_request,
    },
  ]);

  if (error) {
    throw error;
  }
}
