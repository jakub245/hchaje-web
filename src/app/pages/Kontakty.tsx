import { Phone, Mail, MapPin, Clock, Instagram, Facebook, ArrowUpRight } from "lucide-react";
import {
  PageHero,
  SectionLabel,
  bebas,
  inter,
  CONTACT_PHONE,
  CONTACT_EMAIL,
  CONTACT_ADDRESS_TITLE,
  CONTACT_ADDRESS,
  MAP_URL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  nbspShortWords,
} from "../components/shared";

export default function KontaktyPage() {
  return (
    <>
      <PageHero title="Kontakty" subtitle="Chcete se přidat, máte dotaz nebo nás chcete navštívit? Ozvěte se!" />

      <section className="reveal-on-scroll pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact info */}
            <div>
              <SectionLabel>Kontaktní informace</SectionLabel>
              <h2 className="text-3xl lg:text-4xl text-white uppercase mb-8" style={{ fontFamily: bebas }}>Ozvěte se nám</h2>

              <div className="space-y-6 mb-10">
                {[
                  { icon: Phone, label: "Telefon", value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/\s/g, "")}` },
                  { icon: Mail, label: "E-mail", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#6EE76D]/10 flex items-center justify-center flex-shrink-0">
                      <c.icon className="w-5 h-5 text-[#6EE76D]" />
                    </div>
                    <div>
                      <p className="text-white/35 text-sm mb-1">{c.label}</p>
                      <a href={c.href} className="text-white hover:text-[#6EE76D] transition-colors">{c.value}</a>
                    </div>
                  </div>
                ))}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#6EE76D]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#6EE76D]" />
                  </div>
                  <div>
                    <p className="text-white/35 text-sm mb-1">Kde nás najdete</p>
                    <p className="text-white">{nbspShortWords(CONTACT_ADDRESS_TITLE)}</p>
                    <a
                      href={MAP_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/50 hover:text-[#6EE76D] transition-colors inline-flex items-center gap-1"
                    >
                      {nbspShortWords(CONTACT_ADDRESS)} <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                    <p className="text-white/35 text-sm mt-1">GPS: 50.0365389N, 14.5359419E</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#6EE76D]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#6EE76D]" />
                  </div>
                  <div>
                    <p className="text-white/35 text-sm mb-1">Tréninky</p>
                    <p className="text-white">Po – Pá, 16:00 – 21:00</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#6EE76D]/15 flex items-center justify-center text-white/35 hover:text-[#6EE76D] hover:border-[#6EE76D]/30 transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#6EE76D]/15 flex items-center justify-center text-white/35 hover:text-[#6EE76D] hover:border-[#6EE76D]/30 transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-[#6EE76D]/10 h-[400px] lg:h-auto min-h-[400px]">
              <iframe
                src="https://www.google.com/maps?q=50.0365389,14.5359419&z=16&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.8) contrast(1.2)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa – Areál TJ Háje"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
