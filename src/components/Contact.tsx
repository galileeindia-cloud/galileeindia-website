export default function Contact() {
  return (
    <section id="contact" className="w-full bg-gray-50 py-20 scroll-mt-24">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-blue-900 text-center mb-4">
          Contact Us
        </h2>

        <p className="text-center text-lg md:text-xl text-gray-600 mb-16">
          We&rsquo;d love to welcome you to Galilee Prayer Fellowship.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-8">
              Church Information
            </h3>

            <div className="space-y-8">
              <div>
                <h4 className="font-semibold text-lg text-blue-800 mb-2">
                  📍 Address
                </h4>
                <p className="text-gray-700 leading-8">
                  Galilee Prayer Fellowship
                  <br />
                  Ground Floor, Galilee Enclave
                  <br />
                  D.No. 4-61-15
                  <br />
                  Lawsons Bay Colony
                  <br />
                  Visakhapatnam &ndash; 530017
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg text-blue-800 mb-2">
                  📞 Phone
                </h4>
                <a href="tel:+919390097125" className="text-blue-700 hover:underline">
                  +91 93900 97125
                </a>
              </div>

              <div>
                <h4 className="font-semibold text-lg text-blue-800 mb-2">
                  📧 Email
                </h4>
                <a
                  href="mailto:galileeindia@gmail.com"
                  className="text-blue-700 hover:underline"
                >
                  galileeindia@gmail.com
                </a>
              </div>

              <div>
                <h4 className="font-semibold text-lg text-blue-800 mb-2">
                  ▶ YouTube
                </h4>
                <a
                  href="https://www.youtube.com/@galileeindia3736"
                  target="_blank"
                  rel="noreferrer"
                  className="text-red-600 hover:underline"
                >
                  youtube.com/@galileeindia3736
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-8">
              Weekly Services
            </h3>

            <div className="divide-y divide-gray-100">
              {[
                { label: "Sunday Worship", time: "10:30 AM – 12:30 PM" },
                { label: "Sunday School", time: "11:30 AM – 12:30 PM" },
                { label: "Saturday Fasting Prayer", time: "7:30 PM – 9:00 PM" },
                { label: "Friday Ladies Prayer Meeting", time: "11:00 AM – 1:00 PM" },
              ].map((service) => (
                <div
                  key={service.label}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-4"
                >
                  <span className="font-semibold text-gray-900">{service.label}</span>
                  <span className="text-gray-600 sm:text-right whitespace-nowrap">
                    {service.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mt-12">
          <h3 className="text-3xl font-bold text-blue-900 text-center mb-8">
            Find Us
          </h3>

          <div className="rounded-xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps?q=Galilee+Prayer+Fellowship+Lawsons+Bay+Colony+Visakhapatnam&output=embed"
              width="100%"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              title="Galilee Prayer Fellowship Location"
            />
          </div>

          <div className="text-center mt-8">
            <a
              href="https://maps.app.goo.gl/zWYu3LqcEcNnCawV8"
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-blue-900 hover:bg-blue-800 text-white px-8 py-4 rounded-xl font-semibold transition"
            >
              📍 Get Directions
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-10 mt-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6">
            You&rsquo;re Always Welcome
          </h3>

          <p className="text-lg text-gray-700 leading-8">
            Whether you&rsquo;re exploring the Christian faith, looking for a
            church home, or simply seeking prayer, we warmly invite you to
            worship with us at Galilee Prayer Fellowship.
          </p>

          <p className="text-lg text-gray-700 leading-8 mt-6">
            We look forward to welcoming you and sharing the love of Jesus
            Christ with you and your family.
          </p>
        </div>
      </div>
    </section>
  );
}
