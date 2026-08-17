import Image from "next/image";
import { Sparkles } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="w-full bg-white py-20 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="bg-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-900">
                  <Sparkles size={20} />
                </span>
                <span className="text-sm font-semibold tracking-wider text-blue-700 uppercase">
                  How It Started
                </span>
              </div>

              <h2 className="text-3xl font-bold text-blue-900 mb-6">
                Our Beginning
              </h2>

              <p className="text-gray-700 leading-8 mb-6">
                About 50 years ago, God led the family of{" "}
                <strong>Dr. Prabhudas Oguri &amp; Samadanam Oguri</strong> to
                this coastal area of Visakhapatnam, Andhra Pradesh, India. At
                that time, it was a lonely and sparsely populated place. There
                were no residential houses nearby&mdash;only a few
                fishermen&rsquo;s huts on one side and a traditional village
                several miles away on the other.
              </p>

              <p className="text-gray-700 leading-8 mb-6">
                The people living in the surrounding communities had little
                knowledge of the true and living God. Many were deeply rooted
                in superstition and idol worship, offering animal sacrifices
                and carrying idols in long processions accompanied by dancing
                and drums. Fear of demons and evil spirits was widespread, and
                many people had never experienced the hope and everlasting
                love found in the Lord Jesus Christ.
              </p>

              <p className="text-gray-700 leading-8">
                Moved with compassion for these people, Bro. Prabhudas and his
                family began praying faithfully for them. Over the years, God
                answered those prayers by bringing together a few families to
                worship Him every Sunday. What began as a small gathering of
                believers gradually grew into{" "}
                <strong>Galilee Prayer Fellowship.</strong>
              </p>
            </div>

            <div>
              <Image
                src="/images/founder.jpg"
                alt="Dr. Prabhudas Oguri & Samadanam Oguri"
                width={480}
                height={600}
                className="rounded-2xl shadow-xl ring-4 ring-blue-50 w-full aspect-4/5 object-cover"
              />

              <div className="text-center mt-6">
                <h3 className="text-2xl font-bold text-blue-900">
                  Dr. Prabhudas Oguri &amp; Samadanam Oguri
                </h3>

                <p className="text-gray-600 italic mb-3">Founding Pastors</p>

                <p className="text-gray-700 leading-7">
                  A faithful servant of God whose life and ministry laid the
                  spiritual foundation of Galilee Prayer Fellowship. Through
                  prayer, unwavering faith, and a deep burden for the people
                  of Visakhapatnam, God used him to establish a church that
                  continues to proclaim the Gospel of Jesus Christ today.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 bg-blue-950 text-white rounded-2xl p-8 md:p-10">
          <p className="text-blue-100 leading-8 mb-4">
            Today, Galilee Prayer Fellowship continues to carry a burden for
            the spiritual needs of both the residents of Lawsons Bay Colony
            and the surrounding fishing communities. Along with sharing the
            Gospel, we seek to demonstrate Christ&rsquo;s love by extending
            practical help to underprivileged families whenever possible.
          </p>
          <blockquote className="border-l-4 border-gold pl-6 text-white font-semibold text-lg leading-8">
            By God&rsquo;s grace, we remain committed to proclaiming the Good
            News of Jesus Christ, nurturing believers, serving our community,
            and making His love known to future generations.
          </blockquote>
        </div>
      </div>
    </section>
  );
}
