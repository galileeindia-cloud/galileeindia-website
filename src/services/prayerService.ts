import { supabase } from "@/lib/supabase";
import { withRetry } from "@/lib/withRetry";

export interface PrayerInput {
  contact_uuid: string;
  prayer_request: string;
}

export async function createPrayerRequest(prayer: PrayerInput) {
  if (!prayer.prayer_request.trim()) {
    return;
  }

  await withRetry(async () => {
    const { error } = await supabase.from("prayer_requests").insert([
      {
        contact_uuid: prayer.contact_uuid,
        prayer_request: prayer.prayer_request,
      },
    ]);

    if (error) {
      throw error;
    }
  }, "createPrayerRequest");
}
