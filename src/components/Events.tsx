import { CalendarDays } from "lucide-react";
import { CHURCH_EVENTS } from "@/data/events";

export default function Events() {
  return (
    <section id="events" className="w-full bg-white py-20 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 text-blue-900">
            <CalendarDays size={18} />
          </span>
          <span className="text-sm font-semibold tracking-widest text-blue-700 uppercase">
            Mark Your Calendar
          </span>
        </div>

        <h2 className="text-center text-4xl md:text-5xl font-bold text-blue-900 mb-12">
          Church Calendar
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CHURCH_EVENTS.map((item, index) => {
            const [day, month, year] = item.date.split(" ");
            return (
              <div
                key={index}
                className="group bg-gray-50 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 p-6 flex flex-col items-center text-center transition hover:-translate-y-1"
              >
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-blue-900 text-white mb-4">
                  <span className="text-xl font-bold leading-none">{day}</span>
                  <span className="text-xs uppercase tracking-wide">{month}</span>
                </div>

                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {year}
                </p>

                <p className="font-semibold text-gray-900 leading-snug">
                  {item.event}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
