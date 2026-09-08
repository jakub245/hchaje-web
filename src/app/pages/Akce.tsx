import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Calendar, MapPin, Users } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { CtaStrip, PageHero, bebas, inter, nbspShortWords } from "../components/shared";
import { EventDateFilter, type EventDateFilterMode, isEventInDateFilter } from "../components/EventDateFilter";

type EventItem = {
  id: string;
  date: string;
  dateFrom?: string;
  dateTo?: string;
  dateNote?: string;
  title: string;
  location: string;
  teamSlug: string;
  teamName: string;
};

type ApiEvent = Partial<EventItem>;

const formatIsoDate = (value: string) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const czMatch = trimmed.match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\.?$/);
  if (czMatch) {
    const [, day, month, year] = czMatch;
    return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
  }

  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return trimmed;
  return d.toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const isClubEvent = (event: EventItem) => {
  const slug = normalizeText(event.teamSlug || "");
  const name = normalizeText(event.teamName || "");
  return slug.includes("klub") || name.includes("klub");
};

const parseCzDate = (value: string) => {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const clean = value.replace(/\s/g, "");

  // Extract first date if it's a range (e.g., "2.5.–3.5.2026" -> "2.5.")
  const firstDateMatch = clean.match(/^(\d{1,2}\.\d{1,2}\.(?:\d{4})?)/);
  const dateStr = firstDateMatch ? firstDateMatch[1] : clean;

  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const ts = new Date(dateStr).getTime();
    return Number.isFinite(ts) ? ts : Number.MAX_SAFE_INTEGER;
  }

  const parts = dateStr.split(".").filter(Boolean);
  const [day, month, yearStr] = parts;
  if (!day || !month) return Number.MAX_SAFE_INTEGER;

  // Use current year if not provided
  const year = yearStr ? Number(yearStr) : new Date().getFullYear();
  const ts = new Date(year, Number(month) - 1, Number(day)).getTime();
  return Number.isFinite(ts) ? ts : Number.MAX_SAFE_INTEGER;
};

const getEventSortTs = (event: EventItem) => {
  const source = event.dateFrom?.trim() || event.date?.trim() || event.dateTo?.trim() || "";
  return parseCzDate(source);
};

