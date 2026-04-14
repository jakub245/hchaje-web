import { useState, useEffect, useRef } from "react";
import { useParams, Link, Navigate } from "react-router";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Mars,
  Venus,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { bebas, inter, CtaStrip } from "../components/shared";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { getTeamBySlug, TEAMS } from "../data/teams";

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

const isFemaleName = (name: string) => normalizeText(name.split(" ")[0] || "").endsWith("a");

export default function DruzstvoDetail() {
  const { slug } = useParams();
  const team = getTeamBySlug(slug || "");
  const [active, setActive] = useState("prehled");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const playersScrollRef = useRef<HTMLDivElement | null>(null);
  const newsScrollRef = useRef<HTMLDivElement | null>(null);

  const teamPlayerPhotos = import.meta.glob("../../imports/foto/*/*.{jpg,jpeg,png}", { eager: true, as: "url" }) as Record<string, string>;

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
  const isPripravkaTeam = team.slug === "pripravka";
  const isKidsTeam = isMiniTeam || isPripravkaTeam;

  const scrollPlayers = (direction: number) => {
    playersScrollRef.current?.scrollBy({ left: direction * 900, behavior: "smooth" });
  };

  const scrollNews = (direction: number) => {
    newsScrollRef.current?.scrollBy({ left: direction * 900, behavior: "smooth" });
  };

  const getTeamPhoto = (name: string) => {
    const normalizedName = normalizeText(name);
    const surname = normalizeText(name.split(" ")[0] || "");
    const currentTeamSlug = normalizeText(team.slug);

    for (const [path, url] of Object.entries(teamPlayerPhotos)) {
      const normalizedPath = normalizeText(path);
      if (!normalizedPath.includes(currentTeamSlug)) continue;
      if (normalizedPath.includes(normalizedName) || normalizedPath.includes(surname)) {
        return url;
      }
    }

    return "";
  };

  const newsSorted = [...team.news].sort((a, b) => parseCzDate(b.date) - parseCzDate(a.date));

  const displayedEvents = isMiniTeam
    ? [
        { date: "18.04.2026", title: "Turnaj 6+1", location: "hala ZŠ a MŠ Chýně" },
        { date: "25.04.2026", title: "Turnaj 4+1", location: "hala Kobylisy" },
        { date: "02.05.2026", title: "Memoriál Karla Šulce 4+1", location: "Plzeň" },
        { date: "08.05.2026\naž\n10.05.2026", title: "MEMORIÁL KARLA ŠULCE 2026", location: "Plzeň" },
      ]
    : isPripravkaTeam
      ? [
          { date: "25.04.2026", title: "Turnaj 4+1", location: "hala Kobylisy" },
          { date: "02.05.2026", title: "Memoriál Karla Šulce 4+1", location: "Plzeň" },
          { date: "17.05.2026", title: "Turnaj 4+1", location: "" },
          { date: "30.05.2026", title: "Turnaj 4+1\nPořadatelství HC Háje", location: "Hřiště HC Háje" },
          { date: "06.06.2026", title: "Mináček 4+1\n2017 a mladší", location: "DHC Slavia" },
          { date: "14.06.2026", title: "Závěrečný turnaj 4+1", location: "Astra" },
        ]
      : (team.events ?? []).map((event) => ({
          date: event.date,
          title: event.title,
          location: event.location,
        }));
  const displayedStaff = isMiniTeam
    ? [
        { name: "Petr Zálešák", phone: "777 721 282", email: "minihchaje@gmail.com" },
        { name: "Kateřina Bláhová", phone: "608 981 667", email: "minihchaje@gmail.com" },
        { name: "Veronika Zálešáková", phone: "", email: "" },
        { name: "Barbora Bláhová", phone: "", email: "" },
      ]
    : isPripravkaTeam
      ? [
          { name: "Kateřina Bláhová", phone: "608 981 667", email: "pripravkahchaje@gmail.com" },
          { name: "Petr Paulín", phone: "", email: "" },
          { name: "Nela Černá", phone: "", email: "" },
        ]
      : [
          { name: team.coach, phone: "", email: "" },
          ...(team.assistantCoach ? [{ name: team.assistantCoach, phone: "", email: "" }] : []),
        ];
  const displayedNews = isMiniTeam
    ? [
        {
          title: "5+1 v Heroldových sadech",
          date: "03.03.2025",
          excerpt:
            "Druhá polovina sezóny je tu a naše MINI se dnes zúčastnily svazového turnaje 5+1 v hale Sokol Vršovice. Za skvělé podpory našich fanoušků se hájecké bojovnice utkaly s týmy Kobylek, Slávie, Vršovic, Chodova a Dukly. Hrály s nadšením a zápas od zápasu...",
        },
        {
          title: "Mladší dorostenky dnes přivezly důležité 2 body z Českých Budějovic.",
          date: "15.02.2025",
          excerpt:
            "INFARKTOVÝ ZÁPAS, ALE NAŠE BABY TO DOTÁHLY DO VÍTĚZNÉHO KONCE! Tohle nebyl zápas pro slabé povahy. Kdo neměl nervy z ocele, ten si je dneska solidně pocuchal. Od první minuty se jelo bomby – jeden gól tam, druhý zpátky, fauly, drama, emoce až do nebes...",
        },
        {
          title: "Dvojitá porce házené pro naše mladší žákyně!",
          date: "09.02.2025",
          excerpt:
            "V pátek si holky zahrály hned dva přátelské zápasy – nejprve proti TJ Sokol Vršovice a poté proti TJ Chodov. První utkání bylo opatrné, jako by holky na hřišti teprve hledaly jistotu. Přihrávky občas postrádaly přesnost a chyběla dravost v obraně, ale...",
        },
      ]
    : isPripravkaTeam
      ? [
          {
            title: "Mladší dorostenky dnes přivezly důležité 2 body z Českých Budějovic.",
            date: "15.02.2025",
            excerpt:
              "INFARKTOVÝ ZÁPAS, ALE NAŠE BABY TO DOTÁHLY DO VÍTĚZNÉHO KONCE! Tohle nebyl zápas pro slabé povahy. Kdo neměl nervy z ocele, ten si je dneska solidně pocuchal. Od první minuty se jelo bomby – jeden gól tam, druhý zpátky, fauly, drama, emoce až do nebes...",
          },
          {
            title: "Dvojitá porce házené pro naše mladší žákyně!",
            date: "09.02.2025",
            excerpt:
              "V pátek si holky zahrály hned dva přátelské zápasy – nejprve proti TJ Sokol Vršovice a poté proti TJ Chodov. První utkání bylo opatrné, jako by holky na hřišti teprve hledaly jistotu. Přihrávky občas postrádaly přesnost a chyběla dravost v obraně, ale...",
          },
          {
            title: "Zimní příprava žen \"A\" a části mladšího dorostu",
            date: "05.02.2025",
            excerpt:
              "Ve dnech 1.2. až 3.2.2025 proběhl v Železném Brodě zimní přípravný kemp \"A\" družstva žen a části mladšího dorostu, kde se hráčky připravovaly na blížící se druhou část soutěžní sezony 2024 - 2025.",
          },
        ]
      : newsSorted.map((item) => ({
          ...item,
          excerpt: "Nejnovější aktualita z týmu.",
        }));

  const trainingBlocks = isMiniTeam
    ? [
        {
          title: "Tréninky září, květen - červen",
          items: [
            { day: "pondělí", time: "17:00 - 18:30", place: "hala TJ JM Chodov" },
            { day: "úterý", time: "16:30 - 18:00", place: "hřiště" },
            { day: "čtvrtek", time: "16:30 - 18:00", place: "hřiště" },
          ],
        },
        {
          title: "Tréninky říjen - duben",
          items: [
            { day: "pondělí", time: "17:00 - 18:30", place: "hala TJ JM Chodov" },
            { day: "úterý", time: "17:15 - 18:45", place: "tělocvična ZŠ K Milíčovu" },
            { day: "čtvrtek", time: "16:30 - 18:00", place: "tělocvična ZŠ Mendelova" },
          ],
        },
      ]
    : isPripravkaTeam
      ? [
          {
            title: "Tréninky září, květen - červen",
            items: [
              { day: "úterý", time: "17:00 - 18:30", place: "hřiště" },
              { day: "čtvrtek", time: "17:00 - 18:30", place: "hřiště" },
            ],
          },
          {
            title: "Tréninky říjen - duben",
            items: [
              { day: "úterý", time: "17:15 - 18:45", place: "tělocvišna ZŠ K Milíčovu" },
              { day: "čtvrtek", time: "16:30 - 18:00", place: "tělocvišna ZŠ Mendelova" },
            ],
          },
        ]
      : [];
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

      <div className="sticky top-16 lg:top-20 z-40 bg-[#080C08]/95 backdrop-blur-md border-b border-[#6EE76D]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

      <section id="treninky" ref={(el) => { sectionRefs.current["treninky"] = el; }} className="py-16 lg:py-20 bg-[#0e160e]/30 scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-[#6EE76D] text-sm tracking-[0.2em] uppercase mb-3 block" style={{ fontFamily: bebas }}>Rozvrh</span>
          <h2 className="text-3xl lg:text-4xl text-white uppercase mb-8" style={{ fontFamily: bebas }}>Tréninky</h2>

          {isKidsTeam ? (
            <div className="space-y-10">
              {trainingBlocks.map((block) => (
                <div key={block.title}>
                  <h3 className="text-2xl text-white mb-4" style={{ fontFamily: bebas }}>{block.title}</h3>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {block.items.map((item) => (
                      <div key={item.day + item.time} className="rounded-3xl border border-[#6EE76D]/8 bg-[#0e160e] p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#6EE76D]/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-[#6EE76D]" />
                          </div>
                          <div className="text-white text-xl" style={{ fontFamily: bebas }}>{item.day}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm" style={{ fontFamily: inter }}>
                          <div>
                            <div className="text-white/40 mb-1">Čas</div>
                            <div className="text-white/80">{item.time}</div>
                          </div>
                          <div>
                            <div className="text-white/40 mb-1">Místo</div>
                            <div className="text-white/80">{item.place}</div>
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
                <div key={i} className="min-w-[18rem] flex-shrink-0 p-5 rounded-3xl bg-[#0e160e] border border-[#6EE76D]/8 hover:border-[#6EE76D]/20 transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#6EE76D]/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#6EE76D]" />
                    </div>
                    <div>
                      <div className="text-sm uppercase tracking-[0.2em] text-white/40" style={{ fontFamily: bebas }}>Trénink</div>
                      <div className="text-white/70 text-sm mt-1">{t.hall}</div>
                    </div>
                  </div>
                  <div className="text-2xl text-white" style={{ fontFamily: bebas }}>{t.day}</div>
                  <div className="text-white/40 mt-1">{t.time}</div>
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
                  <div key={i} className={`grid gap-4 md:grid-cols-[1fr_1.4fr_1fr] py-5 ${i !== 0 ? "border-t border-[#6EE76D]/15" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#6EE76D]/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-[#6EE76D]" />
                      </div>
                      <div>
                        <div className="text-white/45 text-sm md:hidden" style={{ fontFamily: inter }}>Datum</div>
                        <div className="text-white text-[1.2rem] whitespace-pre-line" style={{ fontFamily: bebas }}>{event.date}</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div>
                        <div className="text-white/45 text-sm md:hidden mb-1" style={{ fontFamily: inter }}>Akce</div>
                        <div className="text-white/75 text-base whitespace-pre-line" style={{ fontFamily: inter }}>{event.title}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#6EE76D]/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-[#6EE76D]" />
                      </div>
                      <div>
                        <div className="text-white/45 text-sm md:hidden" style={{ fontFamily: inter }}>Místo</div>
                        <div className="text-white/75 whitespace-pre-line" style={{ fontFamily: inter }}>{event.location}</div>
                      </div>
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
            {isKidsTeam && (
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

          {isKidsTeam ? (
            <div ref={playersScrollRef} className="flex gap-4 overflow-x-auto pb-4 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {team.players.map((p, i) => {
                const photo = getTeamPhoto(p.name);
                return (
                  <div key={i} className="min-w-[16rem] md:min-w-[calc((100%-1rem)/2)] lg:min-w-[calc((100%-2rem)/3)] xl:min-w-[calc((100%-3rem)/4)] flex-shrink-0 h-[21rem] rounded-3xl bg-[#0e160e] border border-[#6EE76D]/8 hover:border-[#6EE76D]/20 transition-all p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-[#6EE76D]/10 border border-[#6EE76D]/20 flex items-center justify-center mb-5">
                      {photo ? (
                        <ImageWithFallback src={photo} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-8 h-8 text-[#6EE76D]" />
                      )}
                    </div>
                    <div className="text-white text-lg" style={{ fontFamily: inter }}>{p.name}</div>
                    <div className="text-white/45 text-sm mt-2" style={{ fontFamily: inter }}>Ročník {p.position}</div>
                    <div className="text-[#6EE76D] text-2xl mt-3" style={{ fontFamily: bebas }}>{p.number}</div>
                  </div>
                );
              })}
            </div>
          ) : (
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
          )}
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
                    <div className="w-10 h-10 rounded-2xl bg-[#6EE76D]/10 flex items-center justify-center flex-shrink-0">
                      {isFemaleName(member.name) ? <Venus className="w-4 h-4 text-[#6EE76D]" /> : <Mars className="w-4 h-4 text-[#6EE76D]" />}
                    </div>
                    <div>
                      <div className="text-white/45 text-sm md:hidden" style={{ fontFamily: inter }}>Jméno</div>
                      <div className="text-white text-lg" style={{ fontFamily: inter }}>{member.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div>
                      <div className="text-white/45 text-sm md:hidden mb-1" style={{ fontFamily: inter }}>Telefon</div>
                      <div className="text-white/75" style={{ fontFamily: inter }}>{member.phone || "—"}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div>
                      <div className="text-white/45 text-sm md:hidden mb-1" style={{ fontFamily: inter }}>E-mail</div>
                      <div className="text-white/75 break-all" style={{ fontFamily: inter }}>{member.email || "—"}</div>
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
              <article key={i} className="basis-[18rem] md:basis-[calc((100%-1rem)/2)] xl:basis-[calc((100%-2rem)/3)] flex-shrink-0 p-6 rounded-3xl bg-[#0e160e] border border-[#6EE76D]/8 hover:border-[#6EE76D]/25 transition-all group">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white/35 text-sm" style={{ fontFamily: inter }}>{n.date}</span>
                  {i === 0 && (
                    <span className="inline-flex items-center rounded-full bg-[#6EE76D]/10 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-[#6EE76D]" style={{ fontFamily: inter }}>
                      NOVÉ
                    </span>
                  )}
                </div>
                <h3 className="text-white mt-4 text-xl" style={{ fontFamily: inter }}>{n.title}</h3>
                <p
                  className="mt-4 text-white/55 text-sm leading-6 min-h-[4.5rem]"
                  style={{
                    fontFamily: inter,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {n.excerpt}
                </p>
                <Link
                  to={`/aktuality/${normalizeText(n.title)}`}
                  state={{ article: n, backTo: `/druzstva/${team.slug}#aktuality` }}
                  className="mt-5 inline-flex text-[#6EE76D] text-sm uppercase tracking-[0.18em] hover:text-white transition-colors"
                  style={{ fontFamily: bebas }}
                >
                  Zobrazit celou aktualitu
                </Link>
              </article>
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
