import { useState, useEffect, useRef } from "react";
import { useParams, Link, Navigate } from "react-router";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
} from "lucide-react";
import { bebas, inter, CtaStrip, NewsCard, nbspShortWords } from "../components/shared";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { getTeamBySlug, TEAMS } from "../data/teams";

type EventItem = {
  id: string;
  date: string;
  title: string;
  location: string;
  teamSlug: string;
  teamName: string;
};

type ApiEvent = Partial<EventItem>;

type CoachItem = {
  id: string;
  name: string;
  position: string;
  teamName: string;
  teamSlug: string;
  phone: string;
  email: string;
};

type ApiCoach = Partial<CoachItem>;

const SECTIONS = [
  { id: "prehled", label: "Přehled" },
  { id: "treninky", label: "Tréninky" },
  { id: "akce", label: "Akce" },
  { id: "hracky", label: "Hráčky" },
  { id: "treneri", label: "Trenéři" },
  { id: "aktuality", label: "Aktuality" },
];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

export default function DruzstvoDetail() {
  const { slug } = useParams();
  const team = getTeamBySlug(slug || "");
  const [active, setActive] = useState("prehled");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [coaches, setCoaches] = useState<CoachItem[]>([]);
  const [coachesLoaded, setCoachesLoaded] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const playersScrollRef = useRef<HTMLDivElement | null>(null);
  const newsScrollRef = useRef<HTMLDivElement | null>(null);

  const teamPlayerPhotos = import.meta.glob("../../imports/foto/**/*.{jpg,jpeg,png}", { eager: true, as: "url" }) as Record<string, string>;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    SECTIONS.forEach((s) => {
      const el = sectionRefs.current[s.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [team]);

  if (!team) return <Navigate to="/druzstva" replace />;

  const parseCzDate = (date: string) => {
    const [day, month, year] = date.split(".").map((value) => parseInt(value.trim(), 10));
    return new Date(year, month - 1, day).getTime();
  };

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isMiniTeam = team.slug === "mini-zakyne";
  const playerMetaLabel = isMiniTeam || team.slug === "pripravka" ? "Ročník" : "Post";

  const scrollPlayers = (direction: number) => {
    playersScrollRef.current?.scrollBy({ left: direction * 900, behavior: "smooth" });
  };

  const scrollNews = (direction: number) => {
    newsScrollRef.current?.scrollBy({ left: direction * 900, behavior: "smooth" });
  };

  const getTeamPhoto = (name: string) => {
    const currentTeamSlug = normalizeText(team.slug);
    const normalizedName = normalizeText(name);
    const parts = name.split(/\s+/).map(normalizeText).filter(Boolean);
    const reversedName = [...parts].reverse().join("");

    const candidates = Object.entries(teamPlayerPhotos)
      .filter(([path]) => normalizeText(path).includes(currentTeamSlug))
      .map(([path, url]) => {
        const fileName = path.split("/").pop()?.replace(/\.(jpg|jpeg|png)$/i, "") || "";
        return { baseName: normalizeText(fileName), url };
      });

    const exactMatch = candidates.find(
      (candidate) => candidate.baseName === normalizedName || candidate.baseName === reversedName
    );
    if (exactMatch) return exactMatch.url;

    const surname = parts[0] || "";
    const surnameMatches = candidates.filter((candidate) => candidate.baseName.startsWith(surname));
    if (surnameMatches.length === 1) return surnameMatches[0].url;

    return "";
  };

  useEffect(() => {
    let activeRequest = true;

    const loadTeamEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) throw new Error("Nepodařilo se načíst data z API.");

        const payload = (await response.json()) as { events?: ApiEvent[] };
        const normalizedEvents = (payload.events ?? [])
          .map((item, index) => {
            const teamName = (item.teamName ?? "Nezařazeno").trim();
            const teamSlug = (item.teamSlug ?? "").trim();

            return {
              id: item.id || `notion-${index}`,
              date: item.date || "—",
              title: item.title || "Akce",
              location: item.location || "",
              teamSlug,
              teamName,
            };
          })
          .filter((item) => {
            const normalizedTeamName = normalizeText(item.teamName);
            return item.teamSlug === team.slug || normalizedTeamName.includes(normalizeText(team.name));
          })
          .sort((a, b) => parseCzDate(a.date) - parseCzDate(b.date));

        if (!activeRequest) return;
        setEvents(normalizedEvents);
        setEventsLoaded(true);
      } catch {
        if (!activeRequest) return;
        setEvents([]);
        setEventsLoaded(true);
      }
    };

    loadTeamEvents();

    return () => {
      activeRequest = false;
    };
  }, [team.name, team.slug]);

  useEffect(() => {
    let activeRequest = true;

    const loadTeamCoaches = async () => {
      try {
        const response = await fetch("/api/coaches");
        if (!response.ok) throw new Error("Nepodařilo se načíst data z API.");

        const payload = (await response.json()) as { coaches?: ApiCoach[] };
        const normalizedCoaches = (payload.coaches ?? [])
          .map((item, index) => ({
            id: item.id || `notion-coach-${index}`,
            name: item.name || "",
            position: item.position || "",
            teamName: item.teamName || "",
            teamSlug: item.teamSlug || "",
            phone: item.phone || "",
            email: item.email || "",
          }))
          .filter((item) => item.teamSlug === team.slug)
          .sort((a, b) => {
            const aIsHead = normalizeText(a.position).includes("hlavni") ? 0 : 1;
            const bIsHead = normalizeText(b.position).includes("hlavni") ? 0 : 1;
            return aIsHead - bIsHead;
          });

        if (!activeRequest) return;
        setCoaches(normalizedCoaches);
        setCoachesLoaded(true);
      } catch {
        if (!activeRequest) return;
        setCoaches([]);
        setCoachesLoaded(true);
      }
    };

    loadTeamCoaches();

    return () => {
      activeRequest = false;
    };
  }, [team.slug]);

  const newsSorted = [...team.news].sort((a, b) => parseCzDate(b.date) - parseCzDate(a.date));
  const trainingBlocks = team.trainingSections ?? [];
  const trainingCount = trainingBlocks[0]?.items.length || team.trainings.length;

  const displayedEvents = eventsLoaded
    ? events.map((event: EventItem) => ({
        date: event.date,
        title: event.title,
        location: event.location,
      }))
    : (team.events ?? []).map((event) => ({
        date: event.date,
        title: event.title,
        location: event.location,
      }));
  const displayedStaff = coachesLoaded && coaches.length > 0
    ? coaches.map((c: CoachItem) => ({ name: c.name, phone: c.phone, email: c.email }))
    : [
        { name: team.coach, phone: "", email: "" },
        ...(team.assistantCoach ? [{ name: team.assistantCoach, phone: "", email: "" }] : []),
      ];
  const displayedNews = newsSorted;

  return (
    <>
      <section className="relative pt-24 pb-10 lg:pt-32 lg:pb-14">
        <div className="absolute inset-0">
          <ImageWithFallback src={team.img} alt={team.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080C08] via-[#080C08]/90 to-[#080C08]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080C08] via-transparent to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/druzstva" className="inline-flex items-center gap-2 text-white/40 hover:text-[#6EE76D] transition-colors mb-6 text-sm" style={{ fontFamily: inter }}>
            <ArrowLeft className="w-4 h-4" /> Zpět na družstva
          </Link>
          <h1 className="text-5xl lg:text-7xl text-white uppercase" style={{ fontFamily: bebas, lineHeight: 1 }}>
            {team.name}
          </h1>
          <div className="mt-4">
            <span className="text-[#6EE76D] text-lg" style={{ fontFamily: bebas }}>{team.ageRange}</span>
          </div>
        </div>
      </section>

      <div className="sticky top-16 lg:top-20 z-40 bg-[#080C08]/95 backdrop-blur-md border-b border-[#6EE76D]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`px-5 py-3 uppercase tracking-wider text-[16px] transition-all whitespace-nowrap cursor-pointer relative ${
                  active === s.id
                    ? "text-[#6EE76D] after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#6EE76D] after:rounded-full"
                    : "text-white/45 hover:text-white"
                }`}
                style={{ fontFamily: bebas, letterSpacing: "0.1em" }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section id="prehled" ref={(el) => { sectionRefs.current["prehled"] = el; }} className="py-16 lg:py-20 scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="text-[#6EE76D] text-sm tracking-[0.2em] uppercase mb-3 block" style={{ fontFamily: bebas }}>O družstvu</span>
              <h2 className="text-3xl lg:text-4xl text-white uppercase mb-6" style={{ fontFamily: bebas }}>{team.name}</h2>
              <p className="text-white/50 text-lg mb-6" style={{ fontFamily: inter }}>{nbspShortWords(team.longDesc)}</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="mobile-solid-card p-4 rounded-2xl bg-[#101a10] border border-[#6EE76D]/12">
                  <div className="text-3xl text-[#6EE76D]" style={{ fontFamily: bebas }}>{team.playerCount}</div>
                  <div className="text-white/35 text-sm" style={{ fontFamily: inter }}>Hráček</div>
                </div>
                <div className="mobile-solid-card p-4 rounded-2xl bg-[#101a10] border border-[#6EE76D]/12">
                  <div className="text-3xl text-[#6EE76D]" style={{ fontFamily: bebas }}>{trainingCount}×</div>
                  <div className="text-white/35 text-sm" style={{ fontFamily: inter }}>Tréninků týdně</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#6EE76D]" />
                  <span className="text-white/60" style={{ fontFamily: inter }}>
                    Trenéři: <span className="text-white">{[team.coach, team.assistantCoach].filter(Boolean).join(" • ")}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-[#6EE76D]/10">
              <ImageWithFallback src={team.img} alt={team.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section id="treninky" ref={(el) => { sectionRefs.current["treninky"] = el; }} className="py-16 lg:py-20 bg-[#0e160e]/30 scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-[#6EE76D] text-sm tracking-[0.2em] uppercase mb-3 block" style={{ fontFamily: bebas }}>Rozvrh</span>
          <h2 className="text-3xl lg:text-4xl text-white uppercase mb-8" style={{ fontFamily: bebas }}>Tréninky</h2>

          {trainingBlocks.length > 0 ? (
            <div className="space-y-10">
              {trainingBlocks.map((block) => (
                <div key={block.title}>
                  <h3 className="text-xl text-white/45 mb-4 normal-case" style={{ fontFamily: inter }}>{block.title}</h3>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {block.items.map((item) => (
                      <div key={item.day + item.time + item.hall} className="mobile-solid-card rounded-3xl border border-[#6EE76D]/12 bg-[#101a10] p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="mobile-solid-chip w-12 h-12 rounded-2xl bg-[#6EE76D]/14 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-[#6EE76D]" />
                          </div>
                          <div className="text-white text-xl" style={{ fontFamily: bebas }}>{item.day}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4" style={{ fontFamily: inter }}>
                          <div>
                            <div className="mb-1 text-sm" style={{ color: "rgb(255 255 255 / 0.46)" }}>Čas</div>
                            <div className="text-[15px] leading-snug" style={{ color: "#FFFFFF", fontWeight: 600 }}>{item.time}</div>
                          </div>
                          <div>
                            <div className="mb-1 text-sm" style={{ color: "rgb(255 255 255 / 0.46)" }}>Místo</div>
                            <div className="text-[15px] leading-snug" style={{ color: "#FFFFFF", fontWeight: 600 }}>{item.hall}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {team.trainings.map((t, i) => (
                <div key={i} className="mobile-solid-card min-w-[18rem] flex-shrink-0 p-5 rounded-3xl bg-[#101a10] border border-[#6EE76D]/12 hover:border-[#6EE76D]/25 transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="mobile-solid-chip w-12 h-12 rounded-2xl bg-[#6EE76D]/14 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#6EE76D]" />
                    </div>
                    <div>
                      <div className="text-sm uppercase tracking-[0.2em]" style={{ fontFamily: bebas, color: "rgb(255 255 255 / 0.46)" }}>Trénink</div>
                      <div className="mt-1 text-[15px] leading-snug" style={{ fontFamily: inter, color: "#FFFFFF", fontWeight: 600 }}>{t.hall}</div>
                    </div>
                  </div>
                  <div className="text-2xl text-white" style={{ fontFamily: bebas }}>{t.day}</div>
                  <div className="mt-1 text-[15px]" style={{ fontFamily: inter, color: "#FFFFFF", fontWeight: 600 }}>{t.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="akce" ref={(el) => { sectionRefs.current["akce"] = el; }} className="py-16 lg:py-20 scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-[#6EE76D] text-sm tracking-[0.2em] uppercase mb-3 block" style={{ fontFamily: bebas }}>Kalendář</span>
          <h2 className="text-3xl lg:text-4xl text-white uppercase mb-8" style={{ fontFamily: bebas }}>Akce</h2>

          {displayedEvents.length ? (
            <div className="px-0">
              <div className="hidden md:grid grid-cols-[1fr_1.4fr_1fr] gap-6 pb-3 text-white/45 text-sm" style={{ fontFamily: inter }}>
                <div>Datum</div>
                <div>Akce</div>
                <div>Místo</div>
              </div>

              <div>
                {displayedEvents.map((event, i) => (
                  <div key={i} className={`grid gap-3 md:grid-cols-[1fr_1.4fr_1fr] py-5 ${i !== 0 ? "border-t border-[#6EE76D]/15" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className="mobile-solid-chip w-10 h-10 rounded-2xl bg-[#6EE76D]/14 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-[#6EE76D]" />
                      </div>
                      <div>
                        <div className="text-sm md:hidden" style={{ fontFamily: inter, color: "rgb(255 255 255 / 0.46)" }}>Datum</div>
                        <div className="text-white text-[1.2rem] whitespace-pre-line" style={{ fontFamily: bebas }}>{event.date}</div>
                      </div>
                    </div>

                    <div className="pl-[3.25rem] grid grid-cols-[1.2fr_1fr] gap-4 md:hidden">
                      <div>
                        <div className="mb-1 text-sm" style={{ fontFamily: inter, color: "rgb(255 255 255 / 0.46)" }}>Akce</div>
                        <div className="text-base whitespace-pre-line" style={{ fontFamily: inter, color: "#FFFFFF", fontWeight: 600 }}>{nbspShortWords(event.title)}</div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#6EE76D] mt-1 flex-shrink-0" />
                        <div>
                          <div className="mb-1 text-sm" style={{ fontFamily: inter, color: "rgb(255 255 255 / 0.46)" }}>Místo</div>
                          <div className="text-base whitespace-pre-line" style={{ fontFamily: inter, color: "#FFFFFF", fontWeight: 600 }}>{nbspShortWords(event.location)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center">
                      <div className="text-white text-base whitespace-pre-line" style={{ fontFamily: inter }}>{nbspShortWords(event.title)}</div>
                    </div>

                    <div className="hidden md:flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#6EE76D] mt-1 flex-shrink-0" />
                      <div className="text-white whitespace-pre-line" style={{ fontFamily: inter }}>{nbspShortWords(event.location)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-[#6EE76D]/8 bg-[#0e160e] p-8 text-white/70" style={{ fontFamily: inter }}>
              Žádné nadcházející akce nejsou zatím naplánované.
            </div>
          )}
        </div>
      </section>

      <section id="hracky" ref={(el) => { sectionRefs.current["hracky"] = el; }} className="py-16 lg:py-20 scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[#6EE76D] text-sm tracking-[0.2em] uppercase mb-3 block" style={{ fontFamily: bebas }}>Soupiska</span>
              <h2 className="text-3xl lg:text-4xl text-white uppercase" style={{ fontFamily: bebas }}>Hráčky</h2>
            </div>
            {team.players.length > 4 && (
              <div className="flex gap-2">
                <button
                  onClick={() => scrollPlayers(-1)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0e160e]/90 border border-[#6EE76D]/15 text-white/70 hover:text-white transition"
                  aria-label="Posunout doleva"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollPlayers(1)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0e160e]/90 border border-[#6EE76D]/15 text-white/70 hover:text-white transition"
                  aria-label="Posunout doprava"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div ref={playersScrollRef} className="flex gap-4 overflow-x-auto pb-4 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {team.players.map((p) => {
              const photo = getTeamPhoto(p.name);
              return (
                <div key={p.name} className="mobile-solid-card min-w-[16rem] md:min-w-[calc((100%-1rem)/2)] lg:min-w-[calc((100%-2rem)/3)] xl:min-w-[calc((100%-3rem)/4)] flex-shrink-0 h-[21rem] rounded-3xl bg-[#101a10] border border-[#6EE76D]/12 hover:border-[#6EE76D]/25 transition-all p-6 flex flex-col items-center justify-center text-center">
                  <div className="mobile-solid-chip w-24 h-24 rounded-full overflow-hidden bg-[#6EE76D]/14 border border-[#6EE76D]/20 flex items-center justify-center mb-5">
                    {photo ? (
                      <ImageWithFallback src={photo} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-8 h-8 text-[#6EE76D]" />
                    )}
                  </div>
                  <div className="text-white text-[16px]" style={{ fontFamily: inter }}>{p.name}</div>
                  <div className="text-white/45 text-sm mt-2" style={{ fontFamily: inter }}>{playerMetaLabel} {p.position}</div>
                  <div className="text-[#6EE76D] text-2xl mt-3" style={{ fontFamily: bebas }}>{p.number ?? "—"}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="treneri" ref={(el) => { sectionRefs.current["treneri"] = el; }} className="py-16 lg:py-20 bg-[#0e160e]/30 scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-[#6EE76D] text-sm tracking-[0.2em] uppercase mb-3 block" style={{ fontFamily: bebas }}>Realizační tým</span>
          <h2 className="text-3xl lg:text-4xl text-white uppercase mb-8" style={{ fontFamily: bebas }}>Trenéři</h2>

          <div className="px-0">
            <div className="hidden md:grid grid-cols-[1.2fr_1fr_1.1fr] gap-6 pb-3 text-white/45 text-sm" style={{ fontFamily: inter }}>
              <div>Jméno</div>
              <div>Telefon</div>
              <div>E-mail</div>
            </div>

            <div>
              {displayedStaff.map((member, i) => (
                <div key={member.name} className={`grid gap-4 md:grid-cols-[1.2fr_1fr_1.1fr] py-5 ${i !== 0 ? "border-t border-[#6EE76D]/15" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#101a10] border border-[#6EE76D]/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-[#6EE76D]" />
                    </div>
                    <div>
                      <div className="text-white/45 text-sm md:hidden" style={{ fontFamily: inter }}>Jméno</div>
                      <div className="text-white text-[16px]" style={{ fontFamily: inter }}>{member.name}</div>
                    </div>
                  </div>

                  <div className="pl-[3.25rem] md:pl-0 flex items-center gap-2">
                    {member.phone ? <Phone className="w-4 h-4 text-[#6EE76D] shrink-0" /> : <span className="hidden md:block w-4" />}
                    <div>
                      <div className="text-white/45 text-sm md:hidden mb-1" style={{ fontFamily: inter }}>Telefon</div>
                      <div className="text-white break-all" style={{ fontFamily: inter }}>{member.phone || "—"}</div>
                    </div>
                  </div>

                  <div className="pl-[3.25rem] md:pl-0 flex items-center gap-2">
                    {member.email ? <Mail className="w-4 h-4 text-[#6EE76D] shrink-0" /> : <span className="hidden md:block w-4" />}
                    <div>
                      <div className="text-white/45 text-sm md:hidden mb-1" style={{ fontFamily: inter }}>E-mail</div>
                      {member.email ? (
                        <a
                          href={`mailto:${member.email}`}
                          className="mail-link transition-colors break-all"
                          style={{ fontFamily: inter }}
                        >
                          {member.email}
                        </a>
                      ) : (
                        <div className="text-white break-all" style={{ fontFamily: inter }}>—</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="aktuality" ref={(el) => { sectionRefs.current["aktuality"] = el; }} className="py-16 lg:py-20 scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[#6EE76D] text-sm tracking-[0.2em] uppercase mb-3 block" style={{ fontFamily: bebas }}>Novinky</span>
              <h2 className="text-3xl lg:text-4xl text-white uppercase" style={{ fontFamily: bebas }}>Aktuality</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scrollNews(-1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0e160e]/90 border border-[#6EE76D]/15 text-white/70 hover:text-white transition"
                aria-label="Posunout aktuality doleva"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollNews(1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0e160e]/90 border border-[#6EE76D]/15 text-white/70 hover:text-white transition"
                aria-label="Posunout aktuality doprava"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div ref={newsScrollRef} className="flex gap-4 overflow-x-auto pb-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {displayedNews.map((n, i) => (
              <NewsCard
                key={i}
                article={{ title: n.title, date: n.date, excerpt: n.excerpt, content: n.excerpt }}
                to={`/aktuality/${normalizeText(n.title)}`}
                backTo={`/druzstva/${team.slug}#aktuality`}
                className="basis-[18rem] md:basis-[calc((100%-1rem)/2)] xl:basis-[calc((100%-2rem)/3)] flex-shrink-0 p-6 rounded-3xl"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl text-white uppercase mb-8" style={{ fontFamily: bebas }}>Další družstva</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAMS.filter((t) => t.slug !== slug).map((t) => (
              <Link
                key={t.slug}
                to={`/druzstva/${t.slug}`}
                className="mobile-solid-card p-5 rounded-2xl bg-[#101a10] border border-[#6EE76D]/12 hover:border-[#6EE76D]/25 transition-all group"
              >
                <h3 className="text-white uppercase group-hover:text-[#6EE76D] transition-colors text-xl" style={{ fontFamily: bebas }}>{t.name}</h3>
                <p className="text-white/35 text-sm mt-1" style={{ fontFamily: inter }}>{t.ageRange} • {t.playerCount} hráček</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaStrip />
    </>
  );
}
