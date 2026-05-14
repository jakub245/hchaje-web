const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

declare const process: any;

const FALLBACK_NOTION_TOKEN = "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";
const FALLBACK_NOTION_DATABASE_ID = "350c5ef377c780e7a67be50f9152fe33";

const TEAM_RELATION_ID_FALLBACKS: Record<string, string> = {
  "34fc5ef3-77c7-8004-80d6-e612c6bfe13c": "Ženy",
  "34fc5ef3-77c7-8016-b874-c183af150bed": "Starší žákyně",
  "34fc5ef3-77c7-8043-a650-da788c7a6af3": "Mini žákyně",
  "34fc5ef3-77c7-8047-868d-fddcf75eeab6": "Mladší dorostenky",
  "34fc5ef3-77c7-805a-933a-d59276d6113f": "Přípravka",
  "34fc5ef3-77c7-8068-938d-e5216e062d1a": "Starší dorostenky",
  "34fc5ef3-77c7-80ea-a91f-db3ee248dc25": "Mladší žákyně",
};

const PLAYERS_CACHE_TTL_MS = 1000 * 60; // Reduced to 1 minute

type CachedPlayers = {
  players: Array<{
    id: string;
    name: string;
    year: string;
    position: string;
    number: string;
    teamName: string;
    teamSlug: string;
    teamNames?: string[];
    teamSlugs?: string[];
    photoUrl: string;
  }>;
  fetchedAt: number;
};

let cachedPlayers: CachedPlayers | null = null;

const normalizeKey = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

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

const parseTitle = (property: any): string => {
  if (!property || typeof property !== "object") return "";
  const title = property.title ?? [];
  const value = title.map((item: any) => item?.plain_text || "").join("").trim();
  return value || "";
};

const parseNumber = (property: any): string => {
  if (!property || typeof property !== "object") return "";
  if (property.type === "number" && property.number !== null && property.number !== undefined) {
    return String(property.number);
  }
  if (property.type === "rich_text") {
    return parseRichText(property);
  }
  return "";
};

const extractGoogleDriveFileId = (value: string): string => {
  const fromFilePath = value.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fromFilePath?.[1]) return fromFilePath[1];

  const fromQuery = value.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (fromQuery?.[1]) return fromQuery[1];

  return "";
};

const normalizePhotoUrl = (value: string): string => {
  if (!value) return "";
  if (!value.includes("drive.google.com")) return value;

  const fileId = extractGoogleDriveFileId(value);
  if (!fileId) return value;
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
};

const parsePhotoUrl = (property: any): string => {
  if (!property || typeof property !== "object") return "";

  if (property.type === "files") {
    const fileItem = (property.files ?? [])[0];
    const rawUrl = fileItem?.external?.url || fileItem?.file?.url || "";
    return normalizePhotoUrl(rawUrl);
  }

  if (property.type === "url") {
    return normalizePhotoUrl(property.url || "");
  }

  const rich = parseRichText(property);
  return normalizePhotoUrl(rich);
};

const parseProperty = (property: any): string => {
  if (!property || typeof property !== "object") return "";
  
  // Handle select
  if (property.type === "select" && property.select) {
    return property.select.name || "";
  }
  
  // Handle multi_select
  if (property.type === "multi_select" && property.multi_select) {
    return (property.multi_select as any[]).map((item: any) => item.name).join(", ");
  }
  
  // Handle number
  if (property.type === "number" && property.number !== null && property.number !== undefined) {
    return String(property.number);
  }
  
  // Handle rich_text / title
  return parseRichText(property);
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

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
      if (["true", "ano", "yes", "1", "on", "published", "zverejneno", "zveřejněno", "publikováno", "publikovano"].includes(value)) return true;
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

  return true;
};

