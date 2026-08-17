export type YouTubeVideo = {
  id: { videoId: string; kind: string };
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails: { high: { url: string } };
  };
};

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

  return (data.items ?? []).filter(
    (item: YouTubeVideo) => item.id.kind === "youtube#video"
  );
}
