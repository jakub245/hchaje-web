import { Link } from "react-router";
import { Clock, Calendar, MapPin, Users, Trophy } from "lucide-react";
import { PageHero, CtaStrip, bebas, inter } from "../components/shared";
import { TEAMS } from "../data/teams";

const DAY_ORDER = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];

const scheduleByDay = DAY_ORDER.map((day) => ({
  day,
  slots: TEAMS.flatMap((team) =>
    team.trainings
      .filter((training) => training.day === day)
      .map((training) => ({
        ...training,
        team: team.name,
        slug: team.slug,
      })),
  ),
})).filter((item) => item.slots.length > 0);

const totalTrainings = scheduleByDay.reduce((sum, day) => sum + day.slots.length, 0);
const totalTeams = new Set(scheduleByDay.flatMap((day) => day.slots.map((slot) => slot.team))).size;
const totalHalls = new Set(scheduleByDay.flatMap((day) => day.slots.map((slot) => slot.hall))).size;

export default function TreninkyPage() {
  return (
    <>
      <PageHero
        title="Tréninky"
        subtitle="Rozpis se načítá přímo z jednotlivých družstev, takže změny času nebo místa se propíšou automaticky i sem."
      />

      <section className="reveal-on-scroll pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-6 mb-12 p-6 rounded-2xl bg-[#0e160e] border border-[#6EE76D]/10">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-[#6EE76D]" />
              <span className="text-white/60" style={{ fontFamily: inter }}>{totalTeams} družstev</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#6EE76D]" />
              <span className="text-white/60" style={{ fontFamily: inter }}>{totalTrainings} tréninků týdně</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#6EE76D]" />
              <span className="text-white/60" style={{ fontFamily: inter }}>{totalHalls} tréninková místa</span>
            </div>
          </div>

          <div className="space-y-8">
            {scheduleByDay.map((day) => (
              <div key={day.day}>
                <h3 className="text-2xl text-white uppercase mb-4 flex items-center gap-3" style={{ fontFamily: bebas }}>
                  <div className="w-3 h-3 rounded-full bg-[#6EE76D]" />
                  {day.day}
                </h3>
                <div className="space-y-2">
                  {day.slots.map((slot) => (
                    <Link
                      key={slot.slug + slot.day + slot.time}
                      to={`/druzstva/${slot.slug}`}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-[#0e160e] border border-[#6EE76D]/8 hover:border-[#6EE76D]/20 hover:bg-[#111c11] transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#6EE76D]/10 flex items-center justify-center flex-shrink-0">
                        {slot.slug === "zeny" ? <Trophy className="w-5 h-5 text-[#6EE76D]" /> : <Users className="w-5 h-5 text-[#6EE76D]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-white" style={{ fontFamily: inter }}>{slot.team}</span>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-white/45 mt-0.5">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {slot.time}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {slot.hall}</span>
                        </div>
                      </div>
                    </Link>
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
