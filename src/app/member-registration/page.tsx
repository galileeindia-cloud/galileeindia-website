import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FamilyRegistrationForm from "@/components/FamilyRegistrationForm";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Family Registration",
  description:
    "Register your family with Galilee Prayer Fellowship so we can celebrate birthdays, anniversaries, and special occasions with you.",
  path: "/member-registration",
});

export default function MemberRegistrationPage() {
  return (
    <>
      <Navbar />

      <section className="bg-gray-50 min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900">
              Register Your Family
            </h1>

            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Help us celebrate with you — tell us about your family so we can
              remember your birthdays, anniversary, and other special
              occasions.
            </p>
          </div>

          <FamilyRegistrationForm />
        </div>
      </section>

      <Footer />
    </>
  );
}
