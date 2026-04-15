import { Target, Heart, Award, Users, Building2, UserRound } from "lucide-react";
import { PageHero, Btn, CtaStrip, SectionLabel, bebas, inter, CONTACT_EMAIL, nbspShortWords } from "../components/shared";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { TEAMS } from "../data/teams";

const VALUES = [
  { icon: Heart, title: "Vášeň", desc: "Házená není jen sport — je to způsob života. Každý trénink dáváme maximum." },
  { icon: Users, title: "Komunita", desc: "Jsme víc než tým. Jsme rodina, která se vzájemně podporuje na hřišti i mimo něj." },
  { icon: Target, title: "Rozvoj", desc: "Každá hráčka se u nás posouvá — ať už v technice, taktice nebo osobním růstu." },
  { icon: Award, title: "Fair play", desc: "Respekt k soupeřkám, rozhodčím i sobě navzájem je základ všeho, co děláme." },
];

const MILESTONES = [
  { year: "1980", text: "Založení oddílu házené HC Háje." },
  { year: "6–8 let", text: "Přípravka rozvíjí sportovní základy formou her a soutěží." },
  { year: "9–11 let", text: "Minižákyně navazují na přípravku a seznamují se se základy házené." },
  { year: "13+", text: "Navazující žákovské a dorostenecké kategorie sbírají zkušenosti i úspěchy v soutěžích." },
  { year: "Dnes", text: "Hlavním cílem klubu je nadchnout co nejvíce dětí pro pravidelné sportování." },
];

const COACH_DIRECTORY: Record<string, { age?: string }> = {
  "Petr Zálešák": { age: "36 let" },
  "Kateřina Bláhová": { age: "34 let" },
  "Veronika Zálešáková": { age: "32 let" },
  "Barbora Bláhová": { age: "31 let" },
  "Petr Paulín": { age: "38 let" },
  "Nela Černá": { age: "30 let" },
  "Mgr. Jana Dvořáková": { age: "40 let" },
  "Petr Novák": { age: "37 let" },
  "Kateřina Malá": { age: "33 let" },
};

const COACHES = Array.from(
  TEAMS.flatMap((team) => [
    { name: team.coach, teamName: team.name },
    ...(team.assistantCoach ? [{ name: team.assistantCoach, teamName: team.name }] : []),
  ]).reduce((map, item) => {
    const existing = map.get(item.name) ?? {
      name: item.name,
      teams: [] as string[],
      age: COACH_DIRECTORY[item.name]?.age,
    };

    if (!existing.teams.includes(item.teamName)) {
      existing.teams.push(item.teamName);
    }

    map.set(item.name, existing);
    return map;
  }, new Map<string, { name: string; teams: string[]; age?: string }>()).values(),
).sort((a, b) => a.name.localeCompare(b.name, "cs"));

export default function OKlubuPage() {
  return (
    <>
      <PageHero title="O klubu" subtitle="Poznejte příběh HC Háje — od založení až po současnost." />

      {/* Intro */}
      <section className="reveal-on-scroll pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-white text-lg mb-4" style={{ fontFamily: inter }}>
                {nbspShortWords("HC Háje je dívčí a ženský házenkářský klub z Prahy 4, který patří od svého založení v roce 1980 mezi výrazná centra dívčí házené v Praze i v rámci celé České republiky.")}
              </p>
              <p className="text-white/55 mb-4" style={{ fontFamily: inter }}>
                {nbspShortWords("Klub je zaměřený na dlouhodobou sportovní přípravu děvčat od 6 do 17 let. V nejmladších kategoriích stavíme na pohybových hrách, soutěžích a všeobecné sportovní průpravě, na které postupně navazují další házenkářské dovednosti.")}
              </p>
              <p className="text-white/55 mb-8" style={{ fontFamily: inter }}>
                {nbspShortWords("Na žákovské a dorostenecké kategorie navazují ženská družstva. Vedle sportovních výsledků je naším hlavním cílem získat a nadchnout co nejvíce dětí pro pravidelné sportování a vytvořit prostředí, kam se budou rády vracet.")}
              </p>

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
              <Btn variant="primary" to="/kontakty">Přijdu na trénink</Btn>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1769614075229-bfc51a41aa78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMHRlYW0lMjB0cmFpbmluZyUyMGluZG9vcnxlbnwxfHx8fDE3NzYwODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="p-6 rounded-2xl bg-[#0e160e] border border-[#6EE76D]/8 hover:border-[#6EE76D]/20 transition-all">
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
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel>Trenéři</SectionLabel>
          <h2 className="text-3xl lg:text-4xl text-white uppercase mb-12" style={{ fontFamily: bebas }}>Kdo vede naše družstva</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {COACHES.map((coach) => (
              <div key={coach.name} className="mobile-solid-card rounded-3xl bg-[#101a10] border border-[#6EE76D]/12 hover:border-[#6EE76D]/25 transition-all p-6 flex flex-col items-center justify-center text-center min-h-[22rem]">
                <div className="mobile-solid-chip w-24 h-24 rounded-full overflow-hidden bg-[#6EE76D]/14 border border-[#6EE76D]/20 flex items-center justify-center mb-5">
                  <UserRound className="w-10 h-10 text-[#6EE76D]" />
                </div>

                <div className="text-white text-[18px]" style={{ fontFamily: inter }}>{coach.name}</div>
                <div className="text-white/45 text-sm mt-2" style={{ fontFamily: inter }}>{coach.age || "35 let"}</div>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {coach.teams.map((teamName) => (
                    <span key={teamName} className="px-3.5 py-1 rounded-full bg-[#6EE76D]/10 text-[#6EE76D] text-[12px] tracking-[0.12em]" style={{ fontFamily: bebas }}>
                      {teamName}
                    </span>
                  ))}
                </div>
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
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[#6EE76D]/15" />
            <div className="space-y-8">
              {MILESTONES.map((m) => (
                <div key={m.year} className="flex items-start gap-6 relative">
                  <div className="w-10 h-10 rounded-full bg-[#6EE76D]/10 border-2 border-[#6EE76D]/30 flex items-center justify-center flex-shrink-0 z-10">
                    <div className="w-3 h-3 rounded-full bg-[#6EE76D]" />
                  </div>
                  <div>
                    <span className="text-[#6EE76D] text-xl" style={{ fontFamily: bebas }}>{m.year}</span>
                    <p className="text-white/50 mt-1" style={{ fontFamily: inter }}>{nbspShortWords(m.text)}</p>
                  </div>
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
