import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  ChevronRight, ChevronLeft, Play, Instagram, ArrowRight,
  Clock, Users, Calendar, Trophy,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Btn, SectionLabel, CtaStrip, bebas, inter } from "../components/shared";

const STATS = [
  { value: "120+", label: "Aktivních hráček" },
  { value: "6", label: "Družstev" },
  { value: "14+", label: "Tréninků týdně" },
];

const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1769614075229-bfc51a41aa78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMHRlYW0lMjB0cmFpbmluZyUyMGluZG9vcnxlbnwxfHx8fDE3NzYwODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1575367728985-8cb72541609a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMGdhbWUlMjBtYXRjaCUyMGFjdGlvbnxlbnwxfHx8fDE3NzYwODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1669046239665-5dcfc2ecc468?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMGNvdXJ0JTIwaW5kb29yJTIwc3BvcnRzJTIwaGFsbHxlbnwxfHx8fDE3NzYwODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1552127966-d24b805b9be7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGhhbmRiYWxsJTIwcGxheWVycyUyMHRlYW18ZW58MXx8fHwxNzc2MDg1OTY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
];

const REELS = [
  { id: 1, thumbnail: "https://images.unsplash.com/photo-1606519740551-1fa9e7c68a02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMGJhbGwlMjBjbG9zZSUyMHVwJTIwc3BvcnR8ZW58MXx8fHwxNzc2MDg1OTY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", caption: "Trénink A-týmu" },
  { id: 2, thumbnail: "https://images.unsplash.com/photo-1769614075229-bfc51a41aa78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMHRlYW0lMjB0cmFpbmluZyUyMGluZG9vcnxlbnwxfHx8fDE3NzYwODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", caption: "Přípravka v akci" },
  { id: 3, thumbnail: "https://images.unsplash.com/photo-1575367728985-8cb72541609a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMGdhbWUlMjBtYXRjaCUyMGFjdGlvbnxlbnwxfHx8fDE3NzYwODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", caption: "Zápasový highlight" },
  { id: 4, thumbnail: "https://images.unsplash.com/photo-1552127966-d24b805b9be7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGhhbmRiYWxsJTIwcGxheWVycyUyMHRlYW18ZW58MXx8fHwxNzc2MDg1OTY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", caption: "Teambuilding" },
  { id: 5, thumbnail: "https://images.unsplash.com/photo-1669046239665-5dcfc2ecc468?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMGNvdXJ0JTIwaW5kb29yJTIwc3BvcnRzJTIwaGFsbHxlbnwxfHx8fDE3NzYwODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", caption: "Atmosféra haly" },
  { id: 6, thumbnail: "https://images.unsplash.com/photo-1606519740551-1fa9e7c68a02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMGJhbGwlMjBjbG9zZSUyMHVwJTIwc3BvcnR8ZW58MXx8fHwxNzc2MDg1OTY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", caption: "Naše vybavení" },
];

const NEWS = [
  { id: 1, date: "10. 4. 2026", title: "A-tým postoupil do semifinále krajského přeboru", tag: "Zápasy" },
  { id: 2, date: "7. 4. 2026", title: "Nábor nových hráček — přijďte si vyzkoušet házenou!", tag: "Nábor" },
  { id: 3, date: "2. 4. 2026", title: "Turnaj přípravek v Háji — výsledky a fotky", tag: "Turnaje" },
  { id: 4, date: "28. 3. 2026", title: "Letní kemp 2026 — registrace otevřena", tag: "Kempy" },
];

const TRAININGS = [
  { day: "Pondělí", date: "14. 4.", time: "16:00 – 17:30", team: "Přípravka" },
  { day: "Pondělí", date: "14. 4.", time: "17:45 – 19:15", team: "Mladší žákyně" },
  { day: "Úterý", date: "15. 4.", time: "16:00 – 17:30", team: "Starší žákyně" },
  { day: "Úterý", date: "15. 4.", time: "18:00 – 19:30", team: "A-tým ženy" },
  { day: "Středa", date: "16. 4.", time: "16:00 – 17:30", team: "Přípravka" },
  { day: "Středa", date: "16. 4.", time: "17:45 – 19:15", team: "Mladší žákyně" },
  { day: "Čtvrtek", date: "17. 4.", time: "17:00 – 18:30", team: "Starší žákyně" },
  { day: "Čtvrtek", date: "17. 4.", time: "19:00 – 20:30", team: "A-tým ženy" },
];

