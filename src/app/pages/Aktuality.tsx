import { useEffect, useState } from "react";
import { PageHero, CtaStrip, NewsCard, bebas, inter } from "../components/shared";

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

type ApiNewsItem = {
  id?: string;
  slug?: string;
  date?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  teamName?: string;
  teamNames?: string[];
  teamSlug?: string;
  teamSlugs?: string[];
  mediaSections?: Array<
    | { type: "gallery"; title: string; images: string[]; caption?: string }
    | { type: "video"; title: string; embedUrl?: string; videoUrl?: string; caption?: string }
  >;
};

type DisplayNews = {
  id: string;
  slug: string;
  date: string;
  title: string;
  excerpt?: string;
  content?: string;
  teamName: string;
  teamNames: string[];
  teamSlug: string;
  teamSlugs: string[];
  mediaSections?: Array<
    | { type: "gallery"; title: string; images: string[]; caption?: string }
    | { type: "video"; title: string; embedUrl?: string; videoUrl?: string; caption?: string }
  >;
};

export default function AktualityPage() {
  const [selectedTeam, setSelectedTeam] = useState("Všechny aktuality");
  const [news, setNews] = useState<DisplayNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadNews = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/news");
        if (!response.ok) throw new Error("Nepodařilo se načíst aktuality.");

        const payload = (await response.json()) as { news?: ApiNewsItem[] };
        const normalizedNews: DisplayNews[] = (payload.news ?? [])
          .map((item, index) => {
            const teamNames = (item.teamNames ?? [])
              .map((name) => String(name || "").trim())
              .filter(Boolean);

            const fallbackTeamName = String(item.teamName || "").trim() || "Klub";
            const teamNamesResolved = teamNames.length > 0 ? teamNames : [fallbackTeamName];
            const teamSlugs = (item.teamSlugs ?? [])
              .map((slug) => String(slug || "").trim())
              .filter(Boolean);

            return {
              id: item.id || `notion-news-${index}`,
              slug: item.slug || toSlug(item.title || `aktualita-${index}`),
              date: item.date || "—",
              title: item.title || "Aktualita",
              excerpt: item.excerpt || "",
              content: item.content || item.excerpt || "",
              teamName: fallbackTeamName,
              teamNames: teamNamesResolved,
              teamSlug: item.teamSlug || teamSlugs[0] || toSlug(fallbackTeamName),
              teamSlugs: teamSlugs.length > 0 ? teamSlugs : teamNamesResolved.map((name) => toSlug(name)),
              mediaSections: item.mediaSections ?? [],
            };
          })
          .sort((a, b) => parseCzDate(b.date) - parseCzDate(a.date));

        if (!isActive) return;
        setNews(normalizedNews);
      } catch {
        if (!isActive) return;
        setNews([]);
      } finally {
        if (!isActive) return;
        setLoading(false);
      }
    };

    loadNews();

    return () => {
      isActive = false;
    };
  }, []);

  const teamOptions = ["Všechny aktuality", ...Array.from(new Set(news.flatMap((item) => item.teamNames)))];

  const filteredNews = selectedTeam === "Všechny aktuality"
    ? news
    : news.filter((item) => item.teamNames.includes(selectedTeam));

  return (
    <>
      <PageHero title="Aktuality" subtitle="Nejnovější zprávy a události z našeho klubu." />

      <section className="reveal-on-scroll pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            {loading ? (
              <div className="flex flex-wrap gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={`skeleton-filter-${i}`} className={`h-9 rounded-full bg-[#6EE76D]/10 animate-pulse ${i === 0 ? "w-40" : i === 1 ? "w-20" : i === 2 ? "w-28" : i === 3 ? "w-24" : "w-32"}`} />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-white/80 mb-4" style={{ fontFamily: bebas }}>
                  Filtrovat podle družstva
                </div>
                <div className="flex flex-wrap gap-3">
                  {teamOptions.map((team) => {
                    const isActive = selectedTeam === team;
                    return (
                      <button
                        key={team}
                        onClick={() => setSelectedTeam(team)}
                        className={`rounded-full border px-4 py-2 text-sm transition-all ${isActive ? "border-[#F587B9] bg-[#F587B9]/12 text-white shadow-[0_0_18px_rgba(245,135,185,0.12)]" : "border-white/10 text-white/70 hover:border-[#F587B9]/40 hover:text-white"}`}
                        style={{ fontFamily: inter }}
                      >
                        {team}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {loading && (
              <div className="rounded-2xl bg-[#6EE76D]/5 border border-[#6EE76D]/20 px-4 py-3 mt-4 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-[#6EE76D] animate-pulse" />
                <p className="text-[#6EE76D] text-sm" style={{ fontFamily: inter }}>Načítám aktuální data...</p>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={`skeleton-news-${i}`} className="rounded-2xl border border-[#6EE76D]/12 bg-[#101a10] p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-4 w-24 rounded bg-[#6EE76D]/10" />
                    <div className="h-6 w-16 rounded-full bg-[#6EE76D]/10" />
                  </div>
                  <div className="h-5 w-4/5 rounded bg-[#6EE76D]/10 mb-3" />
                  <div className="h-4 w-full rounded bg-[#6EE76D]/10 mb-2" />
                  <div className="h-4 w-5/6 rounded bg-[#6EE76D]/10 mb-5" />
                  <div className="h-4 w-28 rounded bg-[#6EE76D]/10" />
                </div>
              ))}
            </div>
          ) : filteredNews.length ? (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredNews.map((item) => (
                <NewsCard
                  key={item.id}
                  article={{ title: item.title, date: item.date, excerpt: item.excerpt, content: item.content, mediaSections: item.mediaSections }}
                  tag={item.teamName}
                  to={`/aktuality/${item.slug}`}
                  backTo="/aktuality"
                  className="p-6"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-[#6EE76D]/8 bg-[#0e160e] p-8 text-white/70" style={{ fontFamily: inter }}>
              Aktuality zatím nejsou k dispozici.
            </div>
          )}
        </div>
      </section>

      <CtaStrip />
    </>
  );
}
