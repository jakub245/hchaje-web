import { useEffect, useRef, useState } from "react";
import { ArrowRight, Building2, ChevronDown, ChevronLeft, ChevronRight, Mail, Phone, UserRound, Users } from "lucide-react";
import { Link } from "react-router";
import {
  PageHero,
  SectionLabel,
  bebas,
  inter,
  nbspShortWords,
} from "../components/shared";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import naborMikulas from "../../imports/foto/nabor/Nabor_Mikulas.jpg";
import naborMedaile from "../../imports/foto/nabor/Nabor_medaile.jpg";
import naborMini from "../../imports/foto/nabor/Nabor_mini.jpg";
import naborRepre from "../../imports/foto/nabor/Nabor_repre.jpg";
import naborSulcak from "../../imports/foto/nabor/Nabor_sulcak.jpg";
import naborTurnaj from "../../imports/foto/nabor/Nabor_turnaj.jpg";

const NABOR_GALLERY = [
  { src: naborMini, alt: "Nábor HC Háje - mini žákyně" },
  { src: naborMedaile, alt: "Nábor HC Háje - medaile" },
  { src: naborRepre, alt: "Nábor HC Háje - tým" },
  { src: naborMikulas, alt: "Nábor HC Háje - klubová akce" },
  { src: naborTurnaj, alt: "Nábor HC Háje - turnaj" },
  { src: naborSulcak, alt: "Nábor HC Háje - zápas" },
];

const NABOR_VIDEOS = [
  { id: 1, url: "https://youtube.com/shorts/qXrqO4WdFps?feature=share", title: "HC Háje Shorts 1" },
  { id: 2, url: "https://youtube.com/shorts/3Jwy9uqJu4M?feature=share", title: "HC Háje Shorts 2" },
  { id: 3, url: "https://youtube.com/shorts/0JEVSN4o9y0?feature=share", title: "HC Háje Shorts 3" },
];

const RECRUITMENT_BENEFITS = [
  "pohybové dovednosti a koordinaci",
  "rychlost, sílu a obratnost",
  "týmovou spolupráci",
  "zdravé sebevědomí",
  "odvahu, rozhodnost a fair play",
];

const INITIAL_FORM = {
  name: "",
  email: "",
  phonePrefix: "+420",
  phone: "",
  childName: "",
  birthYear: "",
  hasMoreChildren: false,
  secondChildName: "",
  secondBirthYear: "",
  experience: "",
  secondExperience: "",
  message: "",
  website: "",
};

const EXPERIENCE_OPTIONS = [
  { value: "none", label: "0 - žádné" },
  { value: "some", label: "1 - už někdy hrála" },
  { value: "advanced", label: "2 - hraje dobře - přechod z jiného družstva" },
];

const PHONE_PREFIXES = ["+420", "+421", "+49", "+43", "+48"];

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

const isValidPhone = (prefix: string, value: string) => {
  const digits = value.replace(/\D/g, "");
  if (prefix === "+420" || prefix === "+421") return digits.length === 9;
  return digits.length >= 7 && digits.length <= 12;
};

const getYoutubeEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;

    if (path.includes("/shorts/")) {
      const shortId = path.split("/shorts/")[1]?.split("/")[0];
      if (shortId) return `https://www.youtube.com/embed/${shortId}?rel=0`;
    }

    if (path === "/watch") {
      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = path.replace("/", "");
      if (videoId) return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }

    return url;
  } catch {
    return url;
  }
};

