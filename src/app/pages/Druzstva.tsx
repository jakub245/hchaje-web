import { Link } from "react-router";
import { ArrowRight, Users } from "lucide-react";
import { PageHero, bebas, inter } from "../components/shared";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { TEAMS } from "../data/teams";

export default function DruzstvaPage() {
  return (
    <>
      <PageHero title="Naše družstva" subtitle="Vyberte si kategorii a zjistěte vše o tréninzích, hráčkách a aktualitách." />

      <section className="pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAMS.map((team) => (
              <Link
                key={team.slug}
                to={`/druzstva/${team.slug}`}
                className="group relative rounded-2xl overflow-hidden border border-[#6EE76D]/8 hover:border-[#6EE76D]/30 transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <ImageWithFallback
                    src={team.img}
                    alt={team.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080C08] via-[#080C08]/40 to-transparent" />
                </div>

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#6EE76D]/15 flex items-center justify-center">
                      <Users className="w-4 h-4 text-[#6EE76D]" />
                    </div>
                    <span className="text-white/40 text-sm" style={{ fontFamily: inter }}>{team.ageRange}</span>
                  </div>
                  <h3
                    className="text-2xl lg:text-3xl text-white uppercase group-hover:text-[#6EE76D] transition-colors"
                    style={{ fontFamily: bebas }}
                  >
                    {team.name}
                  </h3>
                  <p className="text-white/40 text-sm mt-1 line-clamp-2" style={{ fontFamily: inter }}>
                    {team.desc}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[#6EE76D] text-sm opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontFamily: bebas, letterSpacing: "0.1em" }}>
                    <span className="uppercase">Zobrazit detail</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
