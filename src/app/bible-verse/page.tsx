import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BibleVerseLookup from "@/components/BibleVerseLookup";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Bible Verse Lookup",
  description:
    "Type a Bible reference like \"John 3:16\" and press space to reveal the verse.",
  path: "/bible-verse",
});

export default function BibleVersePage() {
  return (
    <>
      <Navbar />

      <section className="bg-gray-50 min-h-screen py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm font-semibold tracking-widest text-blue-700 uppercase mb-2">
            Bible Verse Lookup
          </p>
          <h1 className="font-bold text-blue-900 text-center text-3xl sm:text-5xl mb-4">
            Find any verse instantly
          </h1>
          <p className="text-center text-gray-600 text-lg mb-10">
            Type a reference such as &ldquo;John 3:16&rdquo; below. A preview appears as you
            type, and pressing space (or enter) reveals the full verse.
          </p>

          <BibleVerseLookup />
        </div>
      </section>

      <Footer />
    </>
  );
}