export default function ChciSePridatPage() {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const videoScrollRef = useRef<HTMLDivElement>(null);
  const scrollVideos = (dir: 1 | -1) => {
    const el = videoScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.offsetWidth, behavior: "smooth" });
  };
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSending, setIsSending] = useState(false);
  const [submitState, setSubmitState] = useState<{ type: "idle" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setGalleryIndex((previous) => (previous + 1) % NABOR_GALLERY.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const checked = type === "checkbox" ? (event.target as HTMLInputElement).checked : undefined;
    let nextValue = value;
    if (name === "phone") nextValue = value.replace(/\D/g, "").slice(0, formData.phonePrefix === "+420" || formData.phonePrefix === "+421" ? 9 : 12);
    if (name === "birthYear" || name === "secondBirthYear") nextValue = value.replace(/\D/g, "").slice(0, 4);
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : nextValue,
      ...(name === "hasMoreChildren" && !checked ? { secondChildName: "", secondBirthYear: "", secondExperience: "" } : {}),
    }));
  };

  const emailIsValid = formData.email.length > 0 && isValidEmail(formData.email);
  const phoneIsValid = formData.phone.length > 0 && isValidPhone(formData.phonePrefix, formData.phone);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSending(true);
    setSubmitState({ type: "idle", message: "" });
    if (!isValidEmail(formData.email)) { setSubmitState({ type: "error", message: "Zadejte prosím platný e-mail." }); setIsSending(false); return; }
    if (!isValidPhone(formData.phonePrefix, formData.phone)) { setSubmitState({ type: "error", message: "Zadejte prosím platné telefonní číslo bez předvolby." }); setIsSending(false); return; }
    if (formData.hasMoreChildren && !formData.secondExperience) { setSubmitState({ type: "error", message: "Vyberte prosím zkušenosti s házenou i u dalšího dítěte." }); setIsSending(false); return; }
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Odeslání se nepodařilo.");
      setFormData(INITIAL_FORM);
      setSubmitState({ type: "success", message: "Zpráva byla úspěšně odeslána. Ozveme se vám co nejdříve." });
    } catch (error: any) {
      setSubmitState({ type: "error", message: error.message || "Zprávu se nepodařilo odeslat. Zkuste to prosím znovu." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <PageHero title="Nábor" subtitle="Přijď si vyzkoušet házenou v HC Háje." />

      {/* Intro */}
      <section className="reveal-on-scroll pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionLabel>Nábor hráček</SectionLabel>
              <h2 className="text-3xl lg:text-4xl text-white uppercase mb-6" style={{ fontFamily: bebas }}>
                Hledáš pro svou dceru sport, který ji bude bavit?
              </h2>
              <p className="text-white text-lg mb-4" style={{ fontFamily: inter }}>
                {nbspShortWords("Přidej se k nám do dívčího házenkářského klubu HC Háje na Jižním Městě. Nabíráme nové hráčky všech úrovní od úplných začátečnic až po sportovně založené dívky, které chtějí zkusit něco nového.")}
              </p>
              <p className="text-white/55 mb-4" style={{ fontFamily: inter }}>
                {nbspShortWords("U nejmenších dětí stavíme hlavně na radosti z pohybu, hrách a pozitivním vztahu ke sportu. Děti vedeme krok za krokem tak, aby měly ze sportu dlouhodobě dobrý pocit.")}
              </p>
              <p className="text-white/55 mb-8" style={{ fontFamily: inter }}>
                {nbspShortWords("První trénink je u nás vždy zdarma a nezávazně. Přijďte mezi nás objevit radost z pohybu a týmového sportu.")}
              </p>
              <a
                href="#kontaktni-formular"
                className="inline-flex items-center gap-2 rounded-full px-8 py-3 bg-[#F587B9] text-[#080C08] hover:brightness-110 hover:shadow-[0_0_20px_rgba(245,135,185,0.28)] uppercase transition-all duration-300"
                style={{ fontFamily: bebas, letterSpacing: "0.08em" }}
              >
                Chci zkušební trénink
               <ArrowRight className="w-5 h-5" />
              </a>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group">
              {NABOR_GALLERY.map((item, index) => (
                <ImageWithFallback
                  key={item.alt}
                  src={item.src}
                  alt={item.alt}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${index === galleryIndex ? "opacity-100" : "opacity-0"}`}
                />
              ))}
              <div className="absolute inset-0 border border-[#6EE76D]/10 rounded-2xl pointer-events-none" />
              <button
                type="button"
                onClick={() => setGalleryIndex((previous) => (previous - 1 + NABOR_GALLERY.length) % NABOR_GALLERY.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Předchozí fotka"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setGalleryIndex((previous) => (previous + 1) % NABOR_GALLERY.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Další fotka"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {NABOR_GALLERY.map((item, index) => (
                  <button
                    key={item.alt + "-dot"}
                    type="button"
                    onClick={() => setGalleryIndex(index)}
                    className={`h-2 rounded-full transition-all ${index === galleryIndex ? "bg-[#6EE76D] w-6" : "bg-white/30 w-2"}`}
                    aria-label={`Přejít na fotku ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="reveal-on-scroll pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            <div>
              <SectionLabel>Koho hledáme?</SectionLabel>
              <h3 className="text-2xl lg:text-3xl text-white uppercase mb-5" style={{ fontFamily: bebas }}>Kategorie náboru</h3>
              <ul className="space-y-3 text-white/85" style={{ fontFamily: inter }}>
                <li className="flex items-start gap-2">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#6EE76D] flex-shrink-0" />
                  <span>Přípravka: 5–8 let</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#6EE76D] flex-shrink-0" />
                  <span>Minižákyně: 8–10 let</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#6EE76D] flex-shrink-0" />
                  <span>Starší družstva: 10 let a starší</span>
                </li>
              </ul>
            </div>

            <div>
              <SectionLabel>Proč právě házená?</SectionLabel>
              <h3 className="text-2xl lg:text-3xl text-white uppercase mb-5" style={{ fontFamily: bebas }}>Co dětem dá</h3>
              <ul className="space-y-3 text-white/85" style={{ fontFamily: inter }}>
                {RECRUITMENT_BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#6EE76D] flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="reveal-on-scroll pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="rounded-2xl border border-[#6EE76D]/20 bg-[#101a10] p-6 lg:p-8">
            <SectionLabel>Jak trénujeme?</SectionLabel>
            <h3 className="text-2xl lg:text-3xl text-white uppercase mb-5" style={{ fontFamily: bebas }}>Miniházená pro nejmladší</h3>
            <p className="text-white/80 mb-4" style={{ fontFamily: inter }}>
              {nbspShortWords("U nejmladších začínáme miniházenou, zábavnou a bezpečnou verzí házené pro děti. Hraje se s měkkým míčem, na menším hřišti a s menšími bránami. Díky tomu si děti rychle osvojí základy a hra je opravdu baví.")}
            </p>
            <p className="text-white/80" style={{ fontFamily: inter }}>
              {nbspShortWords("V létě trénujeme na venkovním hřišti, v zimě v tělocvičnách na Jižním Městě. První měsíc tréninků je zpravidla zdarma bez členských poplatků, dál se domluvíme individuálně.")}
            </p>
          </div>
        </div>
      </section>

      <section className="reveal-on-scroll pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <SectionLabel>Jak to u nás vypadá</SectionLabel>
              <h2 className="text-3xl lg:text-4xl text-white uppercase" style={{ fontFamily: bebas }}>
                Videa z tréninků a turnajů
              </h2>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => scrollVideos(-1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0e160e]/90 border border-[#6EE76D]/15 text-white/70 hover:text-white transition"
                aria-label="Posunout doleva"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollVideos(1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0e160e]/90 border border-[#6EE76D]/15 text-white/70 hover:text-white transition"
                aria-label="Posunout doprava"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div ref={videoScrollRef} className="flex gap-5 overflow-x-auto pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NABOR_VIDEOS.map((video) => (
              <article
                key={video.id}
                className="rounded-2xl overflow-hidden border border-[#6EE76D]/12 bg-[#101a10] flex-shrink-0 w-[calc((100%-2.5rem)/3)] min-w-[200px]"
              >
                <div className="relative aspect-[9/16] bg-black">
                  <iframe
                    src={getYoutubeEmbedUrl(video.url)}
                    title={video.title}
                    className="absolute inset-0 w-full h-full"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Mohlo by vás zajímat */}
      <section className="reveal-on-scroll pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionLabel>Zjistěte více</SectionLabel>
          <h2 className="text-3xl lg:text-4xl text-white uppercase mb-10" style={{ fontFamily: bebas }}>Mohlo by vás zajímat</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            <Link
              to="/o-klubu#treneri"
              className="p-5 rounded-2xl bg-[#101a10] border border-[#6EE76D]/12 hover:border-[#6EE76D]/25 transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <UserRound className="w-5 h-5 text-[#6EE76D] flex-shrink-0" />
                <h3 className="text-white uppercase group-hover:text-[#6EE76D] transition-colors text-xl" style={{ fontFamily: bebas }}>Naši trenéři</h3>
              </div>
              <p className="text-white/35 text-sm" style={{ fontFamily: inter }}>Kdo vede vaše dítě</p>
            </Link>
            <Link
              to="/druzstva"
              className="p-5 rounded-2xl bg-[#101a10] border border-[#6EE76D]/12 hover:border-[#6EE76D]/25 transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-[#6EE76D] flex-shrink-0" />
                <h3 className="text-white uppercase group-hover:text-[#6EE76D] transition-colors text-xl" style={{ fontFamily: bebas }}>Naše družstva</h3>
              </div>
              <p className="text-white/35 text-sm" style={{ fontFamily: inter }}>Všechny věkové kategorie</p>
            </Link>
            <Link
              to="/o-klubu"
              className="p-5 rounded-2xl bg-[#101a10] border border-[#6EE76D]/12 hover:border-[#6EE76D]/25 transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-[#6EE76D] flex-shrink-0" />
                <h3 className="text-white uppercase group-hover:text-[#6EE76D] transition-colors text-xl" style={{ fontFamily: bebas }}>Jak to u nás vypadá</h3>
              </div>
              <p className="text-white/35 text-sm" style={{ fontFamily: inter }}>O klubu a prostředí</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact + Form */}
      <section id="kontaktni-formular" className="reveal-on-scroll pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <SectionLabel>Kontakt</SectionLabel>
            <h2 className="text-4xl lg:text-5xl text-white uppercase mb-4" style={{ fontFamily: bebas }}>
              Přijďte si to vyzkoušet
            </h2>
            <p className="text-white/55 max-w-2xl mx-auto" style={{ fontFamily: inter }}>
              {nbspShortWords("Domluvte si návštěvu na prvním ukázkovém tréninku přes kontakty níže. Nebo vyplňte kontaktní formulář a ozveme se vám zpět.")}
            </p>
          </div>

          <div className="p-8 lg:p-10 rounded-2xl bg-gradient-to-r from-[#6EE76D]/8 via-[#6EE76D]/4 to-[#6EE76D]/8 border border-[#6EE76D]/15">
            <SectionLabel>Těšíme se na vás</SectionLabel>
            <h2 className="text-3xl lg:text-4xl text-white uppercase mb-6" style={{ fontFamily: bebas }}>
              První trénink je zdarma
            </h2>

            {submitState.type !== "idle" && (
              <div
                className={`mb-6 rounded-2xl px-4 py-3 text-sm ${submitState.type === "success" ? "bg-[#6EE76D]/12 text-[#9CF59B] border border-[#6EE76D]/25" : "bg-red-500/10 text-red-200 border border-red-400/20"}`}
                style={{ fontFamily: inter }}
              >
                {submitState.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-0">
                  <input type="text" name="website" value={formData.website} onChange={handleChange} className="hidden" tabIndex={-1} autoComplete="off" />

                  <div className="pb-8">
                    <h3 className="text-white uppercase mb-5 tracking-[0.08em]" style={{ fontFamily: bebas }}>Údaje rodiče</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <label className="block md:col-span-2">
                        <span className="mb-2 block text-white/75 text-sm" style={{ fontFamily: inter }}>Jméno a příjmení</span>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full rounded-2xl border border-[#6EE76D]/15 bg-[#0d160d] px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-[#6EE76D]/45" placeholder="Např. Jana Nováková" />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-white/75 text-sm" style={{ fontFamily: inter }}>E-mail</span>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className={`w-full rounded-2xl border bg-[#0d160d] px-4 py-3 text-white placeholder:text-white/35 outline-none ${formData.email.length > 0 ? (emailIsValid ? "border-[#6EE76D]/45" : "border-red-400/45") : "border-[#6EE76D]/15"}`} placeholder="vas@email.cz" />
                        {formData.email.length > 0 && (
                          <p className={`mt-2 text-sm ${emailIsValid ? "text-[#9CF59B]" : "text-red-300"}`} style={{ fontFamily: inter }}>
                            {emailIsValid ? "E-mail vypadá správně." : "Zadejte prosím platný e-mail."}
                          </p>
                        )}
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-white/75 text-sm" style={{ fontFamily: inter }}>Telefon</span>
                        <div className="grid grid-cols-[98px_1fr] gap-2">
                          <div className="relative">
                            <select name="phonePrefix" value={formData.phonePrefix} onChange={handleChange} className="w-full appearance-none rounded-2xl border border-[#6EE76D]/15 bg-[#0d160d] pl-3 pr-8 py-3 text-white outline-none focus:border-[#6EE76D]/45">
                              {PHONE_PREFIXES.map((prefix) => <option key={prefix} value={prefix}>{prefix}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                          </div>
                          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required inputMode="numeric" className={`w-full rounded-2xl border bg-[#0d160d] px-4 py-3 text-white placeholder:text-white/35 outline-none ${formData.phone.length > 0 ? (phoneIsValid ? "border-[#6EE76D]/45" : "border-red-400/45") : "border-[#6EE76D]/15"}`} placeholder="777 721 282" />
                        </div>
                        {formData.phone.length > 0 && (
                          <p className={`mt-2 text-sm ${phoneIsValid ? "text-[#9CF59B]" : "text-red-300"}`} style={{ fontFamily: inter }}>
                            {phoneIsValid ? "Telefon vypadá dobře." : "Zadejte telefon bez předvolby ve správném formátu."}
                          </p>
                        )}
                      </label>
                    </div>
                  </div>

                <div className="border-t border-white/8 pt-8 pb-8">
                  <h3 className="text-white uppercase mb-3 tracking-[0.08em]" style={{ fontFamily: bebas }}>Údaje dítěte</h3>
                  <p className="text-white/55 text-sm mb-4" style={{ fontFamily: inter }}>
                    {nbspShortWords("HC Háje je dívčí klub a tréninky jsou určené pro holky, které si chtějí házenou nezávazně vyzkoušet.")}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="mb-2 block text-white/75 text-sm" style={{ fontFamily: inter }}>Jméno a příjmení dítěte</span>
                      <input type="text" name="childName" value={formData.childName} onChange={handleChange} required className="w-full rounded-2xl border border-[#6EE76D]/15 bg-[#0d160d] px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-[#6EE76D]/45" placeholder="Např. Eliška Nováková" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-white/75 text-sm" style={{ fontFamily: inter }}>Rok narození</span>
                      <input type="text" name="birthYear" value={formData.birthYear} onChange={handleChange} required inputMode="numeric" className="w-full rounded-2xl border border-[#6EE76D]/15 bg-[#0d160d] px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-[#6EE76D]/45" placeholder="Např. 2014" />
                    </label>
                  </div>
                  <div className="mt-5">
                    <span className="mb-2 block text-white/75 text-sm" style={{ fontFamily: inter }}>Zkušenosti s házenou</span>
                    <div className="flex flex-wrap gap-3">
                      {EXPERIENCE_OPTIONS.map((option) => {
                        const isActive = formData.experience === option.value;
                        return (
                          <label key={option.value} className={`rounded-full border px-4 py-2 text-sm transition-all cursor-pointer ${isActive ? "border-[#F587B9] bg-[#F587B9]/12 text-white shadow-[0_0_18px_rgba(245,135,185,0.12)]" : "border-white/10 text-white/70 hover:border-[#F587B9]/40 hover:text-white"}`} style={{ fontFamily: inter }}>
                            <input type="radio" name="experience" value={option.value} checked={isActive} onChange={handleChange} className="sr-only" required />
                            {option.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <label className="mt-5 inline-flex items-center gap-3 cursor-pointer select-none">
                    <input type="checkbox" name="hasMoreChildren" checked={formData.hasMoreChildren} onChange={handleChange} className="sr-only" />
                    <span className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.hasMoreChildren ? "bg-[#6EE76D] border-[#6EE76D]" : "border-[#6EE76D]/30 bg-[#0d160d]"}`}>
                      {formData.hasMoreChildren && <span className="w-2 h-2 rounded-sm bg-[#080C08]" />}
                    </span>
                    <span className="text-white/80 text-sm" style={{ fontFamily: inter }}>Chci přijít s více dětmi</span>
                  </label>
                  {formData.hasMoreChildren && (
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <label className="block">
                        <span className="mb-2 block text-white/75 text-sm" style={{ fontFamily: inter }}>Jméno a příjmení dalšího dítěte</span>
                        <input type="text" name="secondChildName" value={formData.secondChildName} onChange={handleChange} required={formData.hasMoreChildren} className="w-full rounded-2xl border border-[#6EE76D]/15 bg-[#0d160d] px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-[#6EE76D]/45" placeholder="Např. Anna Nováková" />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-white/75 text-sm" style={{ fontFamily: inter }}>Rok narození dalšího dítěte</span>
                        <input type="text" name="secondBirthYear" value={formData.secondBirthYear} onChange={handleChange} required={formData.hasMoreChildren} inputMode="numeric" className="w-full rounded-2xl border border-[#6EE76D]/15 bg-[#0d160d] px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-[#6EE76D]/45" placeholder="Např. 2016" />
                      </label>
                      <div className="md:col-span-2 mt-1">
                        <span className="mb-2 block text-white/75 text-sm" style={{ fontFamily: inter }}>Zkušenosti s házenou u dalšího dítěte</span>
                        <div className="flex flex-wrap gap-3">
                          {EXPERIENCE_OPTIONS.map((option) => {
                            const isActive = formData.secondExperience === option.value;
                            return (
                              <label key={`second-${option.value}`} className={`rounded-full border px-4 py-2 text-sm transition-all cursor-pointer ${isActive ? "border-[#F587B9] bg-[#F587B9]/12 text-white shadow-[0_0_18px_rgba(245,135,185,0.12)]" : "border-white/10 text-white/70 hover:border-[#F587B9]/40 hover:text-white"}`} style={{ fontFamily: inter }}>
                                <input type="radio" name="secondExperience" value={option.value} checked={isActive} onChange={handleChange} className="sr-only" required={formData.hasMoreChildren} />
                                {option.label}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/8 pt-8">
                  <label className="block">
                    <span className="mb-2 block text-white/75 text-sm" style={{ fontFamily: inter }}>Zpráva</span>
                    <textarea name="message" value={formData.message} onChange={handleChange} required rows={6} className="w-full rounded-2xl border border-[#6EE76D]/15 bg-[#0d160d] px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-[#6EE76D]/45 resize-y" placeholder="Napište nám, o co máte zájem…" />
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
                  <p className="text-white/45 text-sm" style={{ fontFamily: inter }}>Odpovíme vám na e-mail nebo telefon co nejdříve.</p>
                  <button type="submit" disabled={isSending} className="rounded-full px-8 py-3 bg-[#F587B9] text-[#080C08] hover:brightness-110 hover:shadow-[0_0_20px_rgba(245,135,185,0.28)] disabled:opacity-70 disabled:cursor-not-allowed uppercase transition-all duration-300 inline-flex items-center justify-center gap-2" style={{ fontFamily: bebas, letterSpacing: "0.08em" }}>
                    {isSending ? "Odesílám..." : "Odeslat zprávu"}
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
            </form>
          </div>

          <div className="mt-8 lg:mt-10">
            <h3 className="text-2xl lg:text-3xl text-white uppercase mb-5" style={{ fontFamily: bebas }}>Ozvěte se na přímo</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {[
                { icon: Phone, name: "Petr Paulín", value: "792 336 535", href: "tel:+420792336535" },
                { icon: Phone, name: "Petr Zálešák", value: "777 721 282", href: "tel:+420777721282" },
                { icon: Phone, name: "Kateřina Bláhová", value: "608 981 667", href: "tel:+420608981667" },
                { icon: Mail, name: "E-mail", value: "pripravkahchaje@gmail.com", href: "mailto:pripravkahchaje@gmail.com" },
              ].map((contact) => (
                <a
                  key={contact.name}
                  href={contact.href}
                  className="rounded-2xl border border-[#6EE76D]/15 bg-[#101a10] px-4 py-4 hover:border-[#6EE76D]/35 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-[#6EE76D]/10 flex items-center justify-center flex-shrink-0">
                      <contact.icon className="w-4 h-4 text-[#6EE76D]" />
                    </div>
                    <p className="text-white text-base leading-tight" style={{ fontFamily: inter }}>{contact.name}</p>
                  </div>
                  <p className="text-white text-base leading-tight break-all" style={{ fontFamily: inter }}>{contact.value}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
