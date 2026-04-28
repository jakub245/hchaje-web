const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

const FALLBACK_NOTION_TOKEN = "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";
const FALLBACK_NOTION_DATABASE_ID = "350c5ef377c78092a67cd5e8b3869bb8";

type NotionPage = {
  id: string;
  properties?: Record<string, any>;
};

export type NotionEvent = {
  id: string;
  date: string;
  title: string;
  location: string;
  teamName: string;
  teamSlug: string;
};

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

const formatDateForCz = (value: string) => {
  if (!value) return "";

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [year, month, day] = value.slice(0, 10).split("-");
    return `${day}. ${month}. ${year}`;
  }

  return value;
};

const parseEventDate = (value: string) => {
  const clean = value.replace(/\s/g, "");

  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    return new Date(clean).getTime();
  }

  const [day, month, year] = clean.split(".").filter(Boolean);
  if (!day || !month || !year) return Number.MAX_SAFE_INTEGER;

  return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
};

const extractPlainText = (property: any): string => {
  if (!property || typeof property !== "object") return "";

  if (property.type === "title") {
    return (property.title ?? []).map((item: any) => item?.plain_text || "").join("").trim();
  }

  if (property.type === "rich_text") {
    return (property.rich_text ?? []).map((item: any) => item?.plain_text || "").join("").trim();
  }

  if (property.type === "select") {
    return property.select?.name?.trim?.() || "";
  }

  if (property.type === "multi_select") {
    return (property.multi_select ?? []).map((item: any) => item?.name || "").filter(Boolean).join(", ").trim();
  }

  if (property.type === "formula") {
    const formula = property.formula;
    if (!formula) return "";
    if (formula.type === "string") return formula.string?.trim?.() || "";
    if (formula.type === "number") return String(formula.number ?? "");
    if (formula.type === "boolean") return formula.boolean ? "Ano" : "Ne";
  }

  if (property.type === "relation") {
    return (property.relation ?? []).map((item: any) => item?.id || "").filter(Boolean).join(", ");
  }

  if (property.type === "people") {
    return (property.people ?? []).map((item: any) => item?.name || "").filter(Boolean).join(", ");
  }

  return "";
};

const extractDate = (property: any): string => {
  if (!property || typeof property !== "object") return "";

  if (property.type === "date") {
    return property.date?.start || "";
  }

  if (property.type === "formula" && property.formula?.type === "date") {
    return property.formula.date?.start || "";
  }

  const plain = extractPlainText(property);
  return plain;
};

const findProperty = (properties: Record<string, any> | undefined, names: string[]) => {
  if (!properties) return undefined;

  const entries = Object.entries(properties);
  const lookup = new Map(entries.map(([key, value]) => [normalizeKey(key), value] as const));

  for (const name of names) {
    const byName = lookup.get(normalizeKey(name));
    if (byName) return byName;
  }

  return undefined;
};

const parseNotionEvent = (page: NotionPage): NotionEvent | null => {
  const titleProp = findProperty(page.properties, ["Název", "Nazev", "Name", "Akce", "Event"]);
  const dateProp = findProperty(page.properties, ["Datum", "Date", "Kdy"]);
  const locationProp = findProperty(page.properties, ["Místo", "Misto", "Location", "Kde"]);
  const teamProp = findProperty(page.properties, ["Družstvo", "Druzstvo", "Team", "Kategorie"]);

  const title = extractPlainText(titleProp) || "Akce";
  const rawDate = extractDate(dateProp);
  const date = formatDateForCz(rawDate);
  const location = extractPlainText(locationProp) || "";
  const teamName = extractPlainText(teamProp) || "Nezařazeno";
  const teamSlug = toSlug(teamName);

  if (!date) return null;

  return {
    id: page.id,
    date,
    title,
    location,
    teamName,
    teamSlug,
  };
};

const notionToken = process.env.NOTION_TOKEN || FALLBACK_NOTION_TOKEN;
const notionDatabaseId = process.env.NOTION_DATABASE_ID || FALLBACK_NOTION_DATABASE_ID;

export async function loadEventsFromNotion(): Promise<NotionEvent[]> {
  const response = await fetch(`${NOTION_API_BASE}/databases/${notionDatabaseId}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${notionToken}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      page_size: 100,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Notion API error (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as { results?: NotionPage[] };
  const events = (data.results ?? [])
    .map(parseNotionEvent)
    .filter((item): item is NotionEvent => Boolean(item));

  return events.sort((a, b) => parseEventDate(a.date) - parseEventDate(b.date));
}
