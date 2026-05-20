import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  ChevronRight, ChevronLeft, ChevronDown, Play, ArrowRight,
  Calendar, MapPin,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Btn, SectionLabel, CtaStrip, bebas, inter, nbspShortWords } from "../components/shared";
import { TEAMS } from "../data/teams";
import heroBackground from "../../imports/Web Photo HCH.png";
import carouselHch02 from "../../imports/foto/carousel hp/HCH_02.jpg";
import carouselHch03 from "../../imports/foto/carousel hp/HCH_03.jpg";
import carouselHch04 from "../../imports/foto/carousel hp/HCH_04.jpg";
import carouselHch06 from "../../imports/foto/carousel hp/HCH_06.jpg";
import carouselHch10 from "../../imports/foto/carousel hp/HCH_10.jpg";
import carouselHch13 from "../../imports/foto/carousel hp/HCH_13.jpg";
import bistorGreenLogo from "../../imports/loga/logo-green.svg";
import kasiaLogo from "../../imports/loga/logo-kasia.png";
import macronLogo from "../../imports/loga/logo-macron.svg";
import pragueLogo from "../../imports/loga/logo-prague.svg";
import praha11Logo from "../../imports/loga/logo-praha11.svg";
import sprinklerGroupLogo from "../../imports/loga/logo-sprinkler.svg";

const fallbackPlayerCount = TEAMS.reduce((sum, team) => sum + team.playerCount, 0);
const fallbackCoachCount = TEAMS.reduce((sum, team) => sum + (team.coach ? 1 : 0) + (team.assistantCoach ? 1 : 0), 0);
const totalTeams = TEAMS.length;

const PARTNERS = [
  { src: kasiaLogo, alt: "Kasia - Partneři" },
  { src: macronLogo, alt: "Macron - Partneři" },
  { src: pragueLogo, alt: "Praha - Partneři" },
  { src: praha11Logo, alt: "Praha 11 - Partneři" },
  { src: sprinklerGroupLogo, alt: "Sprinkler Group - Partneři" },
  { src: bistorGreenLogo, alt: "Bistor Green - Partneři" },
];

const CAROUSEL_IMAGES = [
  carouselHch06,
  carouselHch02,
  carouselHch03,
  carouselHch04,
  carouselHch10,
  carouselHch13,
];

const YOUTUBE_SHORTS = [
  { id: 1, url: "https://youtube.com/shorts/qXrqO4WdFps?feature=share", caption: "HC Háje Shorts 1" },
  { id: 2, url: "https://youtube.com/shorts/3Jwy9uqJu4M?feature=share", caption: "HC Háje Shorts 2" },
  { id: 3, url: "https://youtube.com/shorts/0JEVSN4o9y0?feature=share", caption: "HC Háje Shorts 3" },
  { id: 4, url: "https://youtube.com/shorts/AZHaXz5OG_E?feature=share", caption: "HC Háje Shorts 4" },
  { id: 5, url: "https://youtube.com/shorts/OsATSi5F3yI?feature=share", caption: "HC Háje Shorts 5" },
  { id: 6, url: "https://youtube.com/shorts/7eeWLsZDVZs?feature=share", caption: "HC Háje Shorts 6" },
  { id: 7, url: "https://youtube.com/shorts/xmGBGfHFn7k?feature=share", caption: "HC Háje Shorts 7" },
];

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const parseCzDate = (value: string) => {
  const clean = String(value || "").replace(/\s/g, "");
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) return new Date(clean).getTime();

  const [day, month, year] = clean.split(".").filter(Boolean);
  if (!day || !month || !year) return Number.MAX_SAFE_INTEGER;
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
};

type ApiNewsItem = {
  id?: string;
  slug?: string;
  title?: string;
  date?: string;
  excerpt?: string;
  content?: string;
  teamName?: string;
  teamNames?: string[];
};

type NewsPreview = {
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  teamName: string;
};