const loadPlayersFromNotion = async () => {
  const notionToken = process.env.NOTION_TOKEN || FALLBACK_NOTION_TOKEN;
  const notionDatabaseId = process.env.NOTION_PLAYERS_DATABASE_ID || FALLBACK_NOTION_DATABASE_ID;

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
  };

  const rawPlayers = await Promise.all(
    pages.map(async (page: any, index: number) => {
      const properties = page?.properties ?? {};
      if (!resolveVisibility(properties)) return null;
      const name = parseTitle(findProperty(properties, ["Jméno", "Jmeno", "Name"]) || properties.title);
      const year = parseProperty(findProperty(properties, ["Ročník", "Rocnik", "Year", "Věk", "Vek"])) || "";
      const position = parseProperty(findProperty(properties, ["Pozice", "Post", "Role", "Position"])) || "";
      const number = parseNumber(findProperty(properties, ["Číslo", "Cislo", "Číslo hráčky", "Cislo hracky", "Number", "Registrační číslo", "Registracni cislo"])) || "";
      const photoUrl = parsePhotoUrl(findProperty(properties, ["Fotka", "Foto", "Fotografie", "Profilovka", "Photo", "Image", "Avatar"])) || "";

      const teamProperty = findProperty(properties, ["Družstvo", "Druzstvo", "Team", "Tým", "Tym"]);
      let teamName = "Nezařazeno";
      let teamSlug = "";
      let teamNames: string[] = [];
      let teamSlugs: string[] = [];

      if (teamProperty?.type === "relation") {
        const relationIds = (teamProperty.relation ?? []).map((relation: any) => relation?.id).filter(Boolean);
        if (relationIds.length > 0) {
          const resolvedNames = await Promise.all(
            relationIds.map(async (relationId: string) => {
              const resolvedName = await readRelatedTitle(relationId);
              if (resolvedName) return resolvedName;
              return TEAM_RELATION_ID_FALLBACKS[relationId] || "";
            }),
          );
          const resolved = resolvedNames.filter(Boolean);
          if (resolved.length > 0) {
            teamNames = resolved;
            teamSlugs = resolved.map((value) => toSlug(value)).filter(Boolean);
            teamName = resolved[0];
            teamSlug = toSlug(teamName);
          }
        }
      }

      if (teamName === "Nezařazeno") {
        const plain = parseRichText(teamProperty);
        if (plain) {
          teamName = plain;
          teamSlug = toSlug(teamName);
          teamNames = [teamName];
          teamSlugs = teamSlug ? [teamSlug] : [];
        }
      }

      const resolvedTeamNames = teamNames.length > 0 ? teamNames : [];
      const resolvedTeamSlugs = teamSlugs.length > 0 ? teamSlugs : [];

      return {
        id: page?.id || `notion-player-${index}`,
        name,
        year,
        position,
        number,
        teamName,
        teamSlug,
        teamNames: resolvedTeamNames,
        teamSlugs: resolvedTeamSlugs,
        photoUrl,
      };
    }),
  );

  return rawPlayers
    .filter((player): player is NonNullable<typeof player> => player !== null)
    .filter((player) => player.name)
    .sort((a, b) => a.name.localeCompare(b.name, "cs"));
};

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const freshMode = req?.query?.fresh === "1";
    const now = Date.now();
    const canUseCache = !freshMode && cachedPlayers && now - cachedPlayers.fetchedAt < PLAYERS_CACHE_TTL_MS;
    const players = canUseCache && cachedPlayers ? cachedPlayers.players : await loadPlayersFromNotion();

    if (!canUseCache) {
      cachedPlayers = {
        players,
        fetchedAt: now,
      };
    }

    res.setHeader("Cache-Control", "s-maxage=180, stale-while-revalidate=600");
    return res.status(200).json({ players, source: canUseCache ? "cache" : "notion" });
  } catch (error: any) {
    console.error("Players API error:", error);

    if (cachedPlayers) {
      res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=600");
      return res.status(200).json({ players: cachedPlayers.players, source: "cache" });
    }

    return res.status(500).json({
      error: "Hráčky se nepodařilo načíst z Notion.",
      detail: error?.message || "Unknown error",
    });
  }
}
