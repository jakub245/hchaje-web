const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

declare const process: any;

const FALLBACK_NOTION_TOKEN = "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";
const FALLBACK_NOTION_DATABASE_ID = "350c5ef377c780dc942cf8b85ee0366e";

const COACHES_CACHE_TTL_MS = 1000 * 60 * 3;

type CachedCoaches = {
  coaches: Array<{
    id: string;
    name: string;
    position: string;
    sortPriority: number;
    teamName: string;
    teamSlug: string;
    phone: string;
    email: string;
    photoUrl: string;
    age: string;
  }>;
  fetchedAt: number;
};

let cachedCoaches: CachedCoaches | null = null;

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

const parseDateOfBirth = (property: any): string => {
  if (!property || typeof property !== "object") return "";
  if (property.type === "date" && property.date?.start) return property.date.start;
  const rich = parseRichText(property);
  return rich;
};

const parseNumberLike = (property: any): number | null => {
  if (!property || typeof property !== "object") return null;

  if (property.type === "number" && typeof property.number === "number") return property.number;
  if (property.type === "formula" && property.formula?.type === "number" && typeof property.formula.number === "number") {
    return property.formula.number;
  }

  const text = parseRichText(property).trim();
  const value = Number(text.replace(",", "."));
  return Number.isFinite(value) ? value : null;
};

const rankByPosition = (position: string): number => {
  const normalized = normalizeKey(position || "");
  if (normalized.includes("hlavni")) return 0;
  if (normalized.includes("asistent") || normalized.includes("assistant")) return 1;
  return 2;
};

const parseSortPriority = (properties: Record<string, any>, position: string): number => {
  const priorityProp = findProperty(properties, [
    "Důležitost",
    "Dulezitost",
    "Priorita",
    "Priority",
    "Pořadí",
    "Poradi",
    "Order",
  ]);

  const numberValue = parseNumberLike(priorityProp);
  if (numberValue !== null) return numberValue;

  const textValue = parseRichText(priorityProp);
  if (textValue) return rankByPosition(textValue);

  return rankByPosition(position);
};

const calculateAge = (dob: string): string => {
  if (!dob) return "";
  const parts = dob.includes("-") ? dob.split("-") : dob.split(".").reverse();
  if (parts.length < 3) return "";
  const [year, month, day] = parts.map(Number);
  if (!year || !month || !day) return "";
  const today = new Date();
  let age = today.getFullYear() - year;
  const hasBirthdayPassed = today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!hasBirthdayPassed) age -= 1;
  return String(age);
};

const getPhotoDebug = (url: string) => {
  const fileId = extractGoogleDriveFileId(url);
  const isDrive = url.includes("drive.google.com");
  return {
    originalUrl: url,
    isDrive,
    fileId,
    driveViewUrl: fileId ? `https://drive.google.com/file/d/${fileId}/view` : "",
    driveUcUrl: fileId ? `https://drive.google.com/uc?export=view&id=${fileId}` : "",
    driveThumbnailUrl: fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200` : "",
  };
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

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const loadCoachesFromNotion = async () => {
  const notionToken = process.env.NOTION_TOKEN || FALLBACK_NOTION_TOKEN;
  const notionDatabaseId = process.env.NOTION_COACHES_DATABASE_ID || FALLBACK_NOTION_DATABASE_ID;

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

  const rawCoaches = await Promise.all(
    pages.map(async (page: any, index: number) => {
      const properties = page?.properties ?? {};
      if (!resolveVisibility(properties)) return null;
      const name = parseTitle(findProperty(properties, ["Jméno", "Jmeno", "Name"]) || properties["title"]);
      const position = parseRichText(findProperty(properties, ["Pozice", "Role", "Position"])) || "";
      const sortPriority = parseSortPriority(properties, position);
      const phone = parseRichText(findProperty(properties, ["Telefon", "Phone"])) || "";
      const email = parseRichText(findProperty(properties, ["E-mail", "Email", "Mail"])) || "";
      const photoUrl = parsePhotoUrl(findProperty(properties, ["Fotka", "Foto", "Fotografie", "Profilovka", "Photo", "Image", "Avatar"])) || "";
      const dobRaw = parseDateOfBirth(findProperty(properties, [
        "Datum narozeni",
        "Datum narození",
        "Datum narozeni trenéra",
        "Datum narození trenéra",
        "Datum",
        "Narození",
        "Narozeni",
        "Narozeniny",
        "DOB",
        "Birthday",
        "Birth date",
        "Vek narozeni",
        "Věk narozeni",
        "Věk",
        "Vek",
      ])) || "";
      const age = calculateAge(dobRaw);

      const teamProperty = findProperty(properties, ["Družstvo", "Druzstvo", "Team", "Tým", "Tym"]);
      let teamName = "Nezařazeno";
      let teamSlug = "";

      if (teamProperty?.type === "relation") {
        const relationIds = (teamProperty.relation ?? []).map((relation: any) => relation?.id).filter(Boolean);
        if (relationIds.length > 0) {
          const resolvedNames = await Promise.all(relationIds.map((relationId: string) => readRelatedTitle(relationId)));
          const resolved = resolvedNames.filter(Boolean);
          if (resolved.length > 0) {
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
        }
      }

      return {
        id: page?.id || `notion-coach-${index}`,
        name,
        position,
        sortPriority,
        teamName,
        teamSlug,
        phone,
        email,
        photoUrl,
        age,
      };
    }),
  );

  return rawCoaches.filter((coach): coach is NonNullable<typeof coach> => coach !== null);
};

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const debugMode = req?.query?.debug === "1";
    const freshMode = req?.query?.fresh === "1";
    const now = Date.now();
    const canUseCache = !freshMode && cachedCoaches && now - cachedCoaches.fetchedAt < COACHES_CACHE_TTL_MS;
    const coaches = canUseCache && cachedCoaches ? cachedCoaches.coaches : await loadCoachesFromNotion();

    if (!canUseCache) {
      cachedCoaches = {
        coaches,
        fetchedAt: now,
      };
    }

    res.setHeader("Cache-Control", "s-maxage=180, stale-while-revalidate=600");

    if (debugMode) {
      const debug = coaches.map((coach) => ({
        id: coach.id,
        name: coach.name,
        photo: getPhotoDebug(coach.photoUrl || ""),
      }));

      return res.status(200).json({
        coaches,
        source: canUseCache ? "cache" : "notion",
        debug,
      });
    }

    return res.status(200).json({ coaches, source: canUseCache ? "cache" : "notion" });
  } catch (error: any) {
    console.error("Coaches API error:", error);

    if (cachedCoaches) {
      res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=600");
      return res.status(200).json({ coaches: cachedCoaches.coaches, source: "cache" });
    }

    return res.status(500).json({
      error: "Trenéry se nepodařilo načíst z Notion.",
      detail: error?.message || "Unknown error",
    });
  }
}
