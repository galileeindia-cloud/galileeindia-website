export type HeroImage = {
  src: string;
  alt: string;
  /** CSS object-position for the background image; defaults to "center" */
  position?: string;
};

export const HERO_IMAGES: HeroImage[] = [
  { src: "/images/hero/slide-01.jpg", alt: "Candlelight service at Galilee Prayer Fellowship" },
  { src: "/images/hero/slide-02.jpg", alt: "Congregation gathered for worship" },
  { src: "/images/hero/slide-03.jpg", alt: "A church elder sharing a message" },
  { src: "/images/hero/slide-04.jpg", alt: "Vacation Bible School group photo" },
  {
    src: "/images/hero/slide-05.jpg",
    alt: "A baptism at Galilee Prayer Fellowship",
    position: "center 32%",
  },
  { src: "/images/hero/slide-06.jpg", alt: "Pastor Sam Oguri preaching" },
  {
    src: "/images/hero/slide-07.jpg",
    alt: "Pastor Sam Oguri and Dr. Jaya Suma",
  },
];
