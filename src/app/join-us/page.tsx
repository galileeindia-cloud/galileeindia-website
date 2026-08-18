import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JoinUsForm from "@/components/JoinUsForm";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Join Us",
  description:
    "Get in touch with Galilee Prayer Fellowship, request prayer, or let us know you're planning a visit.",
  path: "/join-us",
  image: "/opengraph-image",
});

export default function JoinUsPage() {
  return (
    <>
      <Navbar />

      <section className="bg-gray-50 min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900">
              Join Our Church Family
            </h1>

            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              We&rsquo;d love to get to know you, pray with you, and help you
              grow in your walk with Jesus Christ. Please complete the form
              below and one of our pastoral team members will be delighted to
              connect with you.
            </p>
          </div>

          <JoinUsForm />
        </div>
      </section>

      <Footer />
    </>
  );
}
