import { useEffect, useState } from "react";
import { PageHero, CtaStrip, NewsCard, bebas, inter } from "../components/shared";
import { getAllTeamNews } from "../data/teams";

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

const FALLBACK_NEWS: DisplayNews[] = getAllTeamNews()
  .sort((a, b) => parseCzDate(b.date) - parseCzDate(a.date))
  .map((item) => ({
    id: item.id,
    date: item.date,
    title: item.title,
    excerpt: item.excerpt,
    content: item.content,
    teamName: item.teamName,
    teamNames: [item.teamName],
    teamSlug: item.teamSlug,
    teamSlugs: [item.teamSlug],
    mediaSections: [],
  }));

export default function AktualityPage() {
  const [selectedTeam, setSelectedTeam] = useState("Všechny aktuality");
  const [news, setNews] = useState<DisplayNews[]>(FALLBACK_NEWS);
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
        setNews(normalizedNews.length > 0 ? normalizedNews : FALLBACK_NEWS);
      } catch {
        if (!isActive) return;
        setNews(FALLBACK_NEWS);
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
          </div>

          {loading && (
            <p className="text-white/45 text-sm mb-6" style={{ fontFamily: inter }}>
              Načítám aktuality z Notionu...
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {filteredNews.map((item) => (
              <NewsCard
                key={item.id}
                article={{ title: item.title, date: item.date, excerpt: item.excerpt, content: item.content, mediaSections: item.mediaSections }}
                tag={item.teamName}
                to={`/aktuality/${toSlug(item.title)}`}
                backTo="/aktuality"
                className="p-6"
              />
            ))}
          </div>
        </div>
      </section>

      <CtaStrip />
    </>
  );
}
