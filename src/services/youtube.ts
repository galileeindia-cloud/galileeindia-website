export type YouTubeVideo = {
  id: { videoId: string; kind: string };
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails: { high: { url: string } };
  };
  /** Pre-formatted server-side so client hydration can't disagree with SSR
   * over locale/ICU-dependent date formatting (a classic hydration-mismatch
   * source when using toLocaleDateString in a client component). */
  publishedLong: string;
  publishedShort: string;
};

const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatPublished(iso: string, months: string[]) {
  const date = new Date(iso);
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export async function getVideos(): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  const url =
    `https://www.googleapis.com/youtube/v3/search?` +
    `key=${apiKey}` +
    `&channelId=${channelId}` +
    `&part=snippet,id` +
    `&type=video` +
    `&order=date` +
    `&maxResults=50`;

  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return (data.items ?? [])
    .filter((item: YouTubeVideo) => item.id.kind === "youtube#video")
    .map((item: YouTubeVideo) => ({
      ...item,
      publishedLong: formatPublished(item.snippet.publishedAt, MONTHS_LONG),
      publishedShort: formatPublished(item.snippet.publishedAt, MONTHS_SHORT),
    }));
}
