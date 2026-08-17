import HeroSlideshow from "./HeroSlideshow";

export default function Hero() {
  return (
    <section id="home" className="relative h-[600px] md:h-[750px] overflow-hidden scroll-mt-24">
      <HeroSlideshow />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(11,61,145,.55), rgba(0,0,0,.65))",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center text-center text-white px-5">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-5">
            Galilee Prayer Fellowship
          </h1>

          <h2 className="text-lg md:text-2xl font-semibold text-gold mb-6">
            A Bible-believing Church in Visakhapatnam
          </h2>

          <p className="text-xl md:text-2xl italic mb-2">
            &ldquo;Follow Me, and I will make you fishers of men.&rdquo;
          </p>

          <p className="text-sm md:text-base text-white/80 mb-9">Matthew 4:19</p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/sermons"
              className="inline-block bg-gold text-blue-950 px-8 py-4 rounded-lg font-bold hover:brightness-95 transition"
            >
              ▶ Watch Sermons
            </a>

            <a
              href="#contact"
              className="inline-block border-2 border-white/80 text-white px-8 py-4 rounded-lg font-bold hover:bg-white/10 transition"
            >
              Plan Your Visit
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
