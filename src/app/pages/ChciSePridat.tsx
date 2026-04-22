import { useState } from "react";
import { Mail } from "lucide-react";
import {
  PageHero,
  SectionLabel,
  CtaStrip,
  bebas,
  inter,
  nbspShortWords,
} from "../components/shared";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

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

export default function ChciSePridatPage() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSending, setIsSending] = useState(false);
  const [submitState, setSubmitState] = useState<{ type: "idle" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  });

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
      <PageHero title="Nábor" subtitle="Přijďte si házenou nezávazně vyzkoušet. První trénink je zdarma." />

      {/* Intro */}
      <section className="reveal-on-scroll pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionLabel>Proč HC Háje</SectionLabel>
              <h2 className="text-3xl lg:text-4xl text-white uppercase mb-6" style={{ fontFamily: bebas }}>
                Místo, kde holky milují sport
              </h2>
              <p className="text-white text-lg mb-4" style={{ fontFamily: inter }}>
                {nbspShortWords("HC Háje je dívčí a ženský házenkářský klub z Prahy 4. Přijímáme holky od 6 let bez ohledu na předchozí zkušenosti se sportem.")}
              </p>
              <p className="text-white/55 mb-4" style={{ fontFamily: inter }}>
                {nbspShortWords("V nejmladších kategoriích stavíme na pohybových hrách a všeobecné sportovní průpravě. Cílem je hlavně radost z pohybu, kamarádství a postupný rozvoj házenkářských dovedností.")}
              </p>
              <p className="text-white/55" style={{ fontFamily: inter }}>
                {nbspShortWords("První trénink je u nás vždy zdarma a nezávazně. Stačí vyplnit formulář níže a my se vám ozveme s bližšími informacemi.")}
              </p>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1575367728985-8cb72541609a?w=800"
                alt="Nábor HC Háje"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border border-[#6EE76D]/10 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section className="reveal-on-scroll pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 lg:p-12 rounded-2xl bg-gradient-to-r from-[#6EE76D]/8 via-[#6EE76D]/4 to-[#6EE76D]/8 border border-[#6EE76D]/15">
            <div className="max-w-3xl mx-auto">
              <SectionLabel>Napište nám</SectionLabel>
              <h2 className="text-3xl lg:text-4xl text-white uppercase mb-4" style={{ fontFamily: bebas }}>
                Přihlášení na trénink
              </h2>
              <p className="text-white/45 mb-8" style={{ fontFamily: inter }}>
                {nbspShortWords("První trénink je u nás zdarma a nezávazně. Napište nám pár informací a ozveme se vám co nejdříve.")}
              </p>

              {submitState.type !== "idle" && (
                <div
                  className={`mb-6 rounded-2xl px-4 py-3 text-sm ${submitState.type === "success" ? "bg-[#6EE76D]/12 text-[#9CF59B] border border-[#6EE76D]/25" : "bg-red-500/10 text-red-200 border border-red-400/20"}`}
                  style={{ fontFamily: inter }}
                >
                  {submitState.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <input type="text" name="website" value={formData.website} onChange={handleChange} className="hidden" tabIndex={-1} autoComplete="off" />

                <div className="rounded-2xl border border-[#6EE76D]/12 bg-[#0d160d]/80 p-5">
                  <h3 className="text-white uppercase mb-4 tracking-[0.08em]" style={{ fontFamily: bebas }}>Údaje rodiče</h3>
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
                        <select name="phonePrefix" value={formData.phonePrefix} onChange={handleChange} className="rounded-2xl border border-[#6EE76D]/15 bg-[#0d160d] px-3 py-3 text-white outline-none focus:border-[#6EE76D]/45">
                          {PHONE_PREFIXES.map((prefix) => <option key={prefix} value={prefix}>{prefix}</option>)}
                        </select>
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

                <div className="rounded-2xl border border-[#6EE76D]/12 bg-[#0d160d]/80 p-5">
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

                <label className="block">
                  <span className="mb-2 block text-white/75 text-sm" style={{ fontFamily: inter }}>Zpráva</span>
                  <textarea name="message" value={formData.message} onChange={handleChange} required rows={6} className="w-full rounded-2xl border border-[#6EE76D]/15 bg-[#0d160d] px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-[#6EE76D]/45 resize-y" placeholder="Napište nám, o co máte zájem…" />
                </label>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                  <p className="text-white/45 text-sm" style={{ fontFamily: inter }}>Odpovíme vám na e-mail nebo telefon co nejdříve.</p>
                  <button type="submit" disabled={isSending} className="rounded-full px-8 py-3 bg-[#F587B9] text-[#080C08] hover:brightness-110 hover:shadow-[0_0_20px_rgba(245,135,185,0.28)] disabled:opacity-70 disabled:cursor-not-allowed uppercase transition-all duration-300 inline-flex items-center justify-center gap-2" style={{ fontFamily: bebas, letterSpacing: "0.08em" }}>
                    {isSending ? "Odesílám..." : "Odeslat zprávu"}
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <CtaStrip />
    </>
  );
}