/* ══════════════ HERO ══════════════ */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1575367728985-8cb72541609a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kYmFsbCUyMGdhbWUlMjBtYXRjaCUyMGFjdGlvbnxlbnwxfHx8fDE3NzYwODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Handball"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080C08] via-[#080C08]/85 to-[#080C08]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080C08] via-transparent to-transparent" />
      </div>
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#6EE76D]/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 w-full">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#6EE76D]/10 border border-[#6EE76D]/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#6EE76D] animate-pulse" />
            <span className="text-[#6EE76D] text-sm" style={{ fontFamily: bebas, letterSpacing: "0.1em" }}>
              Sezóna 2025 / 2026
            </span>
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-8xl text-white mb-6 uppercase"
            style={{ fontFamily: bebas, lineHeight: 0.95, letterSpacing: "0.02em" }}
          >
            Házená je{" "}
            <span className="text-[#6EE76D]">náš život.</span>
          </h1>

          <p className="text-white/50 text-lg mb-10 max-w-lg" style={{ fontFamily: inter }}>
            Jsme HC Háje — ženský házenkářský klub z Prahy. Trénujeme, soutěžíme a hlavně
            milujeme házenou. Přidej se k nám a zažij adrenalin na hřišti!
          </p>

          <div className="flex flex-wrap gap-4">
            <Btn variant="primary" to="/kontakty">
              Přijdu na trénink <ArrowRight className="w-4 h-4" />
            </Btn>
            <Btn variant="secondary" to="/o-klubu">Více o klubu</Btn>
          </div>
        </div>

        <div className="mt-16 lg:mt-24 grid grid-cols-3 gap-8 max-w-xl">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-4xl lg:text-5xl text-[#6EE76D]" style={{ fontFamily: bebas }}>{s.value}</div>
              <div className="text-white/40 text-sm mt-1" style={{ fontFamily: inter }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════ ABOUT ══════════════ */
function About() {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlide((p) => (p + 1) % CAROUSEL_IMAGES.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <SectionLabel>O klubu</SectionLabel>
            <h2 className="text-4xl lg:text-5xl text-white uppercase mb-6" style={{ fontFamily: bebas, lineHeight: 1 }}>
              Tradice a vášeň<br />od roku 2005
            </h2>
            <p className="text-white/50 mb-4" style={{ fontFamily: inter }}>
              HC Háje je ženský házenkářský klub se sídlem v Praze 11. Náš klub sdružuje
              hráčky od těch nejmenších přípravek až po dospělý A-tým žen.
            </p>
            <p className="text-white/50 mb-8" style={{ fontFamily: inter }}>
              Trénujeme v moderní hale s kvalitním zázemím. Naše trenérky a trenéři mají
              dlouholeté zkušenosti a individuální přístup ke každé hráčce.
            </p>
            <div className="flex flex-wrap gap-4">
              <Btn variant="primary" to="/o-klubu">Více o klubu</Btn>
              <Btn variant="secondary" to="/druzstva">Naše družstva</Btn>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group">
            {CAROUSEL_IMAGES.map((img, i) => (
              <ImageWithFallback key={i} src={img} alt={`Házená ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === slide ? "opacity-100" : "opacity-0"}`} />
            ))}
            <div className="absolute inset-0 border border-[#6EE76D]/15 rounded-2xl pointer-events-none" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {CAROUSEL_IMAGES.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)}
                  className={`h-2 rounded-full transition-all ${i === slide ? "bg-[#6EE76D] w-6" : "bg-white/25 w-2"}`} />
              ))}
            </div>
            <button onClick={() => setSlide((p) => (p - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setSlide((p) => (p + 1) % CAROUSEL_IMAGES.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════ REELS ══════════════ */
function ReelsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * 300, behavior: "smooth" });

  useEffect(() => {
    if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
      const script = document.createElement('script');
      script.src = '//www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const instagramEmbed = `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/reel/DV_oFfejTpP/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/reel/DV_oFfejTpP/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">Zobrazit příspěvek na Instagramu</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/reel/DV_oFfejTpP/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">Příspěvek sdílený HC Háje Praha (@hchajeprahacze)</a></p></div></blockquote>`;

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#080C08] via-[#0e160e] to-[#080C08]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[#6EE76D] text-sm tracking-[0.2em] uppercase mb-2 flex items-center gap-2" style={{ fontFamily: bebas }}>
              <Instagram className="w-4 h-4" /> Sledujte nás
            </span>
            <h2 className="text-3xl lg:text-4xl text-white uppercase" style={{ fontFamily: bebas }}>
              Z našeho Instagramu
            </h2>
          </div>
          <div className="hidden sm:flex gap-2">
            <button onClick={() => scroll(-1)} className="w-10 h-10 rounded-full border border-[#6EE76D]/25 flex items-center justify-center text-[#6EE76D] hover:bg-[#6EE76D]/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll(1)} className="w-10 h-10 rounded-full border border-[#6EE76D]/25 flex items-center justify-center text-[#6EE76D] hover:bg-[#6EE76D]/10 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div ref={ref} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
          {REELS.map((reel, index) => (
            reel.id === 1 ? (
              <div key={reel.id} className="flex-shrink-0 w-[300px] sm:w-[350px] snap-start">
                <div dangerouslySetInnerHTML={{ __html: instagramEmbed }} className="instagram-embed" />
              </div>
            ) : (
              <div key={reel.id} className="flex-shrink-0 w-[220px] sm:w-[250px] snap-start group cursor-pointer">
                <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-[#6EE76D]/10 group-hover:border-[#6EE76D]/30 transition-all">
                  <ImageWithFallback src={reel.thumbnail} alt={reel.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-[#6EE76D]/20 backdrop-blur-sm flex items-center justify-center border border-[#6EE76D]/30">
                      <Play className="w-6 h-6 text-[#6EE76D] fill-[#6EE76D]" />
                    </div>
                  </div>
                  <p className="absolute bottom-3 left-3 right-3 text-white text-sm">{reel.caption}</p>
                  <Instagram className="absolute top-3 right-3 w-4 h-4 text-white/50" />
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════ NEWS + TRAININGS ══════════════ */
function NewsAndTrainings() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <SectionLabel>Novinky</SectionLabel>
            <h2 className="text-3xl lg:text-4xl text-white uppercase mb-8" style={{ fontFamily: bebas }}>Aktuality</h2>
            <div className="space-y-4">
              {NEWS.map((item) => (
                <Link key={item.id} to="/aktuality" className="block p-5 rounded-2xl bg-[#0e160e] border border-[#6EE76D]/8 hover:border-[#6EE76D]/25 transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white/35 text-sm">{item.date}</span>
                        <span className="px-3 py-0.5 rounded-full bg-[#6EE76D]/10 text-[#6EE76D] text-xs uppercase tracking-wider" style={{ fontFamily: bebas }}>{item.tag}</span>
                      </div>
                      <h3 className="text-white group-hover:text-[#6EE76D] transition-colors" style={{ fontFamily: inter }}>{item.title}</h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/15 group-hover:text-[#6EE76D] transition-colors flex-shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
            <Btn variant="secondary" to="/aktuality" className="mt-6">Všechny aktuality</Btn>
          </div>

          <div>
            <SectionLabel>Rozvrh</SectionLabel>
            <h2 className="text-3xl lg:text-4xl text-white uppercase mb-8" style={{ fontFamily: bebas }}>Tréninky</h2>
            <div className="space-y-2">
              {TRAININGS.map((t, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[#0e160e] border border-[#6EE76D]/8 hover:border-[#6EE76D]/20 transition-all">
                  <div className="w-10 h-10 rounded-full bg-[#6EE76D]/10 flex items-center justify-center flex-shrink-0">
                    {t.team === "A-tým ženy" ? <Trophy className="w-5 h-5 text-[#6EE76D]" /> : <Users className="w-5 h-5 text-[#6EE76D]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-white" style={{ fontFamily: inter }}>{t.team}</span>
                    <div className="flex items-center gap-3 text-sm text-white/35 mt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {t.day} {t.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {t.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Btn variant="secondary" to="/treninky" className="mt-6">Kompletní rozvrh</Btn>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <ReelsSection />
      <NewsAndTrainings />
      <CtaStrip />
    </>
  );
}
