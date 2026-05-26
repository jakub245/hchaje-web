// ⚠️ UPRAVENO podle klienta 28. 4. 2026
// NOVÉ: Mladší dorostenky, Starší dorostenky
// TODO: tréninky pro nové kategorie

import miniPhoto from "../../imports/foto/druzstva/Minizakyne.jpg";
import pripravkaPhoto from "../../imports/foto/druzstva/Pripravka.jpg";

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const teamHeroFiles = import.meta.glob("../../imports/**/*.{jpg,jpeg,png,webp,svg}", { eager: true, as: "url" }) as Record<string, string>;

const TEAM_HERO_ALIASES: Record<string, string[]> = {
  "pripravka": ["pripravka"],
  "mini-zakyne": ["minizakyne", "mini2025"],
  "mladsi-zakyne": ["mladsizakyne"],
  "starsi-zakyne": ["starsizakyne", "starsizacky"],
  "mladsi-dorostenky": ["mladsidorost", "mladsidorostenky"],
  "starsi-dorostenky": ["starsidorost", "starsidorostenky"],
  "zeny": ["zeny"],
};

const resolveTeamHero = (slug: string, teamName: string, fallback: string) => {
  const slugKey = normalizeText(slug);
  const nameKey = normalizeText(teamName);
  const aliasKeys = TEAM_HERO_ALIASES[slug] ?? [];

  const match = Object.entries(teamHeroFiles)
    .sort(([pathA], [pathB]) => {
      const aPreferred = pathA.includes("/foto/druzstva/") ? 0 : 1;
      const bPreferred = pathB.includes("/foto/druzstva/") ? 0 : 1;
      return aPreferred - bPreferred;
    })
    .find(([path]) => {
    const fileName = path.split("/").pop()?.replace(/\.(jpg|jpeg|png|webp|svg)$/i, "") || "";
    const key = normalizeText(fileName);
    return key === slugKey || key === nameKey || aliasKeys.includes(key);
    });

  return match?.[1] || fallback;
};

const TEAM_ORDER = [
  "pripravka",
  "mini-zakyne",
  "mladsi-zakyne",
  "starsi-zakyne",
  "mladsi-dorostenky",
  "starsi-dorostenky",
  "zeny",
] as const;

const TEAM_ORDER_MAP = new Map(TEAM_ORDER.map((slug, index) => [slug, index] as const));

export interface Player { name: string; position: string; number?: string | number; }
export interface Training { day: string; time: string; hall: string; }
export interface TrainingSection { title: string; items: Training[]; }
export interface TeamNews { date: string; title: string; excerpt?: string; content?: string; }
export interface TeamEvent { date: string; title: string; location: string; }
export interface Team {
  slug: string; name: string; shortName: string; desc: string; longDesc: string;
  img: string; coach: string; assistantCoach?: string; playerCount: number;
  ageRange: string; trainings: Training[]; trainingSections?: TrainingSection[];
  players: Player[]; news: TeamNews[]; events?: TeamEvent[];
}

const CLUB_NEWS: TeamNews[] = [
  { date: "12. 4. 2026", title: "Klubové focení a společné odpoledne v areálu Háje", excerpt: "Celý klub se sejde na společném focení, krátkém programu pro rodiče a neformálním posezení po trénincích.", content: "V neděli odpoledne nás čeká společné klubové focení všech kategorií, krátké setkání s rodiči a společný program v areálu Háje." },
  { date: "28. 3. 2026", title: "HC Háje děkuje rodičům a partnerům za podporu jarní části sezóny", excerpt: "Děkujeme všem, kdo pomáhají vytvářet děvčatům skvělé prostředí pro sport, růst a radost ze hry.", content: "Jarní část sezóny je v plném proudu a my si velmi vážíme podpory rodičů, dobrovolníků i partnerů klubu." },
];

