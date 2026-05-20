import { Children, cloneElement, isValidElement, useState, useEffect, type ReactElement, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import {
  Menu, X, Phone, Mail, MapPin, Instagram, Activity, ArrowRight, Facebook, Calendar,
} from "lucide-react";
import logoSvg from "../../imports/hchaje-logo-old.png";

export const G = "#6EE76D";
export const P = "#F587B9";
export const BG = "#080C08";
export const bebas = "'Bebas Neue', sans-serif";
export const inter = "Inter, sans-serif";
export const CONTACT_PHONE = "+420 792 336 535";
export const CONTACT_PHONE_SECONDARY = "";
export const CONTACT_EMAIL = "vybor@hchaje.cz";
export const CONTACT_ADDRESS_TITLE = "Areál TJ Háje";
export const CONTACT_ADDRESS = "K Jezeru, Praha 4";
export const MAP_URL = "https://www.google.com/maps?q=50.0365389,14.5359419";
export const FACEBOOK_URL = "https://www.facebook.com/hchajeprahacze/photos/?ref=page_internal";
export const INSTAGRAM_URL = "https://www.instagram.com/hchajeprahacze";

const NAV = [
  { label: "Družstva", to: "/druzstva" },
  { label: "Akce", to: "/akce" },
  { label: "Aktuality", to: "/aktuality" },
  { label: "O klubu", to: "/o-klubu" },
  { label: "Kontakty", to: "/kontakty" },
  { label: "Nábor", to: "/nabor" },
];

export const nbspShortWords = (value: string) =>
  value.replace(
    /(^|\s)(a|i|k|o|s|u|v|z|A|I|K|O|S|U|V|Z|na|do|od|po|za|ve|se|ze|ke|ku|Na|Do|Od|Po|Za|Ve|Se|Ze|Ke|Ku)\s+/g,
    (_, lead, word) => `${lead}${word}\u00A0`,
  );

const formatCzechTextNode = (node: ReactNode): ReactNode => {
  if (typeof node === "string") return nbspShortWords(node);
  if (Array.isArray(node)) return node.map((child) => formatCzechTextNode(child));
  return node;
};

/* ── Button ── */
export function Btn({ children, variant = "primary", className = "", as, to, ...props }: any) {
  const base =
    variant === "primary"
      ? "bg-[#F587B9] text-[#080C08] hover:brightness-110 hover:shadow-[0_0_20px_rgba(245,135,185,0.38)] active:brightness-95"
      : "border border-[#6EE76D]/30 text-[#6EE76D] hover:bg-[#6EE76D]/10 hover:border-[#6EE76D]/60 active:brightness-95";
  const cls = `rounded-full px-7 py-3 tracking-wider uppercase transition-all duration-300 ease-out cursor-pointer inline-flex items-center gap-2 text-[1.05rem] ${base} ${className} active:-translate-y-[1px]`;
  const style = { fontFamily: bebas, letterSpacing: "0.08em" };

  const content = typeof children === "string"
    ? nbspShortWords(children)
    : Children.map(children, (child: ReactNode) => {
        if (typeof child === "string") {
          return nbspShortWords(child);
        }
        if (isValidElement(child) && typeof child.type !== "string") {
          const childProps = child.props as { className?: string };
          const iconClass = childProps.className?.includes("w-")
            ? `${childProps.className} transition-transform duration-300 group-hover:translate-x-0.5`
            : childProps.className;
          return cloneElement(child as ReactElement<{ className?: string }>, { className: iconClass });
        }
        return child;
      });

  if (to) {
    return <Link to={to} className={`${cls} group`} style={style} {...props}>{content}</Link>;
  }
  return <button className={`${cls} group`} style={style} {...props}>{content}</button>;
}

/* ── Section heading ── */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[#6EE76D] text-sm tracking-[0.2em] uppercase mb-3 block" style={{ fontFamily: bebas }}>
      {formatCzechTextNode(children)}
    </span>
  );
}

const newsSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

