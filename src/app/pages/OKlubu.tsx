import { Target, Heart, Award, Users } from "lucide-react";
import { PageHero, Btn, CtaStrip, SectionLabel, bebas, inter } from "../components/shared";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const VALUES = [
  { icon: Heart, title: "Vášeň", desc: "Házená není jen sport — je to způsob života. Každý trénink dáváme maximum." },
  { icon: Users, title: "Komunita", desc: "Jsme víc než tým. Jsme rodina, která se vzájemně podporuje na hřišti i mimo něj." },
  { icon: Target, title: "Rozvoj", desc: "Každá hráčka se u nás posouvá — ať už v technice, taktice nebo osobním růstu." },
  { icon: Award, title: "Fair play", desc: "Respekt k soupeřkám, rozhodčím i sobě navzájem je základ všeho, co děláme." },
];

const MILESTONES = [
  { year: "2005", text: "Založení klubu HC Háje" },
  { year: "2008", text: "První účast v krajském přeboru" },
  { year: "2012", text: "Otevření mládežnických družstev" },
  { year: "2016", text: "Postup A-týmu do vyšší soutěže" },
  { year: "2020", text: "Přes 100 registrovaných hráček" },
  { year: "2024", text: "Rekonstrukce zázemí haly" },
  { year: "2026", text: "Semifinále krajského přeboru" },
];

export default function OKlubuPage() {
  return (
    <>
      <PageHero title="O klubu" subtitle="Poznejte příběh HC Háje — od založení až po současnost." />

      {/* Intro */}
      <section className="reveal-on-scroll pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-white/55 text-lg mb-4" style={{ fontFamily: inter }}>
                HC Háje je ženský házenkářský klub se sídlem v Praze 11 – Háje. Od roku 2005
                pěstujeme lásku k házené u dívek a žen všech věkových kategorií.
              </p>
              <p className="text-white/55 mb-4" style={{ fontFamily: inter }}>
                Náš klub je domovem pro více než 120 hráček — od šestiletých přípravkářek
                po zkušené hráčky A-týmu. Trénujeme v moderní Sportovní hale Háje s profesionálním
                zázemím a kvalifikovanými trenéry.
              </p>
              <p className="text-white/55 mb-8" style={{ fontFamily: inter }}>
                Cílem klubu není jen sportovní výkon, ale především budování komunity, rozvoj
                osobnosti a radost z pohybu. Každá hráčka je u nás vítaná — bez ohledu na
                zkušenosti či talent.
              </p>
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
                  <h3 className="text-white text-xl uppercase mb-2" style={{ fontFamily: bebas }}>{v.title}</h3>
                  <p className="text-white/40 text-sm" style={{ fontFamily: inter }}>{v.desc}</p>
                </div>
              );
            })}
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
                    <p className="text-white/50 mt-1" style={{ fontFamily: inter }}>{m.text}</p>
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
