import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Calendar, MapPin } from "lucide-react";
import { CtaStrip, PageHero, bebas, inter, nbspShortWords } from "../components/shared";
import { TEAMS } from "../data/teams";

type EventItem = {
  id: string;
  date: string;
  title: string;
  location: string;
  teamSlug: string;
  teamName: string;
};

type ApiEvent = Partial<EventItem>;

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const parseCzDate = (value: string) => {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const clean = value.replace(/\s/g, "");

  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    return new Date(clean).getTime();
  }

  const [day, month, year] = clean.split(".").filter(Boolean);
  if (!day || !month || !year) return Number.MAX_SAFE_INTEGER;

  return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
};

const fallbackEvents: EventItem[] = TEAMS.flatMap((team) =>
  (team.events ?? []).map((event, index) => ({
    id: `${team.slug}-${index}-${event.date}-${event.title}`,
    date: event.date,
    title: event.title,
    location: event.location,
    teamSlug: team.slug,
    teamName: team.name,
  })),
).sort((a, b) => parseCzDate(a.date) - parseCzDate(b.date));

const teamSlugSet = new Set(TEAMS.map((team) => team.slug));
const teamNameToSlug = new Map(TEAMS.map((team) => [normalizeText(team.name), team.slug] as const));
const teamOrder = new Map([
  ["pripravka", 0],
  ["mini-zakyne", 1],
  ["mladsi-zakyne", 2],
  ["starsi-zakyne", 3],
  ["mladsi-dorostenky", 4],
  ["starsi-dorostenky", 5],
  ["zeny", 6],
]);