export function NewsCard({
  article,
  tag,
  to,
  backTo,
  className = "",
}: {
  article: {
    title: string;
    date: string;
    excerpt?: string;
    content?: string;
    mediaSections?: Array<
      | { type: "gallery"; title: string; images: string[]; caption?: string }
      | { type: "video"; title: string; embedUrl?: string; videoUrl?: string; caption?: string }
    >;
  };
  tag?: string;
  to?: string;
  backTo?: string;
  className?: string;
}) {
  return (
    <Link
      to={to || `/aktuality/${newsSlug(article.title)}`}
      state={{ article, backTo }}
      className={`mobile-solid-card group block rounded-2xl bg-[#101a10] border border-[#6EE76D]/12 p-4 hover:border-[#6EE76D]/25 transition-all ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="inline-flex items-center gap-2 text-white/45 text-sm" style={{ fontFamily: inter }}>
          <Calendar className="w-4 h-4 text-[#6EE76D]" />
          {article.date}
        </span>
        {tag && (
          <span
            className="px-3.5 py-1 rounded-full text-[12px] tracking-[0.12em] bg-[#F587B9]/12 text-[#FFC2DD]"
            style={{ fontFamily: bebas }}
          >
            {nbspShortWords(tag)}
          </span>
        )}
      </div>

      <h3 className="text-white text-[16px] leading-tight" style={{ fontFamily: inter }}>
        {nbspShortWords(article.title)}
      </h3>

      {article.excerpt && (
        <p
          className="mt-3 text-white/45 text-sm leading-6"
          style={{
            fontFamily: inter,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.excerpt}
        </p>
      )}

      <div className="mt-4 inline-flex items-center gap-1.5 text-sm" style={{ fontFamily: inter }}>
        <ArrowRight className="w-4 h-4 text-white/90 group-hover:text-[#6EE76D] group-hover:translate-x-0.5 transition-all" />
        <span className="text-white/90 underline-offset-4 group-hover:text-[#6EE76D] group-hover:underline">Zobrazit detail</span>
      </div>
    </Link>
  );
}

/* ── Navbar ── */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const navTextStyle = { fontFamily: bebas, fontSize: "17px", letterSpacing: "0.08em", fontWeight: 200 as const };

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#080C08]/95 backdrop-blur-md border-b border-[#6EE76D]/10 shadow-lg shadow-black/30" : "bg-transparent"}`}>
      <div className="w-full px-6 lg:px-24 pt-2">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoSvg} alt="HC Háje" className="h-14 w-auto" />
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`uppercase transition-all duration-200 ease-out hover:text-[#6EE76D] active:-translate-y-[1px] active:text-[#6EE76D] ${location.pathname.startsWith(item.to) ? "text-[#6EE76D]" : "text-white/55"}`}
                style={navTextStyle}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/nabor#kontaktni-formular"
              className="rounded-full px-6 py-2 bg-[#F587B9] text-[#080C08] hover:brightness-110 hover:shadow-[0_0_20px_rgba(245,135,185,0.28)] uppercase transition-all duration-300 inline-flex items-center gap-2"
              style={navTextStyle}
            >
              Chci se přidat
            </Link>
          </div>

          <button
            className="lg:hidden flex items-center gap-2 text-white p-1"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
          >
            <span className="uppercase text-white/80 tracking-wider" style={navTextStyle}>Menu</span>
            {open ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[#6EE76D]/10 bg-[#080C08]/98 backdrop-blur-lg">
          <div className="px-6 pt-4 pb-8 min-h-[calc(100dvh-4.5rem)] flex flex-col">
            <div className="flex flex-col items-center gap-2">
              {NAV.map((item, index) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`block w-full rounded-2xl py-4 px-4 text-center text-white/80 hover:text-[#6EE76D] hover:bg-[#6EE76D]/8 active:-translate-y-[1px] uppercase tracking-wider transition-all duration-200 ease-out ${index !== NAV.length - 1 ? "border-b border-white/5" : ""}`}
                  style={navTextStyle}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <Btn variant="primary" to="/nabor#kontaktni-formular" className="mt-6 w-full justify-center py-4">
              Chci se přidat
            </Btn>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ── Footer ── */
export function Footer() {
  return (
    <footer className="bg-[#050805] border-t border-[#6EE76D]/8 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoSvg} alt="HC Háje" className="h-10 w-auto" />
            </Link>

            <div className="flex items-center gap-3 shrink-0">
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#6EE76D]/15 flex items-center justify-center text-white/35 hover:text-[#6EE76D] hover:border-[#6EE76D]/30 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#6EE76D]/15 flex items-center justify-center text-white/35 hover:text-[#6EE76D] hover:border-[#6EE76D]/30 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:items-start">
            <div>
              <p className="text-white/35 text-sm max-w-md" style={{ fontFamily: inter }}>
                Dívčí a ženský házenkářský klub z Prahy 4. Od roku 1980 vedeme hráčky od přípravky po ženy.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 lg:col-span-2">
              <div>
                <h4 className="text-white mb-4 uppercase tracking-wider" style={{ fontFamily: bebas }}>Navigace</h4>
                <div className="space-y-2">
                  {NAV.map((item) => (
                    <Link key={item.to} to={item.to} className="block text-white/35 hover:text-[#6EE76D] transition-colors text-sm">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white mb-4 uppercase tracking-wider" style={{ fontFamily: bebas }}>Kontakt</h4>
                <div className="space-y-3 text-sm text-white/35" style={{ fontFamily: inter }}>
                  <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="flex items-start gap-2 hover:text-[#6EE76D] transition-colors">
                    <Phone className="w-4 h-4 text-[#6EE76D] mt-0.5 shrink-0" />
                    <span>{CONTACT_PHONE}</span>
                  </a>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="mail-link flex items-start gap-2 transition-colors">
                    <Mail className="w-4 h-4 text-[#6EE76D] mt-0.5 shrink-0" />
                    <span>{CONTACT_EMAIL}</span>
                  </a>
                  <a href={MAP_URL} target="_blank" rel="noreferrer" className="flex items-start gap-2 hover:text-[#6EE76D] transition-colors">
                    <MapPin className="w-4 h-4 text-[#6EE76D] mt-0.5 shrink-0" />
                    <span>{CONTACT_ADDRESS_TITLE}, {CONTACT_ADDRESS}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#6EE76D]/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-sm">© 2026 HC Háje. Všechna práva vyhrazena.</p>
          <p className="text-white/15 text-xs">Vytvořeno s vášní pro házenou</p>
        </div>
      </div>
    </footer>
  );
}

/* ── CTA Strip ── */
export function CtaStrip() {
  return (
    <section className="relative py-16 lg:py-20 overflow-hidden">
      <div className="relative max-w-4xl mx-auto px-8 sm:px-12 lg:px-16 text-center">
        <h2 className="text-4xl lg:text-5xl text-white uppercase mb-4" style={{ fontFamily: bebas }}>
          Staň se součástí{" "}
          <span className="text-[#6EE76D]">HC Háje</span>
        </h2>
        <p className="text-white/45 text-lg mb-8 max-w-xl mx-auto" style={{ fontFamily: inter }}>
          Ať už jsi zkušená hráčka nebo teprve začínáš — u nás si najdeš svoje místo.
          Přijď se podívat na trénink a poznej náš tým!
        </p>
        <Btn variant="primary" to="/nabor#kontaktni-formular" className="px-10 py-4">
          Chci zkusit trénink <ArrowRight className="w-5 h-5" />
        </Btn>
      </div>
    </section>
  );
}

/* ── Page wrapper ── */
export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="pt-28 pb-12 lg:pt-36 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl lg:text-7xl text-white uppercase" style={{ fontFamily: bebas, lineHeight: 1 }}>
          {nbspShortWords(title)}
        </h1>
        {subtitle && <p className="text-white/45 text-lg mt-4 max-w-2xl" style={{ fontFamily: inter }}>{nbspShortWords(subtitle)}</p>}
        <div className="w-20 h-1 bg-[#6EE76D] rounded-full mt-6" />
      </div>
    </section>
  );
}