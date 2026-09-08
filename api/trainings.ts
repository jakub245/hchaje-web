const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

declare const process: any;

const FALLBACK_NOTION_TOKEN = "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";
const FALLBACK_NOTION_DATABASE_ID = "350c5ef377c780f697d7eae5d0688831";
const TRAININGS_CACHE_TTL_MS = 1000 * 60; // Reduced to 1 minute

const TEAM_RELATION_ID_FALLBACKS: Record<string, string> = {
  "34fc5ef3-77c7-8004-80d6-e612c6bfe13c": "Ženy",
  "34fc5ef3-77c7-8016-b874-c183af150bed": "Starší žákyně",
  "34fc5ef3-77c7-8043-a650-da788c7a6af3": "Mini žákyně",
  "34fc5ef3-77c7-8047-868d-fddcf75eeab6": "Mladší dorostenky",
  "34fc5ef3-77c7-805a-933a-d59276d6113f": "Přípravka",
  "34fc5ef3-77c7-8068-938d-e5216e062d1a": "Starší dorostenky",
  "34fc5ef3-77c7-80ea-a91f-db3ee248dc25": "Mladší žákyně",
};

type TrainingItem = {
  id: string;
  day: string;
  time: string;
  hall: string;
  section: string;
  teamName: string;
  teamSlug: string;
};

type CachedTrainings = {
  trainings: TrainingItem[];
  fetchedAt: number;
};

let cachedTrainings: CachedTrainings | null = null;

const normalizeKey = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const resolveCanonicalTeamSlug = (teamName: string) => {
  const key = normalizeKey(teamName);

  if (key.includes("zen")) return "zeny";
  if (key.includes("starsidorosten")) return "starsi-dorostenky";
  if (key.includes("mladsidorosten")) return "mladsi-dorostenky";
  if (key.includes("starsi") && key.includes("zak")) return "starsi-zakyne";
  if (key.includes("mladsi") && key.includes("zak")) return "mladsi-zakyne";
  if (key.includes("mini") && key.includes("zak")) return "mini-zakyne";
  if (key.includes("priprav")) return "pripravka";

  return toSlug(teamName);
};

const findProperty = (properties: Record<string, any>, names: string[]) => {
  const map = new Map(Object.entries(properties).map(([key, value]) => [normalizeKey(key), value] as const));
  for (const name of names) {
    const hit = map.get(normalizeKey(name));
    if (hit) return hit;
  }
  return undefined;
};

const parseRichText = (property: any): string => {
  if (!property || typeof property !== "object") return "";
  if (property.type === "title") {
    const rich = property.title ?? [];
    return rich.map((item: any) => item?.plain_text || "").join("").trim();
  }
  const rich = property.rich_text ?? [];
  return rich.map((item: any) => item?.plain_text || "").join("").trim();
};

const parseProperty = (property: any): string => {
  if (!property || typeof property !== "object") return "";

  if (property.type === "select" && property.select) {
    return property.select.name || "";
  }

  if (property.type === "multi_select" && property.multi_select) {
    return (property.multi_select as any[]).map((item: any) => item?.name || "").filter(Boolean).join(", ");
  }

  if (property.type === "number" && property.number !== null && property.number !== undefined) {
    return String(property.number);
  }

  if (property.type === "date" && property.date?.start) {
    return property.date.start;
  }

  if (property.type === "formula" && property.formula) {
    if (property.formula.type === "string") return property.formula.string || "";
    if (property.formula.type === "number") return String(property.formula.number ?? "");
  }

  return parseRichText(property);
};

const parseTimeWindow = (properties: Record<string, any>) => {
  const directTime = parseProperty(findProperty(properties, ["Čas", "Cas", "Time", "Kdy", "Trénink"])) || "";
  if (directTime) return directTime;

  const from = parseProperty(findProperty(properties, ["Čas od", "Cas od", "Od", "Začátek", "Zacatek", "Start"])) || "";
  const to = parseProperty(findProperty(properties, ["Čas do", "Cas do", "Do", "Konec", "End"])) || "";

  if (from && to) return `${from} - ${to}`;
  return from || to || "";
};

const parseBooleanLike = (property: any): boolean | null => {
  if (!property || typeof property !== "object") return null;

  if (property.type === "checkbox") return Boolean(property.checkbox);

  if (property.type === "formula" && property.formula) {
    if (property.formula.type === "boolean") return Boolean(property.formula.boolean);
    if (property.formula.type === "number" && property.formula.number !== null && property.formula.number !== undefined) {
      return Number(property.formula.number) !== 0;
    }
    if (property.formula.type === "string") {
      const value = String(property.formula.string || "").trim().toLowerCase();
      if (["true", "ano", "yes", "1", "on", "published", "zverejneno", "zveřejněno"].includes(value)) return true;
      if (["false", "ne", "no", "0", "off", "draft", "hidden", "skryto"].includes(value)) return false;
    }
  }

  if (property.type === "select" && property.select?.name) {
    const value = String(property.select.name).trim().toLowerCase();
    if (["ano", "yes", "true", "published", "active", "visible", "zobrazeno", "zveřejněno", "publikováno"].includes(value)) return true;
    if (["ne", "no", "false", "draft", "hidden", "inactive", "skryto"].includes(value)) return false;
  }

  const text = parseRichText(property).trim().toLowerCase();
  if (["ano", "yes", "true", "1", "on", "published", "active", "visible", "zobrazeno", "zveřejněno", "publikováno"].includes(text)) return true;
  if (["ne", "no", "false", "0", "off", "draft", "hidden", "inactive", "skryto"].includes(text)) return false;

  return null;
};

