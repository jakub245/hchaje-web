import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Clock, MapPin, Trophy, Users } from "lucide-react";
import { PageHero, CtaStrip, bebas, inter } from "../components/shared";
import { TEAMS } from "../data/teams";

const DAY_ORDER = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];

type TrainingItem = {
  id: string;
  day: string;
  time: string;
  hall: string;
  section?: string;
  teamName: string;
  teamSlug: string;
};

type ApiTraining = Partial<TrainingItem>;

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

  const normalizeTeamSlug = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const filterToCurrentSeason = (items: TrainingItem[]): TrainingItem[] => {
    const byTeam = items.reduce((map, item) => {
      const slug = normalizeTeamSlug(item.teamSlug);
      const list = map.get(slug) || [];
      list.push(item);
      map.set(slug, list);
      return map;
    }, new Map<string, TrainingItem[]>());

    const getMaxYear = (s: string): number => {
      const fullYears = (s.match(/\b(20\d{2})\b/g) || []).map(Number);
      const shortYears = (s.match(/\/(\d{2})\b/g) || []).map((m) => 2000 + parseInt(m.slice(1), 10));
      const all = [...fullYears, ...shortYears];
      return all.length ? Math.max(...all) : 0;
    };

    const currentYear = new Date().getFullYear();
    const selected: TrainingItem[] = [];

    for (const teamItems of byTeam.values()) {
      const uniqueSections = [...new Set(teamItems.map((t) => t.section?.trim() || ""))].filter(Boolean);

      if (uniqueSections.length <= 1) {
        selected.push(...teamItems);
        continue;
      }

      const sortedSections = [...uniqueSections].sort((a, b) => getMaxYear(b) - getMaxYear(a));
      const currentSection = sortedSections.find((s) => getMaxYear(s) <= currentYear) ?? sortedSections[0];
      selected.push(...teamItems.filter((item) => (item.section?.trim() || "") === currentSection));
    }

    return selected;
  };

  const fallbackScheduleSlots: TrainingItem[] = allScheduleSlots.map((entry, index) => ({
    id: `fallback-${index}`,
    day: entry.day,
    time: entry.time,
    hall: entry.hall,
    section: entry.season,
    teamName: entry.team,
    teamSlug: entry.slug,
  }));

export default function TreninkyPage() {
  const [selectedPlace, setSelectedPlace] = useState<string>("all");
    const [scheduleSlots, setScheduleSlots] = useState<TrainingItem[]>(fallbackScheduleSlots);

    useEffect(() => {
      let active = true;

      const loadTrainings = async () => {
        try {
          const response = await fetch("/api/trainings");
          if (!response.ok) throw new Error("Nepodařilo se načíst data z API.");

          const payload = (await response.json()) as { trainings?: ApiTraining[] };
          const normalized = (payload.trainings ?? [])
            .map((item, index) => ({
              id: item.id || `notion-training-${index}`,
              day: item.day || "",
              time: item.time || "",
              hall: item.hall || "",
              section: item.section || "",
              teamName: item.teamName || "",
              teamSlug: normalizeTeamSlug(item.teamSlug || item.teamName || ""),
            }))
            .filter((item) => item.day && item.time && item.teamSlug);

          const filtered = filterToCurrentSeason(normalized);
          if (!active) return;

          if (filtered.length > 0) {
            setScheduleSlots(filtered);
            return;
          }

          setScheduleSlots(filterToCurrentSeason(fallbackScheduleSlots));
        } catch {
          if (!active) return;
          setScheduleSlots(filterToCurrentSeason(fallbackScheduleSlots));
        }
      };

      loadTrainings();

      return () => {
        active = false;
      };
    }, []);

    const placeOptions = Array.from(new Set(scheduleSlots.map((slot) => formatPlace(slot.hall))));

  const filteredScheduleByDay = DAY_ORDER.map((day) => ({
    day,
      slots: scheduleSlots.filter(
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
              <MapPin className="w-4 h-4 text-[#6EE76D]" />
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
                      key={slot.teamSlug + slot.day + slot.time + slot.hall + (slot.section ?? "")}
                      to={`/druzstva/${slot.teamSlug}`}
                      className="group block w-full rounded-2xl border border-[#6EE76D]/10 bg-[#0f180f] px-4 py-4 transition-all hover:border-[#6EE76D]/25 hover:bg-[#111c11]"
                    >
                      <div className="grid gap-3 md:gap-4 lg:grid-cols-[48px_minmax(220px,1.2fr)_minmax(160px,0.8fr)_minmax(220px,1fr)_28px] lg:items-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#6EE76D]/10 flex-shrink-0">
                          {slot.teamSlug === "zeny" ? <Trophy className="w-5 h-5 text-[#6EE76D]" /> : <Users className="w-5 h-5 text-[#6EE76D]" />}
                        </div>

                        <div className="min-w-0">
                          <div className="text-white text-[1.2rem] leading-none uppercase whitespace-pre-line" style={{ fontFamily: bebas }}>{slot.teamName}</div>
                          {slot.section && (
                            <div className="mt-2">
                              <span className="inline-flex rounded-full bg-[#F587B9]/12 px-3 py-1 text-[12px] uppercase tracking-[0.12em] text-[#FFC2DD]" style={{ fontFamily: bebas }}>
                                {slot.section}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 lg:contents">
                          <div>
                            <div className="mb-1 text-sm text-white/45" style={{ fontFamily: inter }}>Čas</div>
                            <div className="flex items-center gap-2 min-w-0" style={{ fontFamily: inter }}>
                              <Clock className="w-4 h-4 text-[#6EE76D] flex-shrink-0" />
                              <span className="text-white font-semibold text-[15px]">{slot.time}</span>
                            </div>
                          </div>

                          <div>
                            <div className="mb-1 text-sm text-white/45" style={{ fontFamily: inter }}>Místo</div>
                            <div className="flex items-center gap-2 min-w-0" style={{ fontFamily: inter }}>
                              <MapPin className="w-4 h-4 text-[#6EE76D] flex-shrink-0" />
                              <span className="text-white font-semibold text-[15px] leading-snug">{formatPlace(slot.hall)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end lg:justify-center text-[#8F988F] group-hover:text-[#6EE76D] group-hover:translate-x-1 transition-all">
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
