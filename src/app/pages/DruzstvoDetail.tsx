import { useState, useEffect, useRef } from "react";
import { useParams, Link, Navigate } from "react-router";
import {
  ArrowLeft, Clock, MapPin, Calendar, Users, User, Newspaper, ChevronRight,
} from "lucide-react";
import { Btn, bebas, inter, CtaStrip } from "../components/shared";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { getTeamBySlug, TEAMS } from "../data/teams";

const SECTIONS = [
  { id: "prehled", label: "Přehled" },
  { id: "treninky", label: "Tréninky" },
  { id: "hracky", label: "Hráčky" },
  { id: "aktuality", label: "Aktuality" },
];

export default function DruzstvoDetail() {
  const { slug } = useParams();
  const team = getTeamBySlug(slug || "");
  const [active, setActive] = useState("prehled");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

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

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Hero */}
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
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <span className="text-[#6EE76D] text-lg" style={{ fontFamily: bebas }}>{team.ageRange}</span>
            <span className="text-white/25">•</span>
            <span className="text-white/45" style={{ fontFamily: inter }}>{team.playerCount} hráček</span>
            <span className="text-white/25">•</span>
            <span className="text-white/45" style={{ fontFamily: inter }}>Trenér: {team.coach}</span>
          </div>
          <div className="w-20 h-1 bg-[#6EE76D] rounded-full mt-6" />
        </div>
      </section>

      {/* Sticky submenu */}
      <div className="sticky top-16 lg:top-20 z-40 bg-[#080C08]/95 backdrop-blur-md border-b border-[#6EE76D]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-1" style={{ scrollbarWidth: "none" }}>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`px-5 py-3 uppercase tracking-wider text-[17px] transition-all whitespace-nowrap cursor-pointer relative ${
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

      {/* ── PŘEHLED ── */}
      <section id="prehled" ref={(el) => { sectionRefs.current["prehled"] = el; }} className="py-16 lg:py-20 scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="text-[#6EE76D] text-sm tracking-[0.2em] uppercase mb-3 block" style={{ fontFamily: bebas }}>O družstvu</span>
              <h2 className="text-3xl lg:text-4xl text-white uppercase mb-6" style={{ fontFamily: bebas }}>{team.name}</h2>
              <p className="text-white/50 text-lg mb-6" style={{ fontFamily: inter }}>{team.longDesc}</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-[#0e160e] border border-[#6EE76D]/8">
                  <div className="text-3xl text-[#6EE76D]" style={{ fontFamily: bebas }}>{team.playerCount}</div>
                  <div className="text-white/35 text-sm" style={{ fontFamily: inter }}>Hráček</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#0e160e] border border-[#6EE76D]/8">
                  <div className="text-3xl text-[#6EE76D]" style={{ fontFamily: bebas }}>{team.trainings.length}×</div>
                  <div className="text-white/35 text-sm" style={{ fontFamily: inter }}>Tréninků týdně</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#6EE76D]" />
                  <span className="text-white/60" style={{ fontFamily: inter }}>Trenér: <span className="text-white">{team.coach}</span></span>
                </div>
                {team.assistantCoach && (
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-[#6EE76D]/60" />
                    <span className="text-white/60" style={{ fontFamily: inter }}>Asistent: <span className="text-white">{team.assistantCoach}</span></span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-[4/3] border border-[#6EE76D]/10">
              <ImageWithFallback src={team.img} alt={team.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ── TRÉNINKY ── */}
      <section id="treninky" ref={(el) => { sectionRefs.current["treninky"] = el; }} className="py-16 lg:py-20 bg-[#0e160e]/30 scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-[#6EE76D] text-sm tracking-[0.2em] uppercase mb-3 block" style={{ fontFamily: bebas }}>Rozvrh</span>
          <h2 className="text-3xl lg:text-4xl text-white uppercase mb-8" style={{ fontFamily: bebas }}>Tréninky</h2>

          <div className="space-y-3 max-w-2xl">
            {team.trainings.map((t, i) => (
              <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-[#0e160e] border border-[#6EE76D]/8">
                <div className="w-12 h-12 rounded-full bg-[#6EE76D]/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-[#6EE76D]" />
                </div>
                <div className="flex-1">
                  <span className="text-white text-lg" style={{ fontFamily: bebas, letterSpacing: "0.05em" }}>{t.day}</span>
                  <div className="flex items-center gap-4 text-sm text-white/40 mt-0.5">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {t.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {t.hall}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HRÁČKY ── */}
      <section id="hracky" ref={(el) => { sectionRefs.current["hracky"] = el; }} className="py-16 lg:py-20 scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-[#6EE76D] text-sm tracking-[0.2em] uppercase mb-3 block" style={{ fontFamily: bebas }}>Soupiska</span>
          <h2 className="text-3xl lg:text-4xl text-white uppercase mb-8" style={{ fontFamily: bebas }}>Hráčky</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {team.players.map((p, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[#0e160e] border border-[#6EE76D]/8 hover:border-[#6EE76D]/20 transition-all">
                <div className="w-12 h-12 rounded-full bg-[#6EE76D]/10 flex items-center justify-center flex-shrink-0">
                  {p.number ? (
                    <span className="text-[#6EE76D] text-lg" style={{ fontFamily: bebas }}>{p.number}</span>
                  ) : (
                    <Users className="w-5 h-5 text-[#6EE76D]" />
                  )}
                </div>
                <div>
                  <div className="text-white" style={{ fontFamily: inter }}>{p.name}</div>
                  <div className="text-white/35 text-sm" style={{ fontFamily: inter }}>{p.position}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AKTUALITY ── */}
      <section id="aktuality" ref={(el) => { sectionRefs.current["aktuality"] = el; }} className="py-16 lg:py-20 bg-[#0e160e]/30 scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-[#6EE76D] text-sm tracking-[0.2em] uppercase mb-3 block" style={{ fontFamily: bebas }}>Novinky</span>
          <h2 className="text-3xl lg:text-4xl text-white uppercase mb-8" style={{ fontFamily: bebas }}>Aktuality</h2>

          <div className="space-y-3 max-w-2xl">
            {team.news.map((n, i) => (
              <div key={i} className="p-5 rounded-2xl bg-[#0e160e] border border-[#6EE76D]/8 hover:border-[#6EE76D]/25 transition-all group cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-white/35 text-sm">{n.date}</span>
                    <h3 className="text-white mt-1 group-hover:text-[#6EE76D] transition-colors" style={{ fontFamily: inter }}>{n.title}</h3>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/15 group-hover:text-[#6EE76D] transition-colors flex-shrink-0 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other teams */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl text-white uppercase mb-8" style={{ fontFamily: bebas }}>Další družstva</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAMS.filter((t) => t.slug !== slug).map((t) => (
              <Link
                key={t.slug}
                to={`/druzstva/${t.slug}`}
                className="p-5 rounded-2xl bg-[#0e160e] border border-[#6EE76D]/8 hover:border-[#6EE76D]/25 transition-all group"
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
