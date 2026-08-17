import { Clock, Sparkles } from "lucide-react";
import { WEEKLY_SERVICES } from "@/data/services";

export default function ServiceTimes() {
  return (
    <section id="services" className="w-full bg-gray-50 py-20 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 text-blue-900">
            <Sparkles size={18} />
          </span>
          <span className="text-sm font-semibold tracking-widest text-blue-700 uppercase">
            Join Us
          </span>
        </div>

        <h2 className="text-center text-4xl md:text-5xl font-bold text-blue-900 mb-12">
          Weekly Services
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WEEKLY_SERVICES.map((service) => (
            <div
              key={service.title}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl border-t-4 border border-gray-100 p-6 transition hover:-translate-y-1"
              style={{ borderTopColor: service.color }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {service.title}
              </h3>

              <p className="font-semibold text-gray-700 mb-1">{service.day}</p>

              <p className="flex items-center gap-2 text-gray-600">
                <Clock size={16} />
                {service.time}
              </p>

              {service.note && (
                <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                  {service.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
