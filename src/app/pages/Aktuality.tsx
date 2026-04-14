import { Link } from "react-router";
import { ChevronRight, Calendar } from "lucide-react";
import { PageHero, CtaStrip, bebas, inter } from "../components/shared";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const ALL_NEWS = [
  { id: 1, date: "10. 4. 2026", title: "A-tým postoupil do semifinále krajského přeboru", tag: "Zápasy", desc: "Naše ženy zvítězily v rozhodujícím zápase nad Slavií Praha 28:24 a postupují do semifinále krajského přeboru." },
  { id: 2, date: "7. 4. 2026", title: "Nábor nových hráček — přijďte si vyzkoušet házenou!", tag: "Nábor", desc: "Otevíráme nábor pro dívky ve věku 6–15 let. První trénink zdarma, stačí si přinést sportovní oblečení a dobrou náladu." },
  { id: 3, date: "2. 4. 2026", title: "Turnaj přípravek v Háji — výsledky a fotky", tag: "Turnaje", desc: "Uplynulý víkend se v naší hale konal turnaj přípravek. Zúčastnilo se 8 týmů z celé Prahy." },
  { id: 4, date: "28. 3. 2026", title: "Letní kemp 2026 — registrace otevřena", tag: "Kempy", desc: "Přihlašování na tradiční letní házenkářský kemp je spuštěno. Letos jedeme do Bechyně, 5.–12. července." },
  { id: 5, date: "20. 3. 2026", title: "Rozhovor s kapitánkou: Jak se žije házená v Háji", tag: "Rozhovory", desc: "Povídali jsme si s Terezou Novákovou o sezóně, cílech a životě v klubu." },
  { id: 6, date: "15. 3. 2026", title: "Nové dresy pro sezónu 2026/27", tag: "Klub", desc: "Představujeme nový design dresů, které budeme nosit od příští sezóny." },
  { id: 7, date: "8. 3. 2026", title: "Mezinárodní den žen — házená je náš sport!", tag: "Klub", desc: "Oslavili jsme MDŽ společným tréninkem všech družstev a dortem." },
  { id: 8, date: "1. 3. 2026", title: "Výsledky: Mladší žákyně zvítězily v derby", tag: "Zápasy", desc: "Mladší žákyně porazily rivala z Bohemians 18:12 v napínavém utkání." },
];

export default function AktualityPage() {
  return (
    <>
      <PageHero title="Aktuality" subtitle="Nejnovější zprávy a události z našeho klubu." />

      <section className="reveal-on-scroll pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {ALL_NEWS.map((item) => (
              <Link
                key={item.id}
                to={`/aktuality/${toSlug(item.title)}`}
                state={{ article: { title: item.title, date: item.date, excerpt: item.desc, content: item.desc }, backTo: "/aktuality" }}
                className="p-6 rounded-2xl bg-[#0e160e] border border-[#6EE76D]/8 hover:border-[#6EE76D]/25 transition-all group block"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-4 h-4 text-[#6EE76D]" />
                  <span className="text-white/35 text-sm">{item.date}</span>
                  <span className="px-3 py-0.5 rounded-full bg-[#6EE76D]/10 text-[#6EE76D] text-xs uppercase tracking-wider" style={{ fontFamily: bebas }}>{item.tag}</span>
                </div>
                <h3 className="text-white text-lg group-hover:text-[#6EE76D] transition-colors mb-2" style={{ fontFamily: inter }}>
                  {item.title}
                </h3>
                <p
                  className="text-white/40 text-sm mb-4"
                  style={{ fontFamily: inter, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                >
                  {item.desc}
                </p>
                <span className="text-[#6EE76D] text-sm uppercase tracking-[0.18em]" style={{ fontFamily: bebas }}>
                  Zobrazit celou aktualitu
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaStrip />
    </>
  );
}
