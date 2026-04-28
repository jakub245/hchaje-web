const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

declare const process: any;

const FALLBACK_NOTION_TOKEN = "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";
const FALLBACK_NOTION_DATABASE_ID = "350c5ef377c78092a67cd5e8b3869bb8";

const parseRichText = (property: any): string => {
  if (!property || typeof property !== "object") return "";
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

  return pages
    .map((page: any, index: number) => {
      const properties = page?.properties ?? {};
      const title = parseTitle(properties["Název"] || properties["Nazev"] || properties["Name"] || properties["title"]);
      const date = parseRichText(properties["Datum od"] || properties["Datum"] || properties["Date"]) || "—";
      const location = parseRichText(properties["Místo"] || properties["Misto"] || properties["Location"]) || "";
      const teamName = parseRichText(properties["Družstva"] || properties["Druzstva"] || properties["Team"]) || "Nezařazeno";

      return {
        id: page?.id || `notion-${index}`,
        date,
        title,
        location,
        teamName,
        teamSlug: toSlug(teamName),
      };
    })
    .sort((a: any, b: any) => parseDateTs(a.date) - parseDateTs(b.date));
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
