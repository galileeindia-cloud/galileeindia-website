"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#services", label: "Ministries" },
  { href: "/#events", label: "Events" },
  { href: "/#pastors", label: "Our Pastors" },
  { href: "/sermons", label: "Sermons" },
  { href: "/bible-puzzle", label: "Bible Quiz" },
  { href: "/#contact", label: "Contact" },
  { href: "/join-us", label: "Join Us" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-24 lg:h-28">
          <Link href="/#home" className="flex items-center gap-4">
            <Image
              src="/images/logo.png"
              alt="Galilee Prayer Fellowship"
              width={72}
              height={72}
              className="w-16 h-16 lg:w-20 lg:h-20 object-contain"
              priority
            />
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-blue-900 leading-tight">
                Galilee Prayer Fellowship
              </h1>
              <p className="text-xs lg:text-sm text-gray-500">
                Lawsons Bay Colony &bull; Visakhapatnam
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 font-medium text-gray-700">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-blue-700">
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            className="lg:hidden text-gray-700"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="lg:hidden flex flex-col gap-1 pb-6 font-medium text-gray-700">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-3 px-2 rounded-lg hover:bg-blue-50 hover:text-blue-700"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