const TEAM_DATA: Team[] = [
  {
    slug: "zeny", name: "Ženy", shortName: "Ženy",
    desc: "A-tým hrající 2. ligu - Čechy.",
    longDesc: "Ženský tým představuje vrchol klubové cesty, kde se propojují zkušenosti, výkonnost a týmová soudržnost. Hráčky rozvíjejí technickou i taktickou vyspělost, schopnost zvládat náročné zápasové situace a společně usilují o co nejlepší sportovní výsledky. Důležitou součástí je také týmový charakter, vzájemná podpora a radost ze společné hry i reprezentace klubu.",
    img: resolveTeamHero("zeny", "Ženy", "https://images.unsplash.com/photo-1552127966-d24b805b9be7?w=800"),
    coach: "Miroslav Cabalka", assistantCoach: "Magdaléna Cabalková",
    playerCount: 18, ageRange: "18+",
    trainings: [
      { day: "Úterý", time: "18:00 – 19:30", hall: "Sportovní hala Háje" },
      { day: "Středa", time: "19:30 – 21:00", hall: "Sportovní hala Háje" },
      { day: "Čtvrtek", time: "19:00 – 20:30", hall: "Sportovní hala Háje" },
    ],
    players: [
      { name: "Tereza Nováková", position: "Spojka", number: 7 },
      { name: "Kristýna Malá", position: "Brankářka", number: 1 },
      { name: "Lucie Svobodová", position: "Křídlo", number: 11 },
      { name: "Anna Procházková", position: "Pivotka", number: 9 },
      { name: "Barbora Černá", position: "Spojka", number: 5 },
      { name: "Eliška Veselá", position: "Křídlo", number: 14 },
      { name: "Kateřina Horáková", position: "Spojka", number: 8 },
      { name: "Michaela Králová", position: "Brankářka", number: 12 },
    ],
    news: [
      { date: "10. 4. 2026", title: "Postup do semifinále krajského přeboru!", excerpt: "Naše ženy zvládly důležitý duel a vybojovaly si účast v semifinále krajského přeboru." },
      { date: "5. 4. 2026", title: "Výhra nad Slavií Praha 28:24", excerpt: "A-tým potvrdil dobrou formu a po bojovném výkonu bere cenné vítězství." },
      { date: "29. 3. 2026", title: "Přátelský zápas s Duklou — 22:25", excerpt: "Přátelské utkání nabídlo kvalitní prověrku a další zkušenosti pro závěr sezóny." },
    ],
    events: [
      { date: "25. 04. 2026", title: "Turnaj 4+1", location: "Sportovní hala Háje" },
      { date: "02. 05. 2026", title: "Memoriál Karla Šulce 4+1", location: "Plzeň" },
      { date: "17. 05. 2026", title: "Turnaj 4+1", location: "Sportovní hala Háje" },
      { date: "30. 05. 2026", title: "Turnaj 4+1 + Pořadatelství HC Háje", location: "Areál TJ Háje" },
      { date: "06. 06. 2026", title: "Mináček 4+1", location: "DHC Slavia" },
      { date: "14. 06. 2026", title: "Závěrečný turnaj 4+1", location: "Astra" },
    ],
  },
  {
    slug: "starsi-zakyne", name: "Starší žákyně", shortName: "St. žákyně",
    desc: "Soutěžní tým 12-14 let.",
    longDesc: "Kategorie starších žákyň navazuje na získané základy a rozvíjí herní dovednosti do větší variability a jistoty i pod tlakem soupeře. Hráčky si osvojují základy pozičního útoku, spolupráci v menších skupinách i specifické role na hřišti, přičemž se učí lépe využívat prostor a rozhodovat se v reálných herních situacích. Důraz je kladen také na samostatnost, zodpovědnost za vlastní výkon a pochopení širších souvislostí hry i regenerace.",
    img: resolveTeamHero("starsi-zakyne", "Starší žákyně", "imports/foto/druzstva/starsi zakyne/textura (1).png"),
    coach: "Milan Ernest", assistantCoach: "Pavla Martin",
    playerCount: 16, ageRange: "12-14 let",
    trainings: [
      { day: "Úterý", time: "16:00 – 17:30", hall: "Sportovní hala Háje" },
      { day: "Čtvrtek", time: "17:00 – 18:30", hall: "Sportovní hala Háje" },
    ],
    players: [
      { name: "Sofie Dvořáková", position: "Spojka", number: 3 },
      { name: "Natálie Pospíšilová", position: "Brankářka", number: 1 },
      { name: "Adéla Kratochvílová", position: "Křídlo", number: 10 },
      { name: "Ema Šťastná", position: "Pivotka", number: 6 },
      { name: "Viktorie Marková", position: "Spojka", number: 8 },
      { name: "Karolína Benešová", position: "Křídlo", number: 15 },
    ],
    news: [
      { date: "8. 4. 2026", title: "Turnaj v Berouně — 2. místo", excerpt: "Starší žákyně předvedly na turnaji velmi dobré výkony a odváží si krásné druhé místo." },
      { date: "1. 4. 2026", title: "Výhra v Pražské lize: HC Háje vs. Kobylisy 19:14", excerpt: "Důležitý zápas v Pražské lize zvládl tým skvěle a potvrdil svůj herní posun." },
    ],
  },
  {
    slug: "mladsi-zakyne", name: "Mladší žákyně", shortName: "Ml. žákyně",
    desc: "Dívky 10–12 let rozvíjející herní dovednosti.",
    longDesc: "Kategorie mladších žákyň se zaměřuje na všestranný rozvoj herních dovedností, pohybové gramotnosti a porozumění základním herním principům.\n\nVelký důraz klademe na týmovou spolupráci, zdravou soutěživost a přirozenou motivaci neustále se zlepšovat. Součástí našeho přístupu je také rozvoj disciplíny, herního myšlení a schopnosti zvládat zápasové situace s maximálním nasazením.\n\nNaším cílem je vytvářet prostředí, ve kterém hráčky rostou nejen sportovně, ale i osobnostně, učí se odpovědnosti vůči týmu a získávají pozitivní vztah ke sportu i zdravému pohybu.",
    img: resolveTeamHero("mladsi-zakyne", "Mladší žákyně", "https://images.unsplash.com/photo-1575367728985-8cb72541609a?w=800"),
    coach: "Júlia Dvořáková", assistantCoach: "Petr Novák",
    playerCount: 20, ageRange: "10–12 let",
    trainings: [
      { day: "Pondělí", time: "17:45 – 19:15", hall: "Sportovní hala Háje" },
      { day: "Středa", time: "17:45 – 19:15", hall: "Sportovní hala Háje" },
    ],
    players: [
      { name: "Ella Novotná", position: "Spojka", number: 4 },
      { name: "Amálie Kučerová", position: "Brankářka", number: 1 },
      { name: "Rozálie Jandová", position: "Křídlo", number: 7 },
      { name: "Nela Urbanová", position: "Spojka", number: 9 },
      { name: "Anežka Říhová", position: "Pivotka", number: 5 },
    ],
    news: [
      { date: "6. 4. 2026", title: "Mini turnaj v Háji — skvělé výkony!", excerpt: "Mladší žákyně ukázaly v domácím prostředí energii, týmovost a velkou chuť do hry." },
      { date: "25. 3. 2026", title: "Nové dresy pro mladší žákyně", excerpt: "Tým se představil v nových dresech, které budou provázet jarní část sezóny." },
    ],
  },
  {
    slug: "mini-zakyne", name: "Mini žákyně", shortName: "Mini",
    desc: "Nejmladší házenkářky 8–10 let.",
    longDesc: "Mini žákyně jsou budoucností našeho klubu. Trénujeme formou her a zábavných cvičení, která děti baví a zároveň rozvíjejí koordinaci, rychlost a základní házenkářské dovednosti. Holky se zde poprvé seznámí s velkou házenou 6+1.",
    img: resolveTeamHero("mini-zakyne", "Mini žákyně", miniPhoto),
    coach: "Petr Zálešák", assistantCoach: "Kateřina Bláhová",
    playerCount: 19, ageRange: "8–10 let",
    trainings: [
      { day: "Pondělí", time: "17:00 - 18:30", hall: "Hala TJ JM Chodov" },
      { day: "Úterý", time: "17:15 - 18:45", hall: "Tělocvična ZŠ K Milíčovu" },
      { day: "Čtvrtek", time: "16:30 - 18:00", hall: "Tělocvična ZŠ Mendelova" },
    ],
    trainingSections: [
      { title: "Tréninky září, květen - červen", items: [
        { day: "Pondělí", time: "17:00 - 18:30", hall: "Hala TJ JM Chodov" },
        { day: "Úterý", time: "16:30 - 18:00", hall: "Areál TJ Háje" },
        { day: "Čtvrtek", time: "16:30 - 18:00", hall: "Areál TJ Háje" },
      ]},
      { title: "Tréninky říjen - duben", items: [
        { day: "Pondělí", time: "17:00 - 18:30", hall: "Hala TJ JM Chodov" },
        { day: "Úterý", time: "17:15 - 18:45", hall: "Tělocvična ZŠ K Milíčovu" },
        { day: "Čtvrtek", time: "16:30 - 18:00", hall: "Tělocvična ZŠ Mendelova" },
      ]},
    ],
    players: [
      { name: "Badíková Barbora", position: "2016", number: "092689" },
      { name: "Bouzidová Tina", position: "2016", number: "096619" },
      { name: "Čadová Aneta", position: "2015", number: "092688" },
      { name: "Fleissigová Elena", position: "2015", number: "092619" },
      { name: "Holečková Sára", position: "2015", number: "092637" },
      { name: "Horvátová Michaela", position: "2015", number: "099866" },
      { name: "Hradilová Ema", position: "2015", number: "089838" },
      { name: "Kiszová Tereza", position: "2015", number: "090108" },
      { name: "Latif Jasmína", position: "2016", number: "092621" },
      { name: "Lípová Sára", position: "2015", number: "099867" },
      { name: "Mančalová Klára", position: "2015", number: "089843" },
      { name: "Marková Kateřina", position: "2015", number: "085903" },
      { name: "Peterková Rozálie", position: "2015", number: "092642" },
      { name: "Růžičková Julie", position: "2016", number: "092640" },
      { name: "Suchánková Berenika", position: "2015", number: "092687" },
      { name: "Šimunská Kristina", position: "2015", number: "094726" },
      { name: "Vadinská Karla", position: "2015", number: "094727" },
      { name: "Zemanová Johana", position: "2016", number: "096618" },
      { name: "Žďánská Tereza", position: "2015", number: "089840" },
    ],
    news: [
      { date: "9. 4. 2026", title: "Nábor mini žákyň — přijďte si to zkusit!", excerpt: "Do minižákyň hledáme nové holčičky, které chtějí objevovat házenou zábavnou formou." },
      { date: "3. 4. 2026", title: "Účast na jarním festivalu v Modřanech", excerpt: "Minižákyně si odvezly z festivalu spoustu zážitků, radosti a nových herních zkušeností." },
      { date: "03.03.2025", title: "5+1 v Heroldových sadech", excerpt: "Druhá polovina sezóny je tu a naše MINI se dnes zúčastnily svazového turnaje 5+1 v hale Sokol Vršovice." },
    ],
  },
  {
    slug: "pripravka", name: "Přípravka", shortName: "Přípravka",
    desc: "Sportovní kroužek pro holky 6-8 let",
    longDesc: "Přípravka je určená pro úplné začátečnice. Formou hry a pohybových aktivit se holky učí základům házené i obecné sportovní přípravě. Cílem je hlavně radost z pohybu a kamarádství. Utkání se hrají formou miniházené 4+1 s měkkým míčem a na menším hřišti.",
    img: resolveTeamHero("pripravka", "Přípravka", pripravkaPhoto),
    coach: "Petr Paulín", assistantCoach: "Nela Černá",
    playerCount: 18, ageRange: "6–8 let",
    trainings: [
      { day: "Úterý", time: "17:15 - 18:45", hall: "Tělocvična ZŠ K Milíčovu" },
      { day: "Čtvrtek", time: "16:30 - 18:00", hall: "Tělocvična ZŠ Mendelova" },
    ],
    trainingSections: [
      { title: "Tréninky září, květen - červen", items: [
        { day: "Úterý", time: "17:00 - 18:30", hall: "Areál TJ Háje" },
        { day: "Čtvrtek", time: "17:00 - 18:30", hall: "Areál TJ Háje" },
      ]},
      { title: "Tréninky říjen - duben", items: [
        { day: "Úterý", time: "17:15 - 18:45", hall: "Tělocvična ZŠ K Milíčovu" },
        { day: "Čtvrtek", time: "16:30 - 18:00", hall: "Tělocvična ZŠ Mendelova" },
      ]},
    ],
    players: [
      { name: "Bachynská Viktorie", position: "2017", number: "099871" },
      { name: "Barroso Lilien", position: "2017", number: "099135" },
      { name: "Fuchsová Diana Patricie", position: "2017", number: "099136" },
      { name: "Hromasová Bára", position: "2017", number: "096678" },
      { name: "Jakýmová Melisa", position: "2018", number: "099968" },
      { name: "Kiszová Veronika", position: "2019", number: "093135" },
      { name: "Krupková Magdalena", position: "2019", number: "099137" },
      { name: "Lhotková Laura", position: "2017", number: "098526" },
      { name: "Macečková Sofie", position: "2018", number: "092641" },
      { name: "Máchová Anežka", position: "2017", number: "099134" },
      { name: "Málková Anežka", position: "2017", number: "092643" },
      { name: "Málková Štěpánka", position: "2019", number: "092644" },
      { name: "Marušková Magdaléna", position: "2018", number: "094878" },
      { name: "Mrázová Adéla", position: "2019", number: "096620" },
      { name: "Mrázová Amálie", position: "2021", number: "100044" },
      { name: "Paulínová Adina", position: "2017", number: "096672" },
      { name: "Pětníková Julie", position: "2017", number: "096695" },
      { name: "Šimonová Vanda", position: "2017", number: "096041" },
      { name: "Zemanová Justýna", position: "2020", number: "099275" },
    ],
    news: [
      { date: "7. 4. 2026", title: "Přípravka — nábor nových holčiček!", excerpt: "Přípravka otevírá dveře novým zájemkyním, které chtějí začít se sportem a pohybem." },
      { date: "30. 3. 2026", title: "Závěrečný turnaj přípravek v Háji", excerpt: "Domácí turnaj přinesl radost ze hry, první góly i spoustu sportovních zážitků." },
    ],
  },

  // ✅ NOVÉ
  {
    slug: "mladsi-dorostenky", name: "Mladší dorostenky", shortName: "Ml. dorostenky",
    desc: "Soutěžní tým 14-16 let.",
    longDesc: "Kategorie mladších dorostenek je obdobím výrazného výkonnostního růstu, kdy hráčky rozvíjejí samostatnost, zodpovědný přístup k tréninku a zdravý životní styl. Vedle zachování univerzálnosti začíná také specializace podle herních postů, zdokonalování individuálních činností v útoku i obraně a schopnost rozhodovat se pod tlakem soupeře. Důležitou součástí přípravy je práce s tempem hry, analýza výkonu a regenerace jako přirozená součást cesty za zlepšením.",
    img: resolveTeamHero("mladsi-dorostenky", "Mladší dorostenky", "https://images.unsplash.com/photo-1769614075229-bfc51a41aa78?w=800"),
    coach: "Václav Škarda", assistantCoach: "Jana Klímová",
    playerCount: 0, ageRange: "14-16 let",
    trainings: [], players: [], news: [],
  },

  // ✅ NOVÉ
  {
    slug: "starsi-dorostenky", name: "Starší dorostenky", shortName: "St. dorostenky",
    desc: "Soutěžní tým 16-18 let.",
    longDesc: "Kategorie starších dorostenek připravuje hráčky na přechod do seniorského házenkářského prostředí a další výkonnostní posun. Důraz je kladen na zdokonalení individuálního herního stylu na konkrétních postech, přesnost rozhodování v klíčových situacích a schopnost zvládat náročné herní momenty včetně početní nerovnováhy. Součástí přípravy je také cílený rozvoj kondice, mentální odolnosti, individuální práce a kvalitní regenerace.",
    img: resolveTeamHero("starsi-dorostenky", "Starší dorostenky", "https://images.unsplash.com/photo-1552127966-d24b805b9be7?w=800"),
    coach: "Anna Šimánková", assistantCoach: "Stanislav Toman",
    playerCount: 0, ageRange: "16-18 let",
    trainings: [], players: [], news: [],
  },
];

export const TEAMS: Team[] = [...TEAM_DATA].sort(
  (a, b) => (TEAM_ORDER_MAP.get(a.slug) ?? Number.MAX_SAFE_INTEGER) - (TEAM_ORDER_MAP.get(b.slug) ?? Number.MAX_SAFE_INTEGER),
);

export function getTeamBySlug(slug: string): Team | undefined {
  return TEAMS.find((t) => t.slug === slug);
}

export function getAllTeamNews() {
  const clubItems = CLUB_NEWS.map((item, index) => ({ ...item, id: `klub-${index}`, teamName: "Klub", teamSlug: "klub" }));
  const teamItems = TEAMS.flatMap((team) => team.news.map((item, index) => ({ ...item, id: `${team.slug}-${index}`, teamName: team.name, teamSlug: team.slug })));
  return [...clubItems, ...teamItems];
}
