import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  ChevronRight, ChevronLeft, ChevronDown, Play, ArrowRight,
  Calendar, MapPin,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Btn, SectionLabel, CtaStrip, bebas, inter, nbspShortWords } from "../components/shared";
import { TEAMS, getAllTeamNews } from "../data/teams";
import heroBackground from "../../imports/hc-haje-pozadi.png";
import bistorGreenLogo from "../../imports/loga/logo-green.svg";
import kasiaLogo from "../../imports/loga/logo-kasia.png";
import macronLogo from "../../imports/loga/logo-macron.svg";
import pragueLogo from "../../imports/loga/logo-prague.svg";
import praha11Logo from "../../imports/loga/logo-praha11.svg";
import sprinklerGroupLogo from "../../imports/loga/logo-sprinkler.svg";

const totalPlayers = TEAMS.reduce((sum, team) => sum + team.playerCount, 0);
const totalTeams = TEAMS.length;
const totalTrainingsPerWeek = TEAMS.reduce((sum, team) => sum + team.trainings.length, 0);

const STATS = [
  { value: `${totalPlayers}`, label: "Aktivních hráček" },
  { value: `${totalTeams}`, label: "Družstev" },
  { value: `${totalTrainingsPerWeek}`, label: "Tréninků týdně" },
];

const PARTNERS = [
  { src: kasiaLogo, alt: "Kasia - Partneři" },
  { src: macronLogo, alt: "Macron - Partneři" },
  { src: pragueLogo, alt: "Praha - Partneři" },
  { src: praha11Logo, alt: "Praha 11 - Partneři" },
  { src: sprinklerGroupLogo, alt: "Sprinkler Group - Partneři" },
  { src: bistorGreenLogo, alt: "Bistor Green - Partneři" },
];

const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1769614075229-bfc51a41aa78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMHRlYW0lMjB0cmFpbmluZyUyMGluZG9vcnxlbnwxfHx8fDE3NzYwODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1575367728985-8cb72541609a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMGdhbWUlMjBtYXRjaCUyMGFjdGlvbnxlbnwxfHx8fDE3NzYwODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1669046239665-5dcfc2ecc468?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMGNvdXJ0JTIwaW5kb29yJTIwc3BvcnRzJTIwaGFsbHxlbnwxfHx8fDE3NzYwODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1552127966-d24b805b9be7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGhhbmRiYWxsJTIwcGxheWVycyUyMHRlYW18ZW58MXx8fHwxNzc2MDg1OTY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
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
  const [day, month, year] = value.replace(/\s/g, "").split(".").filter(Boolean);
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
};

const getUpcomingEvents = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();

  return TEAMS.flatMap((team) =>
    (team.events ?? []).map((event) => ({
      ...event,
      team: team.name,
      slug: team.slug,
      sortValue: parseCzDate(event.date),
    })),
  )
    .filter((event) => event.sortValue >= todayTs)
    .sort((a, b) => a.sortValue - b.sortValue)
    .slice(0, 5);
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

const latestNews = getAllTeamNews()
  .sort((a, b) => parseCzDate(b.date) - parseCzDate(a.date))
  .slice(0, 5);

/* ══════════════ HERO ══════════════ */
function Hero() {
  return (
    <section className="reveal-on-scroll relative min-h-screen flex items-center overflow-hidden pt-20">
      <div className="absolute inset-0">
        <ImageWithFallback
          src={heroBackground}
          alt="HC Háje"
          className="w-full h-full object-cover object-[78%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080C08] via-[#080C08]/82 to-[#080C08]/42 sm:via-[#080C08]/85 sm:to-[#080C08]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080C08] via-transparent to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 w-full">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#6EE76D]/10 border border-[#6EE76D]/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#6EE76D] animate-pulse" />
            <span className="text-[#6EE76D] text-sm" style={{ fontFamily: bebas, letterSpacing: "0.1em" }}>
              Sezóna 2025 / 2026
            </span>
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-8xl text-white mb-6 uppercase"
            style={{ fontFamily: bebas, lineHeight: 0.95, letterSpacing: "0.02em" }}
          >
            Házená je{" "}
            <span className="text-[#6EE76D]">náš život.</span>
          </h1>

          <p className="text-white/50 text-lg mb-10 max-w-lg" style={{ fontFamily: inter }}>
            {nbspShortWords("Jsme HC Háje — dívčí a ženský házenkářský klub z Prahy 4. Od roku 1980 vedeme hráčky k pravidelnému sportu, týmovosti a radosti z házené.")}
          </p>

          <div className="flex flex-wrap gap-4">
            <Btn variant="primary" to="/kontakty">
              Přijdu na trénink <ArrowRight className="w-4 h-4" />
            </Btn>
            <Btn variant="secondary" to="/o-klubu">Více o klubu</Btn>
          </div>
        </div>

        <div className="mt-16 lg:mt-24 grid grid-cols-3 gap-8 max-w-xl">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-4xl lg:text-5xl text-[#6EE76D]" style={{ fontFamily: bebas }}>{s.value}</div>
              <div className="text-white/40 text-sm mt-1" style={{ fontFamily: inter }}>{s.label}</div>
            </div>
          ))}
        </div>

      </div>

      <button
        type="button"
        aria-label="Posunout níže"
        onClick={() => document.getElementById("home-about")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute left-1/2 bottom-2 sm:bottom-3 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 hover:text-white transition-colors z-20"
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
    <section id="home-about" className="reveal-on-scroll py-20 lg:py-28">
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
  const upcomingEvents = getUpcomingEvents();

  return (
    <section className="reveal-on-scroll py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <SectionLabel>Novinky</SectionLabel>
            <h2 className="text-3xl lg:text-4xl text-white uppercase mb-8" style={{ fontFamily: bebas }}>Aktuality</h2>
            <div className="space-y-3">
              {latestNews.map((item) => (
                <Link
                  key={item.id}
                  to={`/aktuality/${toSlug(item.title)}`}
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
            <Btn variant="secondary" to="/aktuality" className="mt-6">Všechny aktuality</Btn>
          </div>

          <div>
            <SectionLabel>Akce</SectionLabel>
            <h2 className="text-3xl lg:text-4xl text-white uppercase mb-8" style={{ fontFamily: bebas }}>Nejbližší akce</h2>
            <div className="space-y-3">
              {upcomingEvents.map((event, i) => (
                <Link
                  key={event.slug + event.date + event.title + i}
                  to={`/druzstva/${event.slug}`}
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
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F587B9]/12 text-[#FFC2DD] text-[11px] tracking-[0.1em]" style={{ fontFamily: bebas }}>{event.team}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#8F988F] group-hover:text-[#6EE76D] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
            <Btn variant="secondary" to="/druzstva" className="mt-6">Všechny akce družstev</Btn>
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
