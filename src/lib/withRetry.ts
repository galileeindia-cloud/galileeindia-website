const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 700;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries a Supabase call on transient failure. This project has seen
 * intermittent "Failed to fetch" style errors against Supabase across
 * several unrelated features (leaderboard, contact form) that don't
 * reproduce on demand, so every write/read that matters to the user
 * should go through this rather than failing on the first blip.
 */
export async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.error(`${label} failed (attempt ${attempt}/${RETRY_ATTEMPTS}):`, err);
      if (attempt < RETRY_ATTEMPTS) {
        await delay(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError;
}
