import { useState } from "react";
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

const ALL_NEWS = getAllTeamNews().sort((a, b) => parseCzDate(b.date) - parseCzDate(a.date));
const TEAM_OPTIONS = ["Všechny aktuality", ...Array.from(new Set(ALL_NEWS.map((item) => item.teamName)))];

export default function AktualityPage() {
  const [selectedTeam, setSelectedTeam] = useState("Všechny aktuality");

  const filteredNews = selectedTeam === "Všechny aktuality"
    ? ALL_NEWS
    : ALL_NEWS.filter((item) => item.teamName === selectedTeam);

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
              {TEAM_OPTIONS.map((team) => {
                const isActive = selectedTeam === team;
                return (
                  <button
                    key={team}
                    onClick={() => setSelectedTeam(team)}
                    className={`rounded-full border px-4 py-2 text-sm transition-all ${isActive ? "border-[#6EE76D] bg-[#6EE76D]/12 text-white" : "border-white/10 text-white/70 hover:border-[#6EE76D]/30 hover:text-white"}`}
                    style={{ fontFamily: inter }}
                  >
                    {team}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredNews.map((item) => (
              <NewsCard
                key={item.id}
                article={{ title: item.title, date: item.date, excerpt: item.excerpt, content: item.content }}
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
