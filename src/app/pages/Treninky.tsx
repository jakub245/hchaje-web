import { Clock, Calendar, MapPin, Users, Trophy } from "lucide-react";
import { PageHero, Btn, CtaStrip, SectionLabel, bebas, inter } from "../components/shared";

const SCHEDULE = [
  { day: "Pondělí", slots: [
    { time: "16:00 – 17:30", team: "Přípravka", hall: "Sportovní hala Háje" },
    { time: "17:45 – 19:15", team: "Mladší žákyně", hall: "Sportovní hala Háje" },
  ]},
  { day: "Úterý", slots: [
    { time: "16:00 – 17:30", team: "Starší žákyně", hall: "Sportovní hala Háje" },
    { time: "18:00 – 19:30", team: "A-tým ženy", hall: "Sportovní hala Háje" },
  ]},
  { day: "Středa", slots: [
    { time: "16:00 – 17:30", team: "Přípravka", hall: "Sportovní hala Háje" },
    { time: "17:45 – 19:15", team: "Mladší žákyně", hall: "Sportovní hala Háje" },
    { time: "19:30 – 21:00", team: "A-tým ženy", hall: "Sportovní hala Háje" },
  ]},
  { day: "Čtvrtek", slots: [
    { time: "17:00 – 18:30", team: "Starší žákyně", hall: "Sportovní hala Háje" },
    { time: "19:00 – 20:30", team: "A-tým ženy", hall: "Sportovní hala Háje" },
  ]},
  { day: "Pátek", slots: [
    { time: "16:00 – 17:30", team: "Přípravka", hall: "Sportovní hala Háje" },
    { time: "17:45 – 19:15", team: "Mladší žákyně", hall: "Sportovní hala Háje" },
  ]},
];

export default function TreninkyPage() {
  return (
    <>
      <PageHero title="Tréninky" subtitle="Kompletní rozvrh tréninků pro všechna družstva. Tréninky probíhají ve Sportovní hale Háje." />

      <section className="reveal-on-scroll pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Info bar */}
          <div className="flex flex-wrap gap-6 mb-12 p-6 rounded-2xl bg-[#0e160e] border border-[#6EE76D]/10">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#6EE76D]" />
              <span className="text-white/60" style={{ fontFamily: inter }}>Sportovní hala Háje, Novomeského 1, Praha 4</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#6EE76D]" />
              <span className="text-white/60" style={{ fontFamily: inter }}>Sezóna 2025/2026</span>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-8">
            {SCHEDULE.map((day) => (
              <div key={day.day}>
                <h3 className="text-2xl text-white uppercase mb-4 flex items-center gap-3" style={{ fontFamily: bebas }}>
                  <div className="w-3 h-3 rounded-full bg-[#6EE76D]" />
                  {day.day}
                </h3>
                <div className="space-y-2">
                  {day.slots.map((slot, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[#0e160e] border border-[#6EE76D]/8 hover:border-[#6EE76D]/20 transition-all">
                      <div className="w-10 h-10 rounded-full bg-[#6EE76D]/10 flex items-center justify-center flex-shrink-0">
                        {slot.team === "A-tým ženy" ? <Trophy className="w-5 h-5 text-[#6EE76D]" /> : <Users className="w-5 h-5 text-[#6EE76D]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-white" style={{ fontFamily: inter }}>{slot.team}</span>
                        <div className="flex items-center gap-3 text-sm text-white/35 mt-0.5">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {slot.time}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {slot.hall}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaStrip />
    </>
  );
}
