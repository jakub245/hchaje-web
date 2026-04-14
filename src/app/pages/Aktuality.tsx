import { PageHero, CtaStrip, NewsCard } from "../components/shared";
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

export default function AktualityPage() {
  return (
    <>
      <PageHero title="Aktuality" subtitle="Nejnovější zprávy a události z našeho klubu." />

      <section className="reveal-on-scroll pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {ALL_NEWS.map((item) => (
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
