import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Clock, MapPin, Trophy, Users } from "lucide-react";
import { PageHero, CtaStrip, bebas, inter } from "../components/shared";
import { TEAMS } from "../data/teams";

const DAY_ORDER = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];

function normalizePlace(place: string) {
  return place.trim().toLowerCase();
}

function formatPlace(place: string) {
  const normalized = normalizePlace(place);

  if (normalized === "hřiště" || normalized === "areál tj háje" || normalized === "areál tj háje, k jezeru") {
    return "Areál TJ Háje";
  }

  if (normalized === "hala tj jm chodov") {
    return "Hala TJ JM Chodov";
  }

  if (normalized === "tělocvišna zš k milíčovu" || normalized === "tělocvična zš k milíčovu") {
    return "Tělocvična ZŠ K Milíčovu";
  }

  if (normalized === "tělocvišna zš mendelova" || normalized === "tělocvična zš mendelova") {
    return "Tělocvična ZŠ Mendelova";
  }

  return place.trim();
}

const allScheduleSlots = Array.from(
  new Map(
    TEAMS.flatMap((team) => {
      const entries = team.trainingSections?.length
        ? team.trainingSections.flatMap((section) =>
            section.items.map((training) => ({
              ...training,
              team: team.name,
              slug: team.slug,
              season: section.title,
            })),
          )
        : team.trainings.map((training) => ({
            ...training,
            team: team.name,
            slug: team.slug,
            season: undefined,
          }));

      return entries.map((entry) => [`${entry.slug}-${entry.day}-${entry.time}-${entry.hall}-${entry.season ?? ""}`, entry] as const);
    }),
  ).values(),
);

const placeOptions = Array.from(new Set(allScheduleSlots.map((slot) => formatPlace(slot.hall))));

export default function TreninkyPage() {
  const [selectedPlace, setSelectedPlace] = useState<string>("all");

  const filteredScheduleByDay = DAY_ORDER.map((day) => ({
    day,
    slots: allScheduleSlots.filter(
      (slot) => slot.day === day && (selectedPlace === "all" || normalizePlace(formatPlace(slot.hall)) === selectedPlace),
    ),
  })).filter((item) => item.slots.length > 0);

  return (
    <>
      <PageHero
        title="Tréninky"
        subtitle="Přehled tréninků napříč všemi družstvy. Tréninky probíhají na více místech podle kategorie i části sezóny."
      />

      <section className="reveal-on-scroll pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-white/80 mb-4" style={{ fontFamily: bebas }}>
              <MapPin className="w-4 h-4 text-[#F587B9]" />
              Filtrovat podle místa
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedPlace("all")}
                className={`rounded-full border px-4 py-2 text-sm transition-all ${selectedPlace === "all" ? "border-[#F587B9] bg-[#F587B9]/12 text-white shadow-[0_0_18px_rgba(245,135,185,0.12)]" : "border-white/10 text-white/70 hover:border-[#F587B9]/40 hover:text-white"}`}
                style={{ fontFamily: inter }}
              >
                Všechna místa
              </button>

              {placeOptions.map((place) => {
                const isActive = selectedPlace === normalizePlace(place);
                return (
                  <button
                    key={place}
                    onClick={() => setSelectedPlace(normalizePlace(place))}
                    className={`rounded-full border px-4 py-2 text-sm transition-all ${isActive ? "border-[#F587B9] bg-[#F587B9]/12 text-white shadow-[0_0_18px_rgba(245,135,185,0.12)]" : "border-white/10 text-white/70 hover:border-[#F587B9]/40 hover:text-white"}`}
                    style={{ fontFamily: inter }}
                  >
                    {place}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-8">
            {filteredScheduleByDay.map((day) => (
              <div key={day.day}>
                <h3 className="text-2xl text-white uppercase mb-4 flex items-center gap-3" style={{ fontFamily: bebas }}>
                  <div className="w-3 h-3 rounded-full bg-[#6EE76D]" />
                  {day.day}
                </h3>
                <div className="space-y-3">
                  {day.slots.map((slot) => (
                    <Link
                      key={slot.slug + slot.day + slot.time + slot.hall + (slot.season ?? "")}
                      to={`/druzstva/${slot.slug}`}
                      className="group block w-full rounded-2xl border border-[#6EE76D]/10 bg-[#0f180f] px-4 py-4 transition-all hover:border-[#6EE76D]/25 hover:bg-[#111c11]"
                    >
                      <div className="grid gap-3 md:gap-4 lg:grid-cols-[48px_minmax(220px,1.2fr)_minmax(160px,0.8fr)_minmax(220px,1fr)_28px] lg:items-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#6EE76D]/10 flex-shrink-0">
                          {slot.slug === "zeny" ? <Trophy className="w-5 h-5 text-[#6EE76D]" /> : <Users className="w-5 h-5 text-[#6EE76D]" />}
                        </div>

                        <div className="min-w-0">
                          <div className="text-white text-[16px] leading-tight" style={{ fontFamily: inter }}>{slot.team}</div>
                          {slot.season && (
                            <div className="mt-2">
                              <span className="inline-flex rounded-full border border-[#6EE76D]/20 bg-[#6EE76D]/8 px-2.5 py-1 text-[11px] text-white/75" style={{ fontFamily: inter }}>
                                {slot.season}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm min-w-0" style={{ fontFamily: inter }}>
                          <Clock className="w-4 h-4 text-[#6EE76D] flex-shrink-0" />
                          <span className="text-white">{slot.time}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm min-w-0" style={{ fontFamily: inter }}>
                          <MapPin className="w-4 h-4 text-[#6EE76D] flex-shrink-0" />
                          <span className="text-white truncate">{formatPlace(slot.hall)}</span>
                        </div>

                        <div className="flex items-center justify-end text-[#8F988F] group-hover:text-[#6EE76D] group-hover:translate-x-1 transition-all">
                          <ArrowRight className="w-5 h-5" />
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
