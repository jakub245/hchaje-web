import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import {
  Menu, X, Phone, Mail, MapPin, Instagram, Activity, ArrowRight, Facebook,
} from "lucide-react";
import logoSvg from "../../imports/hc-haje-nove.svg";

export const G = "#6EE76D";
export const BG = "#080C08";
export const bebas = "'Bebas Neue', sans-serif";
export const inter = "Inter, sans-serif";
export const CONTACT_PHONE = "+420 777 721 282";
export const CONTACT_PHONE_SECONDARY = "+420 608 981 667";
export const CONTACT_EMAIL = "vybor@hchaje.cz";
export const CONTACT_ADDRESS_TITLE = "Areál TJ Háje";
export const CONTACT_ADDRESS = "K Jezeru, Praha 4";
export const MAP_URL = "https://www.google.com/maps?q=50.0365389,14.5359419";
export const FACEBOOK_URL = "https://www.facebook.com/hchajeprahacze/photos/?ref=page_internal";
export const INSTAGRAM_URL = "https://www.instagram.com/hchajeprahacze";

const NAV = [
  { label: "Aktuality", to: "/aktuality" },
  { label: "Družstva", to: "/druzstva" },
  { label: "Tréninky", to: "/treninky" },
  { label: "O klubu", to: "/o-klubu" },
  { label: "Kontakty", to: "/kontakty" },
];

/* ── Button ── */
export function Btn({ children, variant = "primary", className = "", as, to, ...props }: any) {
  const base =
    variant === "primary"
      ? "bg-[#6EE76D] text-[#080C08] hover:brightness-110 hover:shadow-[0_0_20px_rgba(110,231,109,0.5)] active:brightness-95"
      : "border border-[#6EE76D]/30 text-[#6EE76D] hover:bg-[#6EE76D]/10 hover:border-[#6EE76D]/60 active:brightness-95";
  const cls = `rounded-full px-7 py-3 tracking-wider uppercase transition-all duration-300 ease-out cursor-pointer inline-flex items-center gap-2 text-[1.05rem] ${base} ${className} active:-translate-y-[1px]`;
  const style = { fontFamily: bebas, letterSpacing: "0.08em" };

  if (to) {
    return <Link to={to} className={cls} style={style} {...props}>{children}</Link>;
  }
  return <button className={cls} style={style} {...props}>{children}</button>;
}

/* ── Section heading ── */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[#6EE76D] text-sm tracking-[0.2em] uppercase mb-3 block" style={{ fontFamily: bebas }}>
      {children}
    </span>
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
      <div className="w-full px-12 lg:px-24 pt-2">
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
            to="/kontakty"
            className="rounded-full px-6 py-2 bg-[#6EE76D] text-[#080C08] hover:brightness-110 uppercase transition-all duration-300 inline-flex items-center gap-2"
            style={navTextStyle}
          >
            Chci se přidat
          </Link>
        </div>

        <button className="lg:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-[#080C08]/98 backdrop-blur-lg border-t border-[#6EE76D]/10 px-4 pb-6 pt-2">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block py-3 text-white/60 hover:text-[#6EE76D] active:-translate-y-[1px] border-b border-white/5 uppercase tracking-wider transition-all duration-200 ease-out"
              style={navTextStyle}
            >
              {item.label}
            </Link>
          ))}
          <Btn variant="primary" to="/kontakty" className="mt-4 w-full justify-center">
            Chci se přidat
          </Btn>
        </div>
      )}
      </div>
    </nav>
  );
}

/* ── Footer ── */
export function Footer() {
  return (
    <footer className="bg-[#050805] border-t border-[#6EE76D]/8 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logoSvg} alt="HC Háje" className="h-10 w-auto" />
            </Link>
            <p className="text-white/35 text-sm" style={{ fontFamily: inter }}>
              Dívčí a ženský házenkářský klub z Prahy 4. Od roku 1980 vedeme hráčky od přípravky po ženy.
            </p>
          </div>
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
            <div className="space-y-2 text-sm text-white/35">
              <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="block hover:text-[#6EE76D] transition-colors">{CONTACT_PHONE}</a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="block hover:text-[#6EE76D] transition-colors">{CONTACT_EMAIL}</a>
              <a href={MAP_URL} target="_blank" rel="noreferrer" className="block hover:text-[#6EE76D] transition-colors">
                {CONTACT_ADDRESS_TITLE}, {CONTACT_ADDRESS}
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-white mb-4 uppercase tracking-wider" style={{ fontFamily: bebas }}>Sociální sítě</h4>
            <div className="flex gap-3">
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#6EE76D]/15 flex items-center justify-center text-white/35 hover:text-[#6EE76D] hover:border-[#6EE76D]/30 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#6EE76D]/15 flex items-center justify-center text-white/35 hover:text-[#6EE76D] hover:border-[#6EE76D]/30 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
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
        <Btn variant="primary" to="/kontakty" className="px-10 py-4">
          Chci se přijít podívat <ArrowRight className="w-5 h-5" />
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
          {title}
        </h1>
        {subtitle && <p className="text-white/45 text-lg mt-4 max-w-2xl" style={{ fontFamily: inter }}>{subtitle}</p>}
        <div className="w-20 h-1 bg-[#6EE76D] rounded-full mt-6" />
      </div>
    </section>
  );
}