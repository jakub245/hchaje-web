import { Link, Navigate, useLocation, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { bebas, inter, nbspShortWords } from "../components/shared";

type Article = {
  title: string;
  date: string;
  excerpt?: string;
  content?: string;
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const FALLBACK_ARTICLES: Array<Article & { slug: string }> = [
  {
    slug: toSlug("5+1 v Heroldových sadech"),
    title: "5+1 v Heroldových sadech",
    date: "03.03.2025",
    content:
      "Druhá polovina sezóny je tu a naše MINI se dnes zúčastnily svazového turnaje 5+1 v hale Sokol Vršovice. Za skvělé podpory našich fanoušků se hájecké bojovnice utkaly s týmy Kobylek, Slávie, Vršovic, Chodova a Dukly. Hrály s nadšením a zápas od zápasu ukazovaly větší jistotu i chuť se zlepšovat.",
  },
  {
    slug: toSlug("Mladší dorostenky dnes přivezly důležité 2 body z Českých Budějovic."),
    title: "Mladší dorostenky dnes přivezly důležité 2 body z Českých Budějovic.",
    date: "15.02.2025",
    content:
      "INFARKTOVÝ ZÁPAS, ALE NAŠE BABY TO DOTÁHLY DO VÍTĚZNÉHO KONCE!\n\nTohle nebyl zápas pro slabé povahy. Kdo neměl nervy z ocele, ten si je dneska solidně pocuchal. Od první minuty se jelo bomby – jeden gól tam, druhý zpátky, fauly, drama, emoce až do nebes. Holky z Budějovic hrály fakt dobře, ale my? My jsme hrály jako LVICE, co prostě odmítají prohrát.\n\nKaždý náš útok byl jako výstřel z děla, obrana makala jak stroje a brankářka? Bohyně mezi tyčemi! Ke konci to bylo vyloženě na umření, ale my jsme se hecly, hodily tam poslední gól a… BOOM! Výhra je naše! Baby, dneska jste to tam nechaly všechno a byl to MASTERPIECE.\n\nHC Háje ml. dorky = nejlepší drama, co můžeš v životě zažít.",
  },
  {
    slug: toSlug("Dvojitá porce házené pro naše mladší žákyně!"),
    title: "Dvojitá porce házené pro naše mladší žákyně!",
    date: "09.02.2025",
    content:
      "V pátek si holky zahrály hned dva přátelské zápasy – nejprve proti TJ Sokol Vršovice a poté proti TJ Chodov. První utkání bylo opatrné, jako by holky na hřišti teprve hledaly jistotu. Postupně se ale zlepšovaly v obraně i kombinaci a celý dvojzápas byl cennou zkušeností.",
  },
  {
    slug: toSlug("A-tým postoupil do semifinále krajského přeboru"),
    title: "A-tým postoupil do semifinále krajského přeboru",
    date: "10. 4. 2026",
    content:
      "Naše ženy zvítězily v rozhodujícím zápase nad Slavií Praha 28:24 a postupují do semifinále krajského přeboru.",
  },
  {
    slug: toSlug("Nábor nových hráček — přijďte si vyzkoušet házenou!"),
    title: "Nábor nových hráček — přijďte si vyzkoušet házenou!",
    date: "7. 4. 2026",
    content:
      "Otevíráme nábor pro dívky ve věku 6–15 let. První trénink zdarma, stačí si přinést sportovní oblečení a dobrou náladu.",
  },
];

export default function AktualitaDetail() {
  const { articleSlug } = useParams();
  const location = useLocation();
  const state = location.state as { article?: Article; backTo?: string } | undefined;

  const fallbackArticle = FALLBACK_ARTICLES.find(
    (item) => item.slug === articleSlug || (state?.article?.title && item.slug === toSlug(state.article.title))
  );

  const article = state?.article
    ? {
        ...fallbackArticle,
        ...state.article,
        content: state.article.content ?? fallbackArticle?.content,
      }
    : fallbackArticle;

  if (!article) {
    return <Navigate to="/aktuality" replace />;
  }

  return (
    <section className="pt-24 pb-20 lg:pt-32 lg:pb-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to={state?.backTo || "/aktuality"}
          className="inline-flex items-center gap-2 text-white/50 hover:text-[#6EE76D] transition-colors mb-6"
          style={{ fontFamily: inter }}
        >
          <ArrowLeft className="w-4 h-4" /> Zpět na aktuality
        </Link>

        <div className="rounded-3xl border border-[#6EE76D]/8 bg-[#0e160e] p-6 lg:p-8">
          <div className="text-[#6EE76D] text-sm uppercase tracking-[0.2em] mb-3" style={{ fontFamily: bebas }}>
            Aktualita
          </div>
          <div className="text-white/45 text-sm mb-4" style={{ fontFamily: inter }}>
            {article.date}
          </div>
          <h1 className="text-3xl lg:text-5xl text-white uppercase mb-6" style={{ fontFamily: bebas }}>
            {nbspShortWords(article.title)}
          </h1>
          <div className="w-20 h-1 bg-[#6EE76D] rounded-full mb-6" />
          <div className="text-white/75 leading-8 whitespace-pre-line" style={{ fontFamily: inter }}>
            {nbspShortWords(article.content || article.excerpt || "")}
          </div>
        </div>
      </div>
    </section>
  );
}
