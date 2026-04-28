const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

declare const process: any;

const FALLBACK_NOTION_TOKEN = "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";
const FALLBACK_NOTION_DATABASE_ID = "350c5ef377c78092a67cd5e8b3869bb8";

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
  if (!property || typeof property !== "object") return "Akce";
  const title = property.title ?? [];
  const value = title.map((item: any) => item?.plain_text || "").join("").trim();
  return value || "Akce";
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const parseDateTs = (value: string) => {
  const clean = value.replace(/\s/g, "");
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) return new Date(clean).getTime();

  const [day, month, year] = clean.split(".").filter(Boolean);
  if (!day || !month || !year) return Number.MAX_SAFE_INTEGER;
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
};

const loadEventsFromNotion = async () => {
  const notionToken = process.env.NOTION_TOKEN || FALLBACK_NOTION_TOKEN;
  const notionDatabaseId = process.env.NOTION_DATABASE_ID || FALLBACK_NOTION_DATABASE_ID;

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

  const rawEvents = await Promise.all(
    pages.map(async (page: any, index: number) => {
      const properties = page?.properties ?? {};
      const title = parseTitle(findProperty(properties, ["Název", "Nazev", "Name", "Event"]) || properties["title"]);
      const date = parseRichText(findProperty(properties, ["Datum od", "Datum", "Date", "Kdy"])) || "—";
      const location = parseRichText(findProperty(properties, ["Místo", "Misto", "Location", "Kde"])) || "";

      const teamProperty = findProperty(properties, ["Družstva", "Druzstva", "Team", "Tým", "Tym"]);
      let teamName = "Nezařazeno";

      if (teamProperty?.type === "relation") {
        const relationIds = (teamProperty.relation ?? []).map((relation: any) => relation?.id).filter(Boolean);
        if (relationIds.length > 0) {
          const names = await Promise.all(relationIds.map((relationId: string) => readRelatedTitle(relationId)));
          const resolved = names.filter(Boolean);
          if (resolved.length > 0) teamName = resolved.join(", ");
        }
      }

      if (teamName === "Nezařazeno") {
        const plain = parseRichText(teamProperty);
        if (plain) teamName = plain;
      }

      return {
        id: page?.id || `notion-${index}`,
        date,
        title,
        location,
        teamName,
        teamSlug: toSlug(teamName),
      };
    }),
  );

  return rawEvents.sort((a: any, b: any) => parseDateTs(a.date) - parseDateTs(b.date));
};

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const events = await loadEventsFromNotion();
    return res.status(200).json({ events, source: "notion" });
  } catch (error: any) {
    console.error("Events API error:", error);
    return res.status(500).json({
      error: "Akce se nepodařilo načíst z Notion.",
      detail: error?.message || "Unknown error",
    });
  }
}
