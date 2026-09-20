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

type PlaylistItem = {
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails?: Record<string, { url: string } | undefined>;
  };
  contentDetails: { videoId: string; videoPublishedAt?: string };
};

// Reads the channel's "uploads" playlist rather than the search endpoint:
// search silently omits many public videos, while the uploads playlist lists
// every one (and costs 1 quota unit per call instead of 100).
export async function getVideos(): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!apiKey || !channelId) return [];

  // A channel's uploads playlist ID is its channel ID with the "UC" prefix
  // swapped for "UU".
  const uploadsPlaylistId = `UU${channelId.slice(2)}`;

  const url =
    `https://www.googleapis.com/youtube/v3/playlistItems?` +
    `key=${apiKey}` +
    `&playlistId=${uploadsPlaylistId}` +
    `&part=snippet,contentDetails` +
    `&maxResults=50`;

  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return ((data.items ?? []) as PlaylistItem[])
    .map((item) => {
      const { thumbnails, title } = item.snippet;
      const thumbnail = thumbnails?.high ?? thumbnails?.medium ?? thumbnails?.default;
      return { item, title, thumbnail };
    })
    // Deleted and private videos stay in the playlist but have no thumbnail.
    .filter(({ thumbnail }) => thumbnail)
    .map(({ item, title, thumbnail }) => {
      const publishedAt = item.contentDetails.videoPublishedAt ?? item.snippet.publishedAt;
      return {
        id: { videoId: item.contentDetails.videoId, kind: "youtube#video" },
        snippet: {
          title,
          publishedAt,
          thumbnails: { high: { url: thumbnail!.url } },
        },
        publishedLong: formatPublished(publishedAt, MONTHS_LONG),
        publishedShort: formatPublished(publishedAt, MONTHS_SHORT),
      };
    })
    .sort((a, b) => b.snippet.publishedAt.localeCompare(a.snippet.publishedAt));
}
