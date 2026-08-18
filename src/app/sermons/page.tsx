import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SermonsList from "@/components/SermonsList";
import { getVideos } from "@/services/youtube";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Sermons",
  description:
    "Watch the latest messages from Galilee Prayer Fellowship and grow together through God's Word.",
  path: "/sermons",
  image: "/opengraph-image",
});

export default async function SermonsPage() {
  const videos = await getVideos();

  return (
    <>
      <Navbar />

      <section className="bg-gray-50 min-h-screen py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-blue-900">
            Sermons
          </h1>

          <p className="text-center text-gray-600 mt-4 mb-16">
            Watch our latest messages and grow together through God&rsquo;s
            Word.
          </p>

          <SermonsList videos={videos} />
        </div>
      </section>

      <Footer />
    </>
  );
}