const getUpcomingEvents = (allEvents: EventItem[]): EventItem[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();

  return allEvents
    .filter((event) => getEventSortTs(event) >= todayTs)
    .sort((a, b) => getEventSortTs(a) - getEventSortTs(b));
};

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
  const [dateFilterMode, setDateFilterMode] = useState<EventDateFilterMode>("all");
  const [dateRange, setDateRange] = useState<DateRange>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadEvents = async () => {
      setEventsLoading(true);
      try {
        const response = await fetch("/api/events");
        if (!response.ok) throw new Error("Nepodařilo se načíst data z API.");

        const payload = (await response.json()) as { events?: ApiEvent[] };
        const normalized = (payload.events ?? [])
          .map((item, index) => {
            const teamName = (item.teamName ?? "Nezařazeno").trim();
            const directSlug = (item.teamSlug ?? "").trim();
            const teamSlug = directSlug || normalizeText(teamName);
            
            const from = item.dateFrom?.trim() || "";
            const to = item.dateTo?.trim() || "";
            const note = (item as any).dateNote?.trim() || "";

            let displayDate: string;
            if (note) {
              displayDate = note;
            } else if (from && to && from !== to) {
              displayDate = `${formatIsoDate(from)} – ${formatIsoDate(to)}`;
            } else if (from) {
              displayDate = formatIsoDate(from);
            } else if (to) {
              displayDate = formatIsoDate(to);
            } else if (item.date?.trim() && item.date.trim() !== "—") {
              displayDate = formatIsoDate(item.date.trim());
            } else {
              displayDate = "Brzy upřesníme";
            }

            return {
              id: item.id || `notion-${index}`,
              date: displayDate,
              dateFrom: item.dateFrom,
              dateTo: item.dateTo,
              dateNote: note,
              title: item.title || "Akce",
              location: item.location || "",
              teamSlug,
              teamName,
            };
          })
          .filter((item) => item.title)
          .sort((a, b) => getEventSortTs(a) - getEventSortTs(b));

        if (!active) return;

        setEvents(normalized);

        setEventsLoading(false);
      } catch {
        if (!active) return;
        setEvents([]);
        setEventsLoading(false);
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

  const teamFilteredEvents = selectedTeam === "all"
    ? events
    : events.filter((event) => event.teamSlug === selectedTeam || isClubEvent(event));

  const filteredEvents = useMemo(() => {
    const upcoming = getUpcomingEvents(teamFilteredEvents);
    return upcoming.filter((event) => isEventInDateFilter(getEventSortTs(event), dateFilterMode, dateRange));
  }, [teamFilteredEvents, dateFilterMode, dateRange]);

  return (
    <>
      <PageHero
        title="Akce"
        subtitle="Kalendář akcí napříč družstvy. Můžeš filtrovat podle konkrétního týmu."
      />

      <section className="reveal-on-scroll pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            {eventsLoading ? (
              <div className="flex flex-wrap gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={`skeleton-filter-${i}`} className={`h-9 rounded-full bg-[#6EE76D]/10 animate-pulse ${i === 0 ? "w-36" : i === 1 ? "w-20" : i === 2 ? "w-28" : i === 3 ? "w-24" : "w-32"}`} />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-white/80 mb-4" style={{ fontFamily: bebas }}>
                  <Users className="w-4 h-4 text-[#6EE76D] shrink-0" />
                  <span className="leading-none">Filtrovat podle družstva</span>
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

                <EventDateFilter
                  mode={dateFilterMode}
                  onModeChange={setDateFilterMode}
                  range={dateRange}
                  onRangeChange={setDateRange}
                />
              </>
            )}

            {eventsLoading && (
              <div className="rounded-2xl bg-[#6EE76D]/5 border border-[#6EE76D]/20 px-4 py-3 mt-4 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-[#6EE76D] animate-pulse" />
                <p className="text-[#6EE76D] text-sm" style={{ fontFamily: inter }}>Načítám aktuální data...</p>
              </div>
            )}
          </div>

          {eventsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={`skeleton-event-${i}`} className={`grid gap-3 md:grid-cols-[1fr_1.2fr_1.2fr_1fr] py-5 animate-pulse ${i !== 0 ? "border-t border-[#6EE76D]/15" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#6EE76D]/10 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 bg-[#6EE76D]/10 rounded w-20 mb-2" />
                      <div className="h-5 bg-[#6EE76D]/10 rounded w-16" />
                    </div>
                  </div>
                  <div className="hidden md:block h-5 bg-[#6EE76D]/10 rounded w-3/4 self-center" />
                  <div className="hidden md:block h-5 bg-[#6EE76D]/10 rounded w-1/2 self-center" />
                  <div className="hidden md:block h-5 bg-[#6EE76D]/10 rounded w-2/3 self-center" />
                </div>
              ))}
            </div>
          ) : filteredEvents.length ? (
            <div className="px-0">
              <div className="hidden md:grid grid-cols-[1fr_1.2fr_1.2fr_1fr] gap-6 pb-3 text-white/45 text-sm" style={{ fontFamily: inter }}>
                <div>Datum</div>
                <div>Akce</div>
                <div>Družstvo</div>
                <div>Místo</div>
              </div>

              <div>
                {filteredEvents.map((event, i) => (
                  <div key={event.id} className={`grid gap-3 md:grid-cols-[1fr_1.2fr_1.2fr_1fr] md:items-center py-5 ${i !== 0 ? "border-t border-[#6EE76D]/15" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className="mobile-solid-chip w-10 h-10 rounded-2xl bg-[#6EE76D]/14 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-[#6EE76D]" />
                      </div>
                      <div>
                        <div className="text-sm md:hidden" style={{ fontFamily: inter, color: "rgb(255 255 255 / 0.46)" }}>Datum</div>
                        <div className="text-white text-[1.2rem] whitespace-pre-line" style={{ fontFamily: bebas }}>{event.date}</div>
                      </div>
                    </div>

                    <div className="pl-[3.25rem] md:hidden">
                      <div className="text-sm md:hidden mb-1" style={{ fontFamily: inter, color: "rgb(255 255 255 / 0.46)" }}>Akce</div>
                      <div className="text-base whitespace-pre-line" style={{ fontFamily: inter, color: "#FFFFFF", fontWeight: 600 }}>{nbspShortWords(event.title)}</div>
                    </div>

                    <div className="pl-[3.25rem] md:hidden">
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

                    <div className="pl-[3.25rem] md:hidden flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#6EE76D] mt-1 md:mt-0 flex-shrink-0" />
                      <div>
                        <div className="text-sm md:hidden mb-1" style={{ fontFamily: inter, color: "rgb(255 255 255 / 0.46)" }}>Místo</div>
                        <div className="text-base whitespace-pre-line" style={{ fontFamily: inter, color: "#FFFFFF", fontWeight: 600 }}>{nbspShortWords(event.location || "—")}</div>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center">
                      <div className="text-base whitespace-pre-line" style={{ fontFamily: inter, color: "#FFFFFF", fontWeight: 600 }}>{nbspShortWords(event.title)}</div>
                    </div>

                    <div className="hidden md:flex items-center">
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

                    <div className="hidden md:flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#6EE76D] flex-shrink-0" />
                      <div className="text-base whitespace-pre-line" style={{ fontFamily: inter, color: "#FFFFFF", fontWeight: 600 }}>{nbspShortWords(event.location || "—")}</div>
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
