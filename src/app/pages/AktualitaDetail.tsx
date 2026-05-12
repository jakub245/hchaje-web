import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { bebas, inter, nbspShortWords } from "../components/shared";
import { getAllTeamNews } from "../data/teams";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

type MediaGallerySection = {
  type: "gallery";
  title: string;
  images: string[];
  caption?: string;
};

type MediaVideoSection = {
  type: "video";
  title: string;
  embedUrl?: string;
  videoUrl?: string;
  caption?: string;
};

type Article = {
  title: string;
  date: string;
  excerpt?: string;
  content?: string;
  mediaSections?: Array<MediaGallerySection | MediaVideoSection>;
};

type ApiNewsItem = {
  slug?: string;
  date?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  mediaSections?: Array<MediaGallerySection | MediaVideoSection>;
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const DEMO_GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1769614075229-bfc51a41aa78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  "https://images.unsplash.com/photo-1575367728985-8cb72541609a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  "https://images.unsplash.com/photo-1669046239665-5dcfc2ecc468?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  "https://images.unsplash.com/photo-1552127966-d24b805b9be7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  "https://images.unsplash.com/photo-1606519740551-1fa9e7c68a02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
];

const SHARED_ARTICLES = getAllTeamNews().map((item) => ({
  slug: toSlug(item.title),
  title: item.title,
  date: item.date,
  excerpt: item.excerpt,
  content: item.content,
}));

