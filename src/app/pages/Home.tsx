import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  ChevronRight, ChevronLeft, ChevronDown, Play, Instagram, ArrowRight,
  Clock, Users, Calendar, Trophy,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Btn, SectionLabel, CtaStrip, bebas, inter, nbspShortWords } from "../components/shared";
import { TEAMS, getAllTeamNews } from "../data/teams";
import heroBackground from "../../imports/hc-haje-pozadi.png";

const totalPlayers = TEAMS.reduce((sum, team) => sum + team.playerCount, 0);
const totalTeams = TEAMS.length;
const totalTrainingsPerWeek = TEAMS.reduce((sum, team) => sum + team.trainings.length, 0);

const STATS = [
  { value: `${totalPlayers}`, label: "Aktivních hráček" },
  { value: `${totalTeams}`, label: "Družstev" },
  { value: `${totalTrainingsPerWeek}`, label: "Tréninků týdně" },
];

const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1769614075229-bfc51a41aa78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMHRlYW0lMjB0cmFpbmluZyUyMGluZG9vcnxlbnwxfHx8fDE3NzYwODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1575367728985-8cb72541609a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMGdhbWUlMjBtYXRjaCUyMGFjdGlvbnxlbnwxfHx8fDE3NzYwODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1669046239665-5dcfc2ecc468?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMGNvdXJ0JTIwaW5kb29yJTIwc3BvcnRzJTIwaGFsbHxlbnwxfHx8fDE3NzYwODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1552127966-d24b805b9be7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGhhbmRiYWxsJTIwcGxheWVycyUyMHRlYW18ZW58MXx8fHwxNzc2MDg1OTY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
];

const REELS = [
  {
    id: 1,
    permalink: "https://www.instagram.com/reel/DV_oFfejTpP/?utm_source=ig_embed&utm_campaign=loading",
    thumbnail: "https://images.unsplash.com/photo-1606519740551-1fa9e7c68a02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMGJhbGwlMjBjbG9zZSUyMHVwJTIwc3BvcnR8ZW58MXx8fHwxNzc2MDg1OTY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    caption: "Trénink A-týmu",
  },
  { id: 2, thumbnail: "https://images.unsplash.com/photo-1769614075229-bfc51a41aa78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMHRlYW0lMjB0cmFpbmluZyUyMGluZG9vcnxlbnwxfHx8fDE3NzYwODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", caption: "Přípravka v akci" },
  { id: 3, thumbnail: "https://images.unsplash.com/photo-1575367728985-8cb72541609a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMGdhbWUlMjBtYXRjaCUyMGFjdGlvbnxlbnwxfHx8fDE3NzYwODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", caption: "Zápasový highlight" },
  { id: 4, thumbnail: "https://images.unsplash.com/photo-1552127966-d24b805b9be7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGhhbmRiYWxsJTIwcGxheWVycyUyMHRlYW18ZW58MXx8fHwxNzc2MDg1OTY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", caption: "Teambuilding" },
  { id: 5, thumbnail: "https://images.unsplash.com/photo-1669046239665-5dcfc2ecc468?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMGNvdXJ0JTIwaW5kb29yJTIwc3BvcnRzJTIwaGFsbHxlbnwxfHx8fDE3NzYwODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", caption: "Atmosféra haly" },
  { id: 6, thumbnail: "https://images.unsplash.com/photo-1606519740551-1fa9e7c68a02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMGJhbGwlMjBjbG9zZSUyMHVwJTIwc3BvcnR8ZW58MXx8fHwxNzc2MDg1OTY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", caption: "Naše vybavení" },
];

const DAY_ORDER = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];

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