export default function AkcePage() {
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [events, setEvents] = useState<EventItem[]>(fallbackEvents);
  const [source, setSource] = useState<"notion" | "fallback">("fallback");

  useEffect(() => {
    let active = true;

    const loadEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) throw new Error("Nepodařilo se načíst data z API.");

        const payload = (await response.json()) as { events?: ApiEvent[] };
        const normalized = (payload.events ?? [])
          .map((item, index) => {
            const teamName = (item.teamName ?? "Nezařazeno").trim();
            const directSlug = (item.teamSlug ?? "").trim();
            const mappedSlug = teamNameToSlug.get(normalizeText(teamName));
            const teamSlug = teamSlugSet.has(directSlug) ? directSlug : mappedSlug ?? directSlug ?? "";

            return {
              id: item.id || `notion-${index}`,
              date: item.date || "—",
              title: item.title || "Akce",
              location: item.location || "",
              teamSlug,
              teamName,
            };
          })
          .filter((item) => item.title)
          .sort((a, b) => parseCzDate(a.date) - parseCzDate(b.date));

        if (!active || normalized.length === 0) return;
        setEvents(normalized);
        setSource("notion");
      } catch {
        if (!active) return;
        setEvents(fallbackEvents);
        setSource("fallback");
      }
    };

    loadEvents();

    return () => {
      active = false;
    };
  }, []);

  const teamOptions = useMemo(() => {
    const bySlug = new Map<string, string>();
    events.forEach((event) => {
      if (!event.teamSlug || !event.teamName) return;
      if (!bySlug.has(event.teamSlug)) bySlug.set(event.teamSlug, event.teamName);
    });

    return Array.from(bySlug.entries())
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => {
        const aOrder = teamOrder.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
        const bOrder = teamOrder.get(b.slug) ?? Number.MAX_SAFE_INTEGER;

        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.name.localeCompare(b.name, "cs");
      });
  }, [events]);

  const filteredEvents = selectedTeam === "all"
    ? events
    : events.filter((event) => event.teamSlug === selectedTeam);

  return (
    <>
      <PageHero
        title="Akce"
        subtitle="Kalendář akcí napříč družstvy. Můžeš filtrovat podle konkrétního týmu."
      />

      <section className="reveal-on-scroll pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-white/80 mb-4" style={{ fontFamily: bebas }}>
              <Calendar className="w-4 h-4 text-[#6EE76D]" />
              Filtrovat podle družstva
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedTeam("all")}
                className={`rounded-full border px-4 py-2 text-sm transition-all ${selectedTeam === "all" ? "border-[#F587B9] bg-[#F587B9]/12 text-white shadow-[0_0_18px_rgba(245,135,185,0.12)]" : "border-white/10 text-white/70 hover:border-[#F587B9]/40 hover:text-white"}`}
                style={{ fontFamily: inter }}
              >
                Všechna družstva
              </button>

              {teamOptions.map((team) => {
                const isActive = selectedTeam === team.slug;
                return (
                  <button
                    key={team.slug}
                    onClick={() => setSelectedTeam(team.slug)}
                    className={`rounded-full border px-4 py-2 text-sm transition-all ${isActive ? "border-[#F587B9] bg-[#F587B9]/12 text-white shadow-[0_0_18px_rgba(245,135,185,0.12)]" : "border-white/10 text-white/70 hover:border-[#F587B9]/40 hover:text-white"}`}
                    style={{ fontFamily: inter }}
                  >
                    {team.name}
                  </button>
                );
              })}
            </div>

            {source === "fallback" && (
              <p className="mt-4 text-white/45 text-sm" style={{ fontFamily: inter }}>
                {nbspShortWords("Aktuálně se zobrazují záložní data z webu. Po připojení Notion databáze se načtou živé akce.")}
              </p>
            )}
          </div>

          {filteredEvents.length ? (
            <div className="px-0">
              <div className="hidden md:grid grid-cols-[1fr_1.2fr_1.2fr_1fr] gap-6 pb-3 text-white/45 text-sm" style={{ fontFamily: inter }}>
                <div>Datum</div>
                <div>Akce</div>
                <div>Družstvo</div>
                <div>Místo</div>
              </div>

              <div>
                {filteredEvents.map((event, i) => (
                  <div key={event.id} className={`grid gap-3 md:grid-cols-[1fr_1.2fr_1.2fr_1fr] py-5 ${i !== 0 ? "border-t border-[#6EE76D]/15" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className="mobile-solid-chip w-10 h-10 rounded-2xl bg-[#6EE76D]/14 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-[#6EE76D]" />
                      </div>
                      <div>
                        <div className="text-sm md:hidden" style={{ fontFamily: inter, color: "rgb(255 255 255 / 0.46)" }}>Datum</div>
                        <div className="text-white text-[1.2rem] whitespace-pre-line" style={{ fontFamily: bebas }}>{event.date}</div>
                      </div>
                    </div>

                    <div className="pl-[3.25rem] md:pl-0">
                      <div className="text-sm md:hidden mb-1" style={{ fontFamily: inter, color: "rgb(255 255 255 / 0.46)" }}>Akce</div>
                      <div className="text-base whitespace-pre-line" style={{ fontFamily: inter, color: "#FFFFFF", fontWeight: 600 }}>{nbspShortWords(event.title)}</div>
                    </div>

                    <div className="pl-[3.25rem] md:pl-0">
                      <div className="text-sm md:hidden mb-1" style={{ fontFamily: inter, color: "rgb(255 255 255 / 0.46)" }}>Družstvo</div>
                      <div className="text-base whitespace-pre-line" style={{ fontFamily: inter, color: "#FFFFFF", fontWeight: 600 }}>
                        {event.teamSlug ? (
                          <Link to={`/druzstva/${event.teamSlug}`} className="hover:text-[#6EE76D] hover:underline transition-colors">
                            {event.teamName}
                          </Link>
                        ) : (
                          event.teamName
                        )}
                      </div>
                    </div>

                    <div className="pl-[3.25rem] md:pl-0 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#6EE76D] mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-sm md:hidden mb-1" style={{ fontFamily: inter, color: "rgb(255 255 255 / 0.46)" }}>Místo</div>
                        <div className="text-base whitespace-pre-line" style={{ fontFamily: inter, color: "#FFFFFF", fontWeight: 600 }}>{nbspShortWords(event.location || "—")}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-[#6EE76D]/8 bg-[#0e160e] p-8 text-white/70" style={{ fontFamily: inter }}>
              V tomto filtru zatím nejsou žádné akce.
            </div>
          )}
        </div>
      </section>

      <CtaStrip />
    </>
  );
}
