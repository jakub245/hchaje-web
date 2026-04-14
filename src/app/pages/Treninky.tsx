import { useState } from "react";
import { Link } from "react-router";
import { Clock, MapPin, Users, Trophy } from "lucide-react";
import { PageHero, CtaStrip, bebas, inter } from "../components/shared";
import { TEAMS } from "../data/teams";

const DAY_ORDER = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];
const FIELD_ADDRESS = "Areál TJ Háje, K Jezeru";

function normalizePlace(place: string) {
  return place.trim().toLowerCase();
}

function formatPlace(place: string) {
  return normalizePlace(place) === "hřiště" ? "Hřiště" : place;
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

const placeOptions = Array.from(new Set(allScheduleSlots.map((slot) => slot.hall)));

export default function TreninkyPage() {
  const [selectedPlace, setSelectedPlace] = useState<string>("all");

  const filteredScheduleByDay = DAY_ORDER.map((day) => ({
    day,
    slots: allScheduleSlots.filter(
      (slot) => slot.day === day && (selectedPlace === "all" || normalizePlace(slot.hall) === selectedPlace),
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
          <div className="mb-12 rounded-2xl bg-[#0e160e] border border-[#6EE76D]/10 p-6">
            <div className="flex items-center gap-2 text-white mb-4" style={{ fontFamily: bebas }}>
              <MapPin className="w-4 h-4 text-[#6EE76D]" />
              Filtrovat podle místa
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedPlace("all")}
                className={`rounded-full border px-4 py-2 text-sm transition-all ${selectedPlace === "all" ? "border-[#6EE76D] bg-[#6EE76D]/12 text-white" : "border-white/10 bg-[#091109] text-white/70 hover:border-[#6EE76D]/30 hover:text-white"}`}
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
                    className={`rounded-full border px-4 py-2 text-sm transition-all ${isActive ? "border-[#6EE76D] bg-[#6EE76D]/12 text-white" : "border-white/10 bg-[#091109] text-white/70 hover:border-[#6EE76D]/30 hover:text-white"}`}
                    style={{ fontFamily: inter }}
                  >
                    {formatPlace(place)}
                  </button>
                );
              })}
            </div>

            {(selectedPlace === normalizePlace("hřiště") || selectedPlace === "all") && (
              <div className="mt-4 text-sm text-white/55" style={{ fontFamily: inter }}>
                Hřiště: <span className="text-white/80">{FIELD_ADDRESS}</span>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {filteredScheduleByDay.map((day) => (
              <div key={day.day}>
                <h3 className="text-2xl text-white uppercase mb-4 flex items-center gap-3" style={{ fontFamily: bebas }}>
                  <div className="w-3 h-3 rounded-full bg-[#6EE76D]" />
                  {day.day}
                </h3>
                <div className="space-y-2">
                  {day.slots.map((slot) => (
                    <Link
                      key={slot.slug + slot.day + slot.time + slot.hall + (slot.season ?? "")}
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
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {formatPlace(slot.hall)}</span>
                        </div>
                        {normalizePlace(slot.hall) === normalizePlace("hřiště") && (
                          <div className="text-xs text-white/45 mt-1" style={{ fontFamily: inter }}>{FIELD_ADDRESS}</div>
                        )}
                        {slot.season && (
                          <div className="mt-2">
                            <span className="inline-flex rounded-full border border-[#6EE76D]/20 bg-[#6EE76D]/8 px-2.5 py-1 text-[11px] text-white/75" style={{ fontFamily: inter }}>
                              {slot.season}
                            </span>
                          </div>
                        )}
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
