import { useState, useEffect } from "react";
import { Target, Heart, Award, Users, Building2, UserRound, ArrowRight, ChevronDown } from "lucide-react";
import { PageHero, Btn, CtaStrip, SectionLabel, bebas, inter, CONTACT_EMAIL, nbspShortWords } from "../components/shared";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { TEAMS } from "../data/teams";
import hriste5Photo from "../../imports/foto/hriste5.jpg";

const VALUES = [
  { icon: Heart, title: "Vášeň", desc: "Házená není jen sport — je to způsob života. Každý trénink dáváme maximum." },
  { icon: Users, title: "Komunita", desc: "Jsme víc než tým. Jsme rodina, která se vzájemně podporuje na hřišti i mimo něj." },
  { icon: Target, title: "Rozvoj", desc: "Každá hráčka se u nás posouvá — ať už v technice, taktice nebo osobním růstu." },
  { icon: Award, title: "Fair play", desc: "Respekt k soupeřkám, rozhodčím i sobě navzájem je základ všeho, co děláme." },
];

const MILESTONES = [
  { year: "1980", text: "Založení klubu házené HC Háje." },
  { year: "1985", text: "Budování zázemí klubu v areálu TJ Háje nad Hostivařskou přehradou." },
  { year: "1995", text: "Získání samostatné právní subjektivity." },
  { year: "2014", text: "Nový umělý povrch hřiště." },
  { year: "2019", text: "První vlastní družstvo staršího dorostu." },
  { year: "2020", text: "První vlastní družstvo žen v ligové soutěži." },
  { year: "Dnes", text: "Přes 45 let tradice. Každý den nové začátky." },
];

const CLUB_STORY_PARAGRAPHS = [
  "HC Háje je klub s dlouholetou tradicí, jehož příběh se začal psát v roce 1980. Tehdy skupina nadšenců přišla do tehdejší Tělovýchovné jednoty Háje s jasnou vizí - vytvořit prostor pro práci s mládeží a nabídnout dětem možnost sportovního rozvoje prostřednictvím házené. První tréninky probíhaly na Jižním Městě, zejména na hřištích Modré školy a ZŠ Mikulova. Klub měl zpočátku chlapecká i dívčí družstva, postupem času se však zaměřil na dívčí házenou, která je jeho hlavním zaměřením dodnes.",
  "Zásadním milníkem se stal rok 1985, kdy klub začal využívat sportovní areál nad Hostivařskou přehradou, který se stal jeho domovem. Na budování klubového zázemí se tehdy významně podíleli trenéři, rodiče, hráčky i další podporovatelé, kteří společnými silami pomohli vytvořit prostředí pro sport i klubový život. Od té doby areál průběžně modernizujeme - od nového sportovního povrchu až po obnovu šaten a zázemí - tak, aby poskytoval kvalitní podmínky pro tréninky, zápasy i společná setkání.",
  "V HC Háje věříme, že sport je mnohem víc než jen výsledky. Dětem nabízíme prostředí, kde rozvíjejí pohybové schopnosti, týmového ducha, disciplínu i zdravé sebevědomí. Stejně důležité jsou pro nás přátelské vztahy, radost z pohybu a pocit, že každý v klubu někam patří. Zakládáme si na individuálním přístupu a prostředí, ve kterém se děti cítí bezpečně, motivovaně a mají chuť sportovat dlouhodobě.",
  "Významným krokem v rozvoji klubu byla sezona 2019/2020, kdy se podařilo rozšířit strukturu družstev o kategorii staršího dorostu. O rok později nastoupilo poprvé také ženské A družstvo v ligové soutěži. Díky tomu dnes nabízíme kompletní návaznost týmů od minižákyň až po ženy, což umožňuje hráčkám vyrůstat v jednom prostředí, dlouhodobě rozvíjet svůj talent a zůstávat součástí klubové komunity i v dospělosti.",
  "Za více než čtyři desetiletí prošly dresem HC Háje stovky hráček a své první házenkářské kroky zde udělala i řada budoucích reprezentantek. Velkou zásluhu na tom mají také desítky trenérů, rodičů a dobrovolníků, kteří klub po celou dobu jeho existence spoluvytvářeli. Díky jejich energii, nadšení a práci je dnes HC Háje stabilní a respektovanou součástí české házené.",
  "HC Háje je místem, kde hráčky rostou nejen jako sportovkyně, ale i jako osobnosti - s radostí ze sportu, přáteli a zkušenostmi na celý život.",
];