type ApiEvent = {
  id?: string;
  date?: string;
  title?: string;
  location?: string;
  teamName?: string;
  teamSlug?: string;
};

type HomeEvent = {
  id: string;
  date: string;
  title: string;
  location: string;
  teamName: string;
  teamSlug: string;
  sortValue: number;
};

const getYoutubeEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;

    if (path.includes("/shorts/")) {
      const shortId = path.split("/shorts/")[1]?.split("/")[0];
      if (shortId) return `https://www.youtube.com/embed/${shortId}?rel=0`;
    }

    if (path === "/watch") {
      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = path.replace("/", "");
      if (videoId) return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }

    return url;
  } catch {
    return url;
  }
};

/* ══════════════ HERO ══════════════ */
function Hero() {
  const [livePlayerCount, setLivePlayerCount] = useState<number | null>(null);
  const [liveCoachCount, setLiveCoachCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/players")
      .then((r) => (r.ok ? r.json() : null))
      .then((payload: { players?: Array<unknown> } | null) => {
        if (payload?.players?.length) setLivePlayerCount(payload.players.length);
      })
      .catch(() => {});

    fetch("/api/coaches")
      .then((r) => (r.ok ? r.json() : null))
      .then((payload: { coaches?: Array<unknown> } | null) => {
        if (payload?.coaches?.length) setLiveCoachCount(payload.coaches.length);
      })
      .catch(() => {});
  }, []);

  const stats = [
    { value: `${livePlayerCount ?? fallbackPlayerCount}`, label: "Aktivních hráček" },
    { value: `${totalTeams}`, label: "Družstev" },
    { value: `${liveCoachCount ?? fallbackCoachCount}`, label: "Trenérů" },
  ];

  return (
    <section className="home-hero reveal-on-scroll relative min-h-[100dvh] lg:min-h-screen overflow-hidden pt-16 lg:pt-20">
      <div className="absolute inset-0">
        <ImageWithFallback
          src={heroBackground}
          alt="HC Háje"
          className="w-full h-full object-cover object-[74%_34%] sm:object-[78%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080C08] via-[#080C08]/82 to-[#080C08]/42 sm:via-[#080C08]/85 sm:to-[#080C08]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080C08] via-transparent to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="home-hero-content min-h-[calc(100dvh-4.5rem)] lg:min-h-[calc(100dvh-5rem)] flex flex-col justify-center pb-24 sm:pb-28 lg:pb-24">
          <div className="max-w-2xl">
            <div className="home-hero-badge inline-flex items-center gap-2 bg-[#6EE76D]/10 border border-[#6EE76D]/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 rounded-full bg-[#6EE76D] animate-pulse" />
              <span className="text-[#6EE76D] text-sm" style={{ fontFamily: bebas, letterSpacing: "0.1em" }}>
                Sezóna 2026
              </span>
            </div>

            <h1
              className="home-hero-title text-5xl sm:text-6xl lg:text-8xl text-white mb-6 uppercase"
              style={{ fontFamily: bebas, lineHeight: 0.95, letterSpacing: "0.02em" }}
            >
              Házená je{" "}
              <span className="text-[#6EE76D]">náš život.</span>
            </h1>

            <p className="home-hero-copy text-white/50 text-lg mb-10 max-w-lg" style={{ fontFamily: inter }}>
              {nbspShortWords("Jsme HC Háje — dívčí a ženský házenkářský klub z Prahy 4. Od roku 1980 vedeme hráčky k pravidelnému sportu, týmovosti a radosti z házené.")}
            </p>

            <div className="home-hero-cta flex flex-wrap gap-4">
              <Btn variant="primary" to="/nabor#kontaktni-formular">
                Chci zkusit trénink <ArrowRight className="w-4 h-4" />
              </Btn>
              <Btn variant="secondary" to="/o-klubu">Více o klubu</Btn>
            </div>
          </div>

          <div className="home-hero-stats mt-16 lg:mt-24 grid grid-cols-3 gap-8 max-w-xl">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="home-hero-stat-value text-4xl lg:text-5xl text-[#6EE76D]" style={{ fontFamily: bebas }}>{s.value}</div>
                <div className="home-hero-stat-label text-white/40 text-sm mt-1" style={{ fontFamily: inter }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Posunout níže"
        onClick={() => document.getElementById("home-about")?.scrollIntoView({ behavior: "smooth" })}
        className="home-hero-scroll absolute left-1/2 bottom-2 sm:bottom-3 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 hover:text-white transition-colors z-20"
      >
        <span className="text-[10px] uppercase tracking-[0.22em]" style={{ fontFamily: bebas }}>Scroll</span>
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/20 backdrop-blur-sm animate-bounce">
          <ChevronDown className="w-5 h-5 text-[#6EE76D]" />
        </span>
      </button>
    </section>
  );
}