const getUpcomingTrainings = () => {
  const now = new Date();
  const currentDayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;

  return TEAMS.flatMap((team) =>
    team.trainings.map((training) => {
      const dayIndex = DAY_ORDER.indexOf(training.day);
      const distance = dayIndex >= currentDayIndex ? dayIndex - currentDayIndex : dayIndex + 7 - currentDayIndex;
      const startTime = training.time.split(/[–-]/)[0].trim();
      const [hours = 0, minutes = 0] = startTime.split(":").map(Number);
      const nextDate = new Date(now);
      nextDate.setHours(0, 0, 0, 0);
      nextDate.setDate(now.getDate() + distance);

      return {
        ...training,
        team: team.name,
        slug: team.slug,
        date: `${nextDate.getDate()}. ${nextDate.getMonth() + 1}.`,
        sortValue: distance * 1440 + hours * 60 + minutes,
      };
    }),
  )
    .sort((a, b) => a.sortValue - b.sortValue)
    .slice(0, 5);
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

  useEffect(() => {
    const processEmbeds = () => {
      const instgrm = (window as any).instgrm;
      if (instgrm?.Embeds?.process) {
        instgrm.Embeds.process();
      }
    };

    const scriptQuery = 'script[src*="instagram.com/embed.js"]';
    const existingScript = document.querySelector(scriptQuery);

    if (existingScript) {
      processEmbeds();
      return;
    }

    const script = document.createElement('script');
    script.src = '//www.instagram.com/embed.js';
    script.async = true;
    script.onload = processEmbeds;
    document.body.appendChild(script);
  }, []);

  const instagramEmbed = (permalink: string) => `
    <blockquote class="instagram-media" data-instgrm-permalink="${permalink}" data-instgrm-version="14" style="background:#FFFFFF; border:0; border-radius:24px; box-shadow:0 0 1px rgba(0,0,0,.5),0 1px 10px rgba(0,0,0,.15); margin:0; width:100% !important; max-width:100% !important; min-width:0 !important; padding:0;">
    </blockquote>
  `;

  return (
    <section className="reveal-on-scroll py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#080C08] via-[#0e160e] to-[#080C08]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <style>{`
          .instagram-embed blockquote.instagram-media {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
          .instagram-embed blockquote.instagram-media > div {
            width: 100% !important;
          }
          .instagram-embed iframe {
            width: 100% !important;
            max-width: 100% !important;
          }
        `}</style>
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[#6EE76D] text-sm tracking-[0.2em] uppercase mb-2 flex items-center gap-2" style={{ fontFamily: bebas }}>
              <Instagram className="w-4 h-4" /> Sledujte nás
            </span>
            <h2 className="text-3xl lg:text-4xl text-white uppercase" style={{ fontFamily: bebas }}>
              Z našeho Instagramu
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
          {REELS.map((reel) => (
            reel.permalink ? (
              <div key={reel.id} className="flex-shrink-0 w-[220px] sm:w-[250px] snap-start">
                <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-[#6EE76D]/10 transition-all bg-black">
                  <div className="instagram-embed absolute inset-0 h-full w-full" dangerouslySetInnerHTML={{ __html: instagramEmbed(reel.permalink) }} />
                </div>
              </div>
            ) : (
              <div key={reel.id} className="flex-shrink-0 w-[220px] sm:w-[250px] snap-start group cursor-pointer">
                <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-[#6EE76D]/10 group-hover:border-[#6EE76D]/30 transition-all">
                  <ImageWithFallback src={reel.thumbnail} alt={reel.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-[#6EE76D]/20 backdrop-blur-sm flex items-center justify-center border border-[#6EE76D]/30">
                      <Play className="w-6 h-6 text-[#6EE76D] fill-[#6EE76D]" />
                    </div>
                  </div>
                  <p className="absolute bottom-3 left-3 right-3 text-white text-sm">{reel.caption}</p>
                  <Instagram className="absolute top-3 right-3 w-4 h-4 text-white/50" />
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════ NEWS + TRAININGS ══════════════ */
function NewsAndTrainings() {
  const upcomingTrainings = getUpcomingTrainings();

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
                  state={{ article: { title: item.title, date: item.date, excerpt: item.excerpt, content: item.content }, backTo: "/" }}
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
                        <span className="px-3.5 py-1 rounded-full bg-[#6EE76D]/10 text-[#6EE76D] text-[12px] tracking-[0.12em]" style={{ fontFamily: bebas }}>{item.teamName}</span>
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
            <SectionLabel>Rozvrh</SectionLabel>
            <h2 className="text-3xl lg:text-4xl text-white uppercase mb-8" style={{ fontFamily: bebas }}>Nejbližší trénink</h2>
            <div className="space-y-3">
              {upcomingTrainings.map((t, i) => (
                <Link
                  key={t.slug + t.day + t.time + i}
                  to={`/druzstva/${t.slug}`}
                  className="mobile-solid-card flex items-center gap-4 p-4 rounded-2xl bg-[#101a10] border border-[#6EE76D]/12 hover:border-[#6EE76D]/25 transition-all group"
                >
                  <div className="mobile-solid-chip w-10 h-10 rounded-full bg-[#6EE76D]/14 flex items-center justify-center flex-shrink-0">
                    {t.slug === "zeny" ? <Trophy className="w-5 h-5 text-[#6EE76D]" /> : <Users className="w-5 h-5 text-[#6EE76D]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-white" style={{ fontFamily: inter }}>{t.team}</span>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-white/35 mt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#6EE76D]" /> {t.day} {t.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#6EE76D]" /> {t.time}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#8F988F] group-hover:text-[#6EE76D] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
            <Btn variant="secondary" to="/treninky" className="mt-6">Kompletní rozvrh</Btn>
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
    </>
  );
}