const resolveVisibility = (properties: Record<string, any>): boolean => {
  const visibilityProp = findProperty(properties, [
    "Zobrazeno",
    "Zobrazit",
    "Publikovano",
    "Publikováno",
    "Published",
    "Publish",
    "Aktivni",
    "Aktivní",
    "Visible",
    "Show",
  ]);

  const explicitValue = parseBooleanLike(visibilityProp);
  if (explicitValue !== null) return explicitValue;

  // Pokud není explicitní sloupec viditelnosti, necháme záznam zobrazený (zpětná kompatibilita).
  return true;
};

const loadTrainingsFromNotion = async () => {
  const notionToken = process.env.NOTION_TOKEN || FALLBACK_NOTION_TOKEN;
  const notionDatabaseId = process.env.NOTION_TRAININGS_DATABASE_ID || FALLBACK_NOTION_DATABASE_ID;

  const pages: any[] = [];
  let hasMore = true;
  let nextCursor: string | null = null;

  while (hasMore) {
    const response = await fetch(`${NOTION_API_BASE}/databases/${notionDatabaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionToken}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page_size: 100,
        ...(nextCursor ? { start_cursor: nextCursor } : {}),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Notion API error (${response.status}): ${detail}`);
    }

    const data = await response.json();
    pages.push(...(data.results ?? []));
    hasMore = Boolean(data.has_more);
    nextCursor = data.next_cursor ?? null;
  }

  const relatedTitleCache = new Map<string, string>();
  const readRelatedTitle = async (pageId: string) => {
    if (relatedTitleCache.has(pageId)) return relatedTitleCache.get(pageId) || "";

    try {
      const response = await fetch(`${NOTION_API_BASE}/pages/${pageId}`, {
        headers: {
          Authorization: `Bearer ${notionToken}`,
          "Notion-Version": NOTION_VERSION,
        },
      });

      if (!response.ok) {
        relatedTitleCache.set(pageId, "");
        return "";
      }

      const data = await response.json();
      const properties = data?.properties ?? {};
      const titleProperty = Object.values(properties).find((property: any) => property?.type === "title");
      const title = parseRichText(titleProperty);
      relatedTitleCache.set(pageId, title);
      return title;
    } catch {
      relatedTitleCache.set(pageId, "");
      return "";
    }
  };

  const rawTrainings = await Promise.all(
    pages.map(async (page: any, index: number) => {
      const properties = page?.properties ?? {};
      if (!resolveVisibility(properties)) return null;

      const day = parseProperty(findProperty(properties, ["Den", "Day"])) || "";
      const time = parseTimeWindow(properties) || "";
      const hall = parseProperty(findProperty(properties, ["Místo", "Misto", "Hala", "Hall", "Location"])) || "";
      const section = parseProperty(findProperty(properties, [
        "Sezona",
        "Sezóna",
        "Sekce",
        "Období",
        "Obdobi",
        "Období tréninků",
        "Obdobi treninku",
        "Rozvrh",
        "Skupina",
        "Blok",
        "Title",
        "Název",
        "Nazev",
      ])) || "";

      const teamProperty = findProperty(properties, ["Družstva", "Druzstva", "Družstvo", "Druzstvo", "Team", "Tým", "Tym"]);
      let teamName = "Nezařazeno";
      let teamSlug = "";

      if (teamProperty?.type === "relation") {
        const relationIds = (teamProperty.relation ?? []).map((relation: any) => relation?.id).filter(Boolean);
        if (relationIds.length > 0) {
          const resolvedNames = await Promise.all(
            relationIds.map(async (relationId: string) => {
              const fallbackName = TEAM_RELATION_ID_FALLBACKS[relationId] || "";
              if (fallbackName) return fallbackName;
              return await readRelatedTitle(relationId);
            }),
          );
          const resolved = resolvedNames.filter(Boolean);
          if (resolved.length > 0) {
            teamName = resolved[0];
            teamSlug = resolveCanonicalTeamSlug(teamName);
          }
        }
      }

      if (teamName === "Nezařazeno") {
        const plain = parseProperty(teamProperty);
        if (plain) {
          teamName = plain;
          teamSlug = resolveCanonicalTeamSlug(teamName);
        }
      }

      return {
        id: page?.id || `notion-training-${index}`,
        day,
        time,
        hall,
        section,
        teamName,
        teamSlug,
      };
    }),
  );

  return rawTrainings
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .filter((item) => item.day || item.time || item.hall);
};

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const freshMode = req?.query?.fresh === "1";
    const now = Date.now();
    const canUseCache = !freshMode && cachedTrainings && now - cachedTrainings.fetchedAt < TRAININGS_CACHE_TTL_MS;
    const trainings = canUseCache && cachedTrainings ? cachedTrainings.trainings : await loadTrainingsFromNotion();

    if (!canUseCache) {
      cachedTrainings = {
        trainings,
        fetchedAt: now,
      };
    }

    res.setHeader("Cache-Control", "s-maxage=180, stale-while-revalidate=600");
    return res.status(200).json({ trainings, source: canUseCache ? "cache" : "notion" });
  } catch (error: any) {
    console.error("Trainings API error:", error);

    if (cachedTrainings) {
      res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=600");
      return res.status(200).json({ trainings: cachedTrainings.trainings, source: "cache" });
    }

    return res.status(500).json({
      error: "Tréninky se nepodařilo načíst z Notion.",
      detail: error?.message || "Unknown error",
    });
  }
}
