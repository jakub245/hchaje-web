export interface Player {
  name: string;
  position: string;
  number?: string | number;
}

export interface Training {
  day: string;
  time: string;
  hall: string;
}

export interface TeamNews {
  date: string;
  title: string;
}

export interface TeamEvent {
  date: string;
  title: string;
  location: string;
}

export interface Team {
  slug: string;
  name: string;
  shortName: string;
  desc: string;
  longDesc: string;
  img: string;
  coach: string;
  assistantCoach?: string;
  playerCount: number;
  ageRange: string;
  trainings: Training[];
  players: Player[];
  news: TeamNews[];
  events?: TeamEvent[];
}

import miniPhoto from "../../imports/mini2025.jpg";

export const TEAMS: Team[] = [
  {
    slug: "zeny",
    name: "Ženy",
    shortName: "Ženy",
    desc: "Hlavní tým klubu hrající krajský přebor žen.",
    longDesc: "A-tým žen HC Háje je vlajkovou lodí klubu. Hrajeme krajský přebor a pravidelně se účastníme pohárových soutěží. Tým tvoří zkušené hráčky i mladé talenty z vlastní líhně.",
    img: "https://images.unsplash.com/photo-1552127966-d24b805b9be7?w=800",
    coach: "Mgr. Jana Dvořáková",
    assistantCoach: "Petr Novák",
    playerCount: 18,
    ageRange: "18+",
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
      { date: "10. 4. 2026", title: "Postup do semifinále krajského přeboru!" },
      { date: "5. 4. 2026", title: "Výhra nad Slavií Praha 28:24" },
      { date: "29. 3. 2026", title: "Přátelský zápas s Duklou — 22:25" },
    ],
    events: [
      { date: "25. 04. 2026", title: "Turnaj 4+1", location: "Sportovní hala Háje" },
      { date: "02. 05. 2026", title: "Memoriál Karla Šulce 4+1", location: "Plzeň" },
      { date: "17. 05. 2026", title: "Turnaj 4+1", location: "Sportovní hala Háje" },
      { date: "30. 05. 2026", title: "Turnaj 4+1 + Pořadatelství HC Háje", location: "Hřiště HC Háje" },
      { date: "06. 06. 2026", title: "Mináček 4+1", location: "DHC Slavia" },
      { date: "14. 06. 2026", title: "Závěrečný turnaj 4+1", location: "Astra" },
    ],
  },
  {
    slug: "starsi-zakyne",
    name: "Starší žákyně",
    shortName: "St. žákyně",
    desc: "Soutěžní tým dívek 13–15 let.",
    longDesc: "Starší žákyně tvoří výkonnostní základ klubu. Dívky se připravují na přechod do dorostenecké a ženské kategorie. Důraz klademe na rozvoj herních dovedností, taktiku a soutěžní zkušenosti.",
    img: "https://images.unsplash.com/photo-1769614075229-bfc51a41aa78?w=800",
    coach: "Petr Novák",
    playerCount: 16,
    ageRange: "13–15 let",
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
      { date: "8. 4. 2026", title: "Turnaj v Berouně — 2. místo" },
      { date: "1. 4. 2026", title: "Výhra v Pražské lize: HC Háje vs. Kobylisy 19:14" },
    ],
  },
  {
    slug: "mladsi-zakyne",
    name: "Mladší žákyně",
    shortName: "Ml. žákyně",
    desc: "Dívky 10–12 let rozvíjející herní dovednosti.",
    longDesc: "U mladších žákyň stavíme na radosti z pohybu a postupném rozvoji házenkářských dovedností. Dívky se učí týmovou hru, střelbu, přihrávky i základy obrany. Pravidelně se účastníme turnajů a soutěží.",
    img: "https://images.unsplash.com/photo-1575367728985-8cb72541609a?w=800",
    coach: "Kateřina Malá",
    playerCount: 20,
    ageRange: "10–12 let",
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
      { date: "6. 4. 2026", title: "Mini turnaj v Háji — skvělé výkony!" },
      { date: "25. 3. 2026", title: "Nové dresy pro mladší žákyně" },
    ],
  },
  {
    slug: "mini-zakyne",
    name: "Mini žákyně",
    shortName: "Mini",
    desc: "Nejmladší házenkářky 8–10 let.",
    longDesc: "Mini žákyně jsou budoucností našeho klubu. Trénujeme formou her a zábavných cvičení, která děti baví a zároveň rozvíjejí koordinaci, rychlost a základní házenkářské dovednosti. Každá holčička je u nás vítaná!",
    img: miniPhoto,
    coach: "Lucie Svobodová",
    assistantCoach: "Markéta Tichá",
    playerCount: 19,
    ageRange: "8–10 let",
    trainings: [
      { day: "Pondělí", time: "16:00 – 17:15", hall: "Sportovní hala Háje" },
      { day: "Středa", time: "16:00 – 17:15", hall: "Sportovní hala Háje" },
      { day: "Pátek", time: "16:00 – 17:15", hall: "Sportovní hala Háje" },
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
      { date: "9. 4. 2026", title: "Nábor mini žákyň — přijďte si to zkusit!" },
      { date: "3. 4. 2026", title: "Účast na jarním festivalu v Modřanech" },
    ],
  },
  {
    slug: "pripravka",
    name: "Přípravka",
    shortName: "Přípravka",
    desc: "Sportovní kroužek pro děvčata 6–8 let.",
    longDesc: "Přípravka je určená pro úplné začátečnice. Formou hry a pohybových aktivit se děvčata učí základům házené i obecné sportovní přípravě. Cílem je hlavně radost z pohybu a kamarádství.",
    img: "https://images.unsplash.com/photo-1606519740551-1fa9e7c68a02?w=800",
    coach: "Markéta Tichá",
    playerCount: 25,
    ageRange: "6–8 let",
    trainings: [
      { day: "Pondělí", time: "15:00 – 16:00", hall: "Sportovní hala Háje" },
      { day: "Pátek", time: "15:00 – 16:00", hall: "Sportovní hala Háje" },
    ],
    players: [
      { name: "Nikolka Hrubá", position: "Hráčka" },
      { name: "Zuzanka Vlčková", position: "Hráčka" },
      { name: "Johanka Němcová", position: "Hráčka" },
      { name: "Andělka Sýkorová", position: "Hráčka" },
    ],
    news: [
      { date: "7. 4. 2026", title: "Přípravka — nábor nových holčiček!" },
      { date: "30. 3. 2026", title: "Závěrečný turnaj přípravek v Háji" },
    ],
  },
];

export function getTeamBySlug(slug: string): Team | undefined {
  return TEAMS.find((t) => t.slug === slug);
}