/* ══════════════ ABOUT ══════════════ */
function About() {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlide((p) => (p + 1) % CAROUSEL_IMAGES.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="home-about" className="reveal-on-scroll py-20 lg:py-28 scroll-mt-24 lg:scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <SectionLabel>O klubu</SectionLabel>
            <h2 className="text-4xl lg:text-5xl text-white uppercase mb-6" style={{ fontFamily: bebas, lineHeight: 1 }}>
              Tradice a výchova<br />od roku 1980
            </h2>
            <p className="text-white/50 mb-4" style={{ fontFamily: inter }}>
              {nbspShortWords("HC Háje patří mezi tradiční centra dívčí házené v Praze. Zaměřujeme se na dlouhodobou sportovní přípravu děvčat od přípravky až po ženské kategorie.")}
            </p>
            <p className="text-white/50 mb-8" style={{ fontFamily: inter }}>
              {nbspShortWords("V nejmladších kategoriích stavíme na pohybových hrách a všeobecném rozvoji, na které postupně navazují házenkářské dovednosti, soutěže i týmové zkušenosti.")}
            </p>
            <div className="flex flex-wrap gap-4">
              <Btn variant="primary" to="/o-klubu">Více o klubu</Btn>
              <Btn variant="secondary" to="/druzstva">Naše družstva</Btn>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group">
            {CAROUSEL_IMAGES.map((img, i) => (
              <ImageWithFallback key={i} src={img} alt={`Házená ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === slide ? "opacity-100" : "opacity-0"}`} />
            ))}
            <div className="absolute inset-0 border border-[#6EE76D]/15 rounded-2xl pointer-events-none" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {CAROUSEL_IMAGES.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)}
                  className={`h-2 rounded-full transition-all ${i === slide ? "bg-[#6EE76D] w-6" : "bg-white/25 w-2"}`} />
              ))}
            </div>
            <button onClick={() => setSlide((p) => (p - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setSlide((p) => (p + 1) % CAROUSEL_IMAGES.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════ REELS ══════════════ */
function ReelsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * 300, behavior: "smooth" });

  return (
    <section className="reveal-on-scroll py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#080C08] via-[#0e160e] to-[#080C08]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[#6EE76D] text-sm tracking-[0.2em] uppercase mb-2 flex items-center gap-2" style={{ fontFamily: bebas }}>
              <Play className="w-4 h-4" /> Sledujte nás
            </span>
            <h2 className="text-3xl lg:text-4xl text-white uppercase" style={{ fontFamily: bebas }}>
              Z našeho YouTube
            </h2>
          </div>
          <div className="hidden sm:flex gap-2">
            <button onClick={() => scroll(-1)} className="w-10 h-10 rounded-full border border-[#6EE76D]/25 flex items-center justify-center text-[#6EE76D] hover:bg-[#6EE76D]/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll(1)} className="w-10 h-10 rounded-full border border-[#6EE76D]/25 flex items-center justify-center text-[#6EE76D] hover:bg-[#6EE76D]/10 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div ref={ref} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
          {YOUTUBE_SHORTS.map((video) => (
            <div key={video.id} className="flex-shrink-0 w-[220px] sm:w-[250px] snap-start">
              <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-[#6EE76D]/10 bg-black">
                <iframe
                  src={getYoutubeEmbedUrl(video.url)}
                  title={video.caption}
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════ NEWS + TRAININGS ══════════════ */
function NewsAndTrainings() {
  const [latestNews, setLatestNews] = useState<NewsPreview[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<HomeEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadUpcomingEvents = async () => {
      setEventsLoading(true);
      try {
        const response = await fetch("/api/events");
        if (!response.ok) throw new Error("Nepodarilo se nacist akce");

        const payload = (await response.json()) as { events?: ApiEvent[] };
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTs = today.getTime();

        const normalized = (payload.events ?? [])
          .map((item, index) => {
            const date = String(item.date || "—");
            const sortValue = parseCzDate(date);
            return {
              id: String(item.id || `event-${index}`),
              date,
              title: String(item.title || "Akce"),
              location: String(item.location || ""),
              teamName: String(item.teamName || "Nezařazeno"),
              teamSlug: String(item.teamSlug || "").trim(),
              sortValue,
            } satisfies HomeEvent;
          })
          .filter((event) => event.sortValue >= todayTs)
          .sort((a, b) => a.sortValue - b.sortValue)
          .slice(0, 5);

        if (!isActive) return;
        setUpcomingEvents(normalized);
      } catch {
        if (!isActive) return;
        setUpcomingEvents([]);
      } finally {
        if (!isActive) return;
        setEventsLoading(false);
      }
    };

    const loadLatestNews = async () => {
      setNewsLoading(true);
      try {
        const response = await fetch("/api/news");
        if (!response.ok) throw new Error("Nepodarilo se nacist aktuality");

        const payload = (await response.json()) as { news?: ApiNewsItem[] };
        const normalized = (payload.news ?? [])
          .map((item, index) => {
            const fallbackTeamName = String(item.teamName || "").trim();
            const relatedTeam = (item.teamNames ?? []).map((value) => String(value || "").trim()).find(Boolean) || "Klub";
            return {
              id: String(item.id || `notion-news-${index}`),
              slug: String(item.slug || "").trim() || toSlug(String(item.title || `aktualita-${index}`)),
              title: String(item.title || "Aktualita"),
              date: String(item.date || "—"),
              excerpt: String(item.excerpt || ""),
              content: String(item.content || item.excerpt || ""),
              teamName: fallbackTeamName || relatedTeam,
            } satisfies NewsPreview;
          })
          .sort((a, b) => parseCzDate(b.date) - parseCzDate(a.date))
          .slice(0, 5);

        if (!isActive) return;
        setLatestNews(normalized);
      } catch {
        if (!isActive) return;
        setLatestNews([]);
      } finally {
        if (!isActive) return;
        setNewsLoading(false);
      }
    };

    loadLatestNews();
    loadUpcomingEvents();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="reveal-on-scroll py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <SectionLabel>Novinky</SectionLabel>
            <h2 className="text-3xl lg:text-4xl text-white uppercase mb-8" style={{ fontFamily: bebas }}>Aktuality</h2>
            {newsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={`home-news-skeleton-${i}`} className="mobile-solid-card p-4 rounded-2xl bg-[#101a10] border border-[#6EE76D]/12 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#6EE76D]/10 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-[#6EE76D]/10 rounded w-4/5 mb-2" />
                        <div className="h-3 bg-[#6EE76D]/10 rounded w-1/2" />
                      </div>
                      <div className="w-5 h-5 rounded bg-[#6EE76D]/10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : latestNews.length > 0 ? (
              <div className="space-y-3">
                {latestNews.map((item) => (
                  <Link
                    key={item.id}
                    to={`/aktuality/${item.slug}`}
                    state={{ article: { title: item.title, date: item.date, excerpt: item.excerpt, content: item.content }, backTo: "/aktuality" }}
                    className="mobile-solid-card group block p-4 rounded-2xl bg-[#101a10] border border-[#6EE76D]/12 hover:border-[#6EE76D]/25 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="mobile-solid-chip w-10 h-10 rounded-full bg-[#6EE76D]/14 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-[#6EE76D]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-white text-[16px] leading-tight"
                          style={{ fontFamily: inter, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                        >
                          {item.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-white/35 mt-1.5">
                          <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#6EE76D]" /> {item.date}</span>
                          <span className="px-3.5 py-1 rounded-full bg-[#F587B9]/12 text-[#FFC2DD] text-[12px] tracking-[0.12em]" style={{ fontFamily: bebas }}>{item.teamName}</span>
                        </div>
                      </div>

                      <ArrowRight className="w-5 h-5 text-[#8F988F] group-hover:text-[#6EE76D] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-[#6EE76D]/8 bg-[#0e160e] p-6 text-white/70" style={{ fontFamily: inter }}>
                Aktuality zatím nejsou k dispozici.
              </div>
            )}
            <Btn variant="secondary" to="/aktuality" className="mt-6">Všechny aktuality</Btn>
          </div>

          <div>
            <SectionLabel>Akce</SectionLabel>
            <h2 className="text-3xl lg:text-4xl text-white uppercase mb-8" style={{ fontFamily: bebas }}>Nejbližší akce</h2>
            {eventsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={`home-events-skeleton-${i}`} className="mobile-solid-card flex items-center gap-4 p-4 rounded-2xl bg-[#101a10] border border-[#6EE76D]/12 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-[#6EE76D]/10 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-[#6EE76D]/10 rounded w-4/5 mb-2" />
                      <div className="h-3 bg-[#6EE76D]/10 rounded w-1/2" />
                    </div>
                    <div className="w-5 h-5 rounded bg-[#6EE76D]/10" />
                  </div>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={event.teamSlug ? `/druzstva/${event.teamSlug}` : "/akce"}
                    className="mobile-solid-card flex items-center gap-4 p-4 rounded-2xl bg-[#101a10] border border-[#6EE76D]/12 hover:border-[#6EE76D]/25 transition-all group"
                  >
                    <div className="mobile-solid-chip w-10 h-10 rounded-full bg-[#6EE76D]/14 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-[#6EE76D]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-white" style={{ fontFamily: inter }}>{event.title}</span>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-white/35 mt-0.5">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#6EE76D]" /> {event.date}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#6EE76D]" /> {event.location}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F587B9]/12 text-[#FFC2DD] text-[11px] tracking-[0.1em]" style={{ fontFamily: bebas }}>{event.teamName}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#8F988F] group-hover:text-[#6EE76D] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-[#6EE76D]/8 bg-[#0e160e] p-6 text-white/70" style={{ fontFamily: inter }}>
                Nejbližší akce zatím nejsou k dispozici.
              </div>
            )}
            <Btn variant="secondary" to="/akce" className="mt-6">Všechny akce</Btn>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════ PARTNERS ══════════════ */
function PartnersSection() {
  return (
    <section className="reveal-on-scroll py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-white/60 uppercase mb-12" style={{ fontFamily: bebas, fontSize: '20px' }}>
            Děkujeme našim partnerům
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8 items-center justify-items-center lg:flex lg:flex-nowrap lg:items-center lg:justify-between lg:gap-[clamp(0.75rem,2.2vw,2.5rem)]">
            {PARTNERS.map((partner) => (
              <div key={partner.alt} className="flex items-center justify-center lg:flex-1 lg:min-w-0">
                <ImageWithFallback
                  src={partner.src}
                  alt={partner.alt}
                  className="h-[3.9rem] lg:h-[4.2rem] xl:h-[4.9rem] w-auto max-w-full object-contain opacity-40 hover:opacity-80 transition-opacity duration-300 filter brightness-0 invert"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <ReelsSection />
      <NewsAndTrainings />
      <CtaStrip />
      <PartnersSection />
    </>
  );
}
