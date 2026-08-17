"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { HERO_IMAGES } from "@/data/heroImages";

const INTERVAL_MS = 5000;

export default function HeroSlideshow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % HERO_IMAGES.length);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-blue-950">
      {HERO_IMAGES.map((image, index) => (
        <div
          key={image.src}
          className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
          style={{ opacity: index === active ? 1 : 0 }}
        >
          <div
            className="absolute inset-0 animate-kenburns"
            style={{
              animationDuration: `${(HERO_IMAGES.length * INTERVAL_MS) / 1000}s`,
              animationDelay: `-${(index * INTERVAL_MS) / 1000}s`,
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: image.position ?? "center" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