const FALLBACK_ARTICLES: Array<Article & { slug: string }> = [
  {
    slug: toSlug("5+1 v Heroldových sadech"),
    title: "5+1 v Heroldových sadech",
    date: "03.03.2025",
    content:
      "Druhá polovina sezóny je tu a naše MINI se dnes zúčastnily svazového turnaje 5+1 v hale Sokol Vršovice. Za skvělé podpory našich fanoušků se hájecké bojovnice utkaly s týmy Kobylek, Slávie, Vršovic, Chodova a Dukly. Hrály s nadšením a zápas od zápasu ukazovaly větší jistotu i chuť se zlepšovat.\n\nNíže je ukázka všech variant práce s médii v aktualitě — od jedné fotografie přes galerii až po vložené video.",
    mediaSections: [
      {
        type: "gallery",
        title: "Jedna fotografie na plnou šířku",
        images: [DEMO_GALLERY_IMAGES[0]],
        caption: "Jedna fotka se zobrazí přes celou šířku článku.",
      },
      {
        type: "gallery",
        title: "Dvě fotografie vedle sebe",
        images: [DEMO_GALLERY_IMAGES[0], DEMO_GALLERY_IMAGES[1]],
        caption: "Při dvou snímcích se galerie rozdělí na dvě stejné části.",
      },
      {
        type: "gallery",
        title: "Tři fotografie vedle sebe",
        images: [DEMO_GALLERY_IMAGES[0], DEMO_GALLERY_IMAGES[1], DEMO_GALLERY_IMAGES[2]],
        caption: "Při třech snímcích zůstanou všechny přehledně vedle sebe.",
      },
      {
        type: "gallery",
        title: "Čtyři a více fotografií s karuselem",
        images: DEMO_GALLERY_IMAGES,
        caption: "Při větším počtu fotek se zobrazí maximálně tři náhledy, šipky a ovládání karuselu pod galerií.",
      },
      {
        type: "video",
        title: "Embed videa",
        embedUrl: "https://www.youtube.com/embed/tgbNymZ7vqY",
        caption: "Ukázka vloženého videa přímo uvnitř aktuality.",
      },
      {
        type: "video",
        title: "Další video pod sebou",
        embedUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
        caption: "Stejně snadno lze pod jednu aktualitu vložit i více videí pod sebe.",
      },
    ],
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

function GalleryBlock({
  section,
  onOpen,
}: {
  section: MediaGallerySection;
  onOpen: (images: string[], index: number) => void;
}) {
  const [startIndex, setStartIndex] = useState(0);
  const isCarousel = section.images.length > 3;
  const maxStart = Math.max(section.images.length - 3, 0);
  const visibleImages = isCarousel ? section.images.slice(startIndex, startIndex + 3) : section.images;

  return (
    <div className="mt-10">
      <h3 className="text-white text-xl uppercase mb-3" style={{ fontFamily: bebas }}>
        {section.title}
      </h3>

      <div className={`grid gap-3 ${visibleImages.length === 1 ? "grid-cols-1" : visibleImages.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {visibleImages.map((image, index) => {
          const originalIndex = isCarousel ? startIndex + index : index;
          return (
            <button
              key={image + index}
              type="button"
              onClick={() => onOpen(section.images, originalIndex)}
              className="group relative overflow-hidden rounded-2xl border border-[#6EE76D]/12 bg-[#0d160d] aspect-[4/3]"
            >
              <ImageWithFallback src={image} alt={section.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <div className="absolute right-3 bottom-3 text-white/85 text-xs px-2 py-1 rounded-full bg-black/35" style={{ fontFamily: inter }}>
                Zvětšit
              </div>
            </button>
          );
        })}
      </div>

      {section.caption && (
        <p className="text-white/45 text-sm mt-3" style={{ fontFamily: inter }}>
          {nbspShortWords(section.caption)}
        </p>
      )}

      {isCarousel && (
        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStartIndex((current) => Math.max(current - 1, 0))}
              disabled={startIndex === 0}
              className="w-10 h-10 rounded-full border border-[#6EE76D]/20 flex items-center justify-center text-[#6EE76D] disabled:opacity-40"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setStartIndex((current) => Math.min(current + 1, maxStart))}
              disabled={startIndex === maxStart}
              className="w-10 h-10 rounded-full border border-[#6EE76D]/20 flex items-center justify-center text-[#6EE76D] disabled:opacity-40"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {Array.from({ length: maxStart + 1 }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setStartIndex(index)}
                className={`h-2 rounded-full transition-all ${startIndex === index ? "bg-[#6EE76D] w-6" : "bg-white/20 w-2"}`}
                aria-label={`Přejít na sadu ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VideoBlock({ section }: { section: MediaVideoSection }) {
  const hasEmbed = Boolean(section.embedUrl);
  const hasDirectVideo = Boolean(section.videoUrl);

  return (
    <div className="mt-10">
      <h3 className="text-white text-xl uppercase mb-3" style={{ fontFamily: bebas }}>
        {section.title}
      </h3>
      <div className="relative rounded-2xl overflow-hidden border border-[#6EE76D]/12 aspect-video bg-black">
        {hasEmbed ? (
          <iframe
            src={section.embedUrl}
            title={section.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : hasDirectVideo ? (
          <video className="absolute inset-0 w-full h-full" controls playsInline preload="metadata" src={section.videoUrl} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/60" style={{ fontFamily: inter }}>
            Video není dostupné.
          </div>
        )}
      </div>
      {section.caption && (
        <p className="text-white/45 text-sm mt-3" style={{ fontFamily: inter }}>
          {nbspShortWords(section.caption)}
        </p>
      )}
    </div>
  );
}

export default function AktualitaDetail() {
  const { articleSlug } = useParams();
  const location = useLocation();
  const state = location.state as { article?: Article; backTo?: string } | undefined;
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [apiArticle, setApiArticle] = useState<Article | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadArticleFromApi = async () => {
      if (!articleSlug) return;

      try {
        const response = await fetch("/api/news");
        if (!response.ok) return;

        const payload = (await response.json()) as { news?: ApiNewsItem[] };
        const matched = (payload.news ?? []).find((item) => {
          const apiSlug = String(item.slug || "").trim();
          if (apiSlug) return apiSlug === articleSlug;
          return toSlug(String(item.title || "")) === articleSlug;
        });
        if (!matched || !isActive) return;

        setApiArticle({
          title: matched.title || "Aktualita",
          date: matched.date || "—",
          excerpt: matched.excerpt || "",
          content: matched.content || matched.excerpt || "",
          mediaSections: matched.mediaSections,
        });
      } catch {
      }
    };

    loadArticleFromApi();

    return () => {
      isActive = false;
    };
  }, [articleSlug]);

  const detailedFallbackArticle = FALLBACK_ARTICLES.find(
    (item) => item.slug === articleSlug || (state?.article?.title && item.slug === toSlug(state.article.title))
  );

  const sharedFallbackArticle = SHARED_ARTICLES.find(
    (item) => item.slug === articleSlug || (state?.article?.title && item.slug === toSlug(state.article.title))
  );

  const fallbackArticle = detailedFallbackArticle ?? sharedFallbackArticle;

  const article = apiArticle
    ? apiArticle
    : state?.article
    ? {
        ...fallbackArticle,
        ...state.article,
        content: state.article.content ?? fallbackArticle?.content,
        mediaSections: state.article.mediaSections ?? fallbackArticle?.mediaSections,
      }
    : fallbackArticle;

  if (!article) {
    return <Navigate to="/aktuality" replace />;
  }

  const nextLightbox = (direction: number) => {
    setLightbox((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        index: (prev.index + direction + prev.images.length) % prev.images.length,
      };
    });
  };

  return (
    <>
      <section className="pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={state?.backTo || "/aktuality"}
            className="inline-flex items-center gap-2 text-white/50 hover:text-[#6EE76D] transition-colors mb-6"
            style={{ fontFamily: inter }}
          >
            <ArrowLeft className="w-4 h-4" /> Přehled všech aktualit
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

            {article.mediaSections?.map((section, index) =>
              section.type === "gallery" ? (
                <GalleryBlock key={`${section.title}-${index}`} section={section} onOpen={(images, imageIndex) => setLightbox({ images, index: imageIndex })} />
              ) : (
                <VideoBlock key={`${section.title}-${index}`} section={section} />
              )
            )}
          </div>
        </div>
      </section>

      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/90 p-4 sm:p-6 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white"
            aria-label="Zavřít galerii"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-full max-w-5xl">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#050805]">
              <ImageWithFallback
                src={lightbox.images[lightbox.index]}
                alt="Zvětšený náhled"
                className="w-full max-h-[72vh] object-contain bg-black"
              />

              {lightbox.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => nextLightbox(-1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => nextLightbox(1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {lightbox.images.length > 1 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {lightbox.images.map((image, index) => (
                  <button
                    key={image + index}
                    type="button"
                    onClick={() => setLightbox((prev) => (prev ? { ...prev, index } : prev))}
                    className={`w-16 h-16 rounded-xl overflow-hidden border ${lightbox.index === index ? "border-[#6EE76D]" : "border-white/10"}`}
                  >
                    <ImageWithFallback src={image} alt={`Náhled ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
