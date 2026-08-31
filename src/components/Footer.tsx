import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-blue-950 text-blue-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <h2 className="text-xl font-bold text-white mb-3">
            Galilee Prayer Fellowship
          </h2>
          <p className="text-sm leading-6 text-blue-200">
            Serving Christ and sharing His love in Visakhapatnam for over 50
            years.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wider text-white uppercase mb-4">
            Quick Links
          </h3>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/#about" className="hover:text-white">About</Link>
            <Link href="/#services" className="hover:text-white">Ministries</Link>
            <Link href="/#events" className="hover:text-white">Events</Link>
            <Link href="/#pastors" className="hover:text-white">Our Pastors</Link>
            <Link href="/sermons" className="hover:text-white">Sermons</Link>
            <Link href="/bible-puzzle" className="hover:text-white">Bible Puzzles</Link>
            <Link href="/join-us" className="hover:text-white">Join Us</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wider text-white uppercase mb-4">
            Contact
          </h3>
          <div className="flex flex-col gap-3 text-sm">
            <a
              href="https://maps.app.goo.gl/zWYu3LqcEcNnCawV8"
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-2 hover:text-white"
            >
              <MapPin size={18} className="mt-0.5 shrink-0" />
              4-61-15, Lawsons Bay Colony, Visakhapatnam
            </a>

            <a href="tel:+919390097125" className="flex items-center gap-2 hover:text-white">
              <Phone size={18} className="shrink-0" />
              +91 93900 97125
            </a>

            <a
              href="mailto:galileeindia@gmail.com"
              className="flex items-center gap-2 hover:text-white"
            >
              <Mail size={18} className="shrink-0" />
              galileeindia@gmail.com
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-blue-900 py-6 text-center text-sm text-blue-300">
        © {new Date().getFullYear()} Galilee Prayer Fellowship. All rights
        reserved.
      </div>
    </footer>
  );
}