type CoachItem = {
  id: string;
  name: string;
  position: string;
  teamName: string;
  teamSlug: string;
  phone: string;
  email: string;
  photoUrl: string;
  age: string;
};

type ApiCoach = Partial<CoachItem>;

export default function OKlubuPage() {
  const [coaches, setCoaches] = useState<CoachItem[]>([]);
  const [coachesLoading, setCoachesLoading] = useState(true);
  const [coachesLoaded, setCoachesLoaded] = useState(false);
  const [storyExpanded, setStoryExpanded] = useState(false);

  useEffect(() => {
    let activeRequest = true;

    const loadCoaches = async () => {
      setCoachesLoading(true);
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
            photoUrl: item.photoUrl || "",
            age: item.age || "",
          }))
          .sort((a, b) => a.name.localeCompare(b.name, "cs"));

        if (!activeRequest) return;
        setCoaches(normalizedCoaches);
        setCoachesLoading(false);
        setCoachesLoaded(true);
      } catch {
        if (!activeRequest) return;
        setCoaches([]);
        setCoachesLoading(false);
        setCoachesLoaded(true);
      }
    };

    loadCoaches();

    return () => {
      activeRequest = false;
    };
  }, []);

  return (
    <>
      <PageHero title="O klubu" subtitle="Poznejte příběh HC Háje — od založení až po současnost." />

      {/* Intro */}
      <section className="reveal-on-scroll pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <SectionLabel>Historie klubu</SectionLabel>
              <h2 className="text-3xl lg:text-4xl text-white uppercase mb-6" style={{ fontFamily: bebas }}>
                HC Háje - více než 40 let házenkářské tradice
              </h2>
              <p className="text-white text-lg mb-4" style={{ fontFamily: inter }}>
                {nbspShortWords("HC Háje je klub s dlouholetou tradicí, jehož příběh se začal psát v roce 1980. Na Jižním Městě jsme vyrostli v respektovaný dívčí a ženský házenkářský klub, který staví na práci s mládeží, komunitě a dlouhodobém sportovním rozvoji.")}
              </p>
              <p className="text-white/55 mb-4" style={{ fontFamily: inter }}>
                {nbspShortWords("Dnes nabízíme návaznost týmů od minižákyň až po ženy a prostředí, kde hráčky rostou nejen sportovně, ale i lidsky. Celý příběh klubu a důležité souvislosti najdete po kliknutí níže.")}
              </p>

              <button
                type="button"
                onClick={() => setStoryExpanded((prev) => !prev)}
                className="inline-flex items-center gap-2 text-[#6EE76D] hover:text-[#9CF59B] transition-colors mb-8"
                style={{ fontFamily: inter }}
                aria-expanded={storyExpanded}
                aria-controls="club-story-details"
              >
                <span className="underline underline-offset-4 decoration-[#6EE76D]/70">
                  {storyExpanded ? "Skrýt podrobnosti" : "Zajímá mě více"}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${storyExpanded ? "rotate-180" : "rotate-0"}`} />
              </button>

              {storyExpanded && (
                <div id="club-story-details" className="space-y-5 mb-8">
                  {CLUB_STORY_PARAGRAPHS.map((paragraph) => (
                    <p key={paragraph.slice(0, 36)} className="text-white/70 leading-relaxed" style={{ fontFamily: inter }}>
                      {nbspShortWords(paragraph)}
                    </p>
                  ))}
                </div>
              )}

              <div className="rounded-2xl border border-[#6EE76D]/10 bg-[#0e160e] p-5 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#6EE76D]/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-[#6EE76D]" />
                  </div>
                  <div>
                    <div className="text-white mb-1" style={{ fontFamily: inter }}>
                      Tělovýchovná jednota Háje–Jižní Město, Handballclub, pobočný spolek
                    </div>
                    <div className="text-white/45 text-sm" style={{ fontFamily: inter }}>
                      IČO 629 38 045 • {CONTACT_EMAIL}
                    </div>
                  </div>
                </div>
              </div>
              <Btn variant="primary" to="/nabor#kontaktni-formular">
                Chci zkusit trénink <ArrowRight className="w-4 h-4" />
              </Btn>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <ImageWithFallback
                src={hriste5Photo}
                alt="HC Háje tým" className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border border-[#6EE76D]/10 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24 bg-[#0e160e]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel>Naše hodnoty</SectionLabel>
          <h2 className="text-3xl lg:text-4xl text-white uppercase mb-12" style={{ fontFamily: bebas }}>Co nás definuje</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="py-2">
                  <div className="w-12 h-12 rounded-full bg-[#6EE76D]/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#6EE76D]" />
                  </div>
                  <h3 className="text-white text-xl uppercase tracking-[0.08em] mb-2" style={{ fontFamily: bebas }}>{v.title}</h3>
                  <p className="text-white/40 text-sm" style={{ fontFamily: inter }}>{nbspShortWords(v.desc)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Coaches */}
      <section id="treneri" className="py-16 lg:py-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel>Trenéři</SectionLabel>
          <h2 className="text-3xl lg:text-4xl text-white uppercase mb-12" style={{ fontFamily: bebas }}>Kdo vede naše družstva</h2>
          {coachesLoading && (
            <div className="rounded-2xl bg-[#6EE76D]/5 border border-[#6EE76D]/20 px-4 py-3 mb-8 flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#6EE76D] animate-pulse" />
              <p className="text-[#6EE76D] text-sm" style={{ fontFamily: inter }}>Načítám data trenérů...</p>
            </div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {coaches.map((coach) => (
              <div key={coach.id} className="mobile-solid-card rounded-3xl bg-[#101a10] border border-[#6EE76D]/12 hover:border-[#6EE76D]/25 transition-all p-4 sm:p-6 flex flex-col items-center justify-center text-center min-h-[16rem] sm:min-h-[22rem]">
                <div className="mobile-solid-chip w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[#6EE76D]/14 border border-[#6EE76D]/20 flex items-center justify-center mb-3 sm:mb-5">
                  {coach.photoUrl ? (
                    <ImageWithFallback src={coach.photoUrl} alt={coach.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserRound className="w-7 h-7 sm:w-10 sm:h-10 text-[#6EE76D]" />
                  )}
                </div>

                <div className="text-white text-[15px] sm:text-[18px] leading-tight" style={{ fontFamily: inter }}>{coach.name}</div>
                {coach.age ? (
                  <div className="text-[#6EE76D] text-xs sm:text-sm mt-1" style={{ fontFamily: inter }}>{coach.age} let</div>
                ) : null}
                <div className="text-white/45 text-xs sm:text-sm mt-1.5 sm:mt-2" style={{ fontFamily: inter }}>{coach.position || "—"}</div>

                {coach.teamSlug && (
                  <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2">
                    <Btn
                      variant="secondary"
                      to={`/druzstva/${coach.teamSlug}`}
                      className="px-3 py-1 text-[11px] sm:text-[12px]"
                    >
                      {coach.teamName}
                    </Btn>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel>Historie</SectionLabel>
          <h2 className="text-3xl lg:text-4xl text-white uppercase mb-12" style={{ fontFamily: bebas }}>Milníky klubu</h2>
          <div className="relative">
            <div className="absolute left-5 -translate-x-1/2 top-5 bottom-5 w-px bg-[#6EE76D]/18" />
            <div className="space-y-5">
              {MILESTONES.map((m) => (
                <div key={m.year} className="flex items-start gap-6 relative">
                  <div className="w-10 h-10 rounded-full bg-[#6EE76D]/10 border-2 border-[#6EE76D]/30 flex items-center justify-center flex-shrink-0 z-10">
                    <div className="w-3 h-3 rounded-full bg-[#6EE76D]" />
                  </div>
                  <p className="text-white/75 leading-snug pt-2" style={{ fontFamily: inter }}>
                    <span className="text-[#6EE76D] text-xl align-middle" style={{ fontFamily: bebas }}>{m.year}</span>
                    <span className="text-white/35 mx-2 align-middle">/</span>
                    <span className="align-middle">{nbspShortWords(m.text)}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaStrip />
    </>
  );
}
