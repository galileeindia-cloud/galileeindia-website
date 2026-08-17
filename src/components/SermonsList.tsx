"use client";

import { useRef, useState } from "react";
import type { YouTubeVideo } from "@/services/youtube";

export default function SermonsList({ videos }: { videos: YouTubeVideo[] }) {
  const [nowPlayingId, setNowPlayingId] = useState<string | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const latest = videos[0];
  const previous = videos.slice(1);
  const featured =
    videos.find((video) => video.id.videoId === nowPlayingId) ?? latest;

  function playVideo(videoId: string) {
    setNowPlayingId(videoId);
    playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!featured) {
    return (
      <p className="text-center text-gray-500">
        No sermons found. Please check back soon.
      </p>
    );
  }

  return (
    <>
      <div
        ref={playerRef}
        className="bg-white rounded-3xl shadow-xl overflow-hidden mb-20 scroll-mt-24"
      >
        <div className="aspect-video w-full bg-black">
          <iframe
            key={featured.id.videoId}
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${featured.id.videoId}${
              nowPlayingId ? "?autoplay=1" : ""
            }`}
            title={featured.snippet.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="p-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
            {featured.snippet.title}
          </h2>

          <p className="text-gray-500">Published on {featured.publishedLong}</p>
        </div>
      </div>

      {previous.length > 0 && (
        <>
          <h2 className="text-3xl font-bold text-blue-900 mb-10 text-center">
            Previous Sermons
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {previous.map((video) => (
              <button
                key={video.id.videoId}
                onClick={() => playVideo(video.id.videoId)}
                className={`text-left bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition duration-300 ${
                  video.id.videoId === nowPlayingId ? "ring-2 ring-blue-900" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={video.snippet.thumbnails.high.url}
                  alt={video.snippet.title}
                  className="w-full"
                />

                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-3">
                    {video.snippet.title}
                  </h3>

                  <p className="text-gray-500 mb-5">{video.publishedShort}</p>

                  <span className="text-red-600 font-semibold">
                    ▶ Watch Sermon
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
