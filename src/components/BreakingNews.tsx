import { NEWS_MESSAGE } from "@/data/events";

export default function BreakingNews() {
  return (
    <div className="w-full bg-blue-950 text-white flex items-stretch overflow-hidden">
      <div className="flex items-center gap-2 bg-gold text-blue-950 font-bold px-5 py-2 whitespace-nowrap shrink-0 z-10">
        Upcoming
      </div>

      <div className="border-l-2 border-dashed border-gold/60 shrink-0" />

      <div className="relative flex-1 overflow-hidden py-2 pl-6">
        <div className="flex w-max animate-marquee gap-16 whitespace-nowrap">
          {[0, 1].map((index) => (
            <span key={index} className="px-2 text-sm sm:text-base">
              {NEWS_MESSAGE}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
