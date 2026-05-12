const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

declare const process: any;

const FALLBACK_NOTION_TOKEN = "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";
const NEWS_CACHE_TTL_MS = 1000 * 60 * 3;

type NewsItem = {
  id: string;
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  photoUrl: string;
  teamName: string;
  teamSlug: string;
  teamNames: string[];
  teamSlugs: string[];
  mediaSections: Array<
    | { type: "gallery"; title: string; images: string[]; caption?: string }
    | { type: "video"; title: string; embedUrl?: string; videoUrl?: string; caption?: string }
  >;
};

type CachedNews = {
  news: NewsItem[];
  fetchedAt: number;
};

let cachedNews: CachedNews | null = null;

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

const parseDateTs = (value: string) => {
  const clean = String(value || "").replace(/\s/g, "");
  if (!clean) return Number.MIN_SAFE_INTEGER;

  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) return new Date(clean).getTime();

  const [day, month, year] = clean.split(".").filter(Boolean);
  if (!day || !month || !year) return Number.MIN_SAFE_INTEGER;
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
};

const extractGoogleDriveFileId = (value: string): string => {
  const fromFilePath = value.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fromFilePath?.[1]) return fromFilePath[1];

  const fromQuery = value.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (fromQuery?.[1]) return fromQuery[1];

  return "";
};

const extractGoogleDriveFolderId = (value: string): string => {
  const fromFolderPath = value.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (fromFolderPath?.[1]) return fromFolderPath[1];

  const fromOpenQuery = value.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (fromOpenQuery?.[1] && value.includes("drive/folders")) return fromOpenQuery[1];

  return "";
};

const normalizeDriveFileUrl = (value: string): string => {
  if (!value || !value.includes("drive.google.com")) return value;
  const fileId = extractGoogleDriveFileId(value);
  if (!fileId) return value;
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
};

const isDriveFolderUrl = (value: string) => value.includes("drive.google.com") && (value.includes("/folders/") || value.includes("drive/folders"));

const extractUrlsFromText = (value: string): string[] => {
  if (!value) return [];
  const matches = value.match(/https?:\/\/[^\s,;]+/g) ?? [];
  return matches.map((url) => url.trim());
};

const isYouTubeUrl = (value: string) => /youtube\.com|youtu\.be/i.test(value);
const isVimeoUrl = (value: string) => /vimeo\.com/i.test(value);
const isImageUrl = (value: string) => /\.(jpg|jpeg|png|webp|gif|avif)(\?|#|$)/i.test(value) || /googleusercontent\.com|drive\.google\.com/i.test(value);
const isVideoFileUrl = (value: string) => /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(value);

const toEmbedVideoUrl = (value: string): string => {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : value;
    }

    if (host.includes("youtube.com")) {
      if (parsed.pathname.includes("/shorts/")) {
        const id = parsed.pathname.split("/shorts/")[1]?.split("/")[0];
        return id ? `https://www.youtube.com/embed/${id}` : value;
      }

      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : value;
    }

    if (host.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : value;
    }

    return value;
  } catch {
    return value;
  }
};

const findProperty = (properties: Record<string, any>, names: string[]) => {
  const map = new Map(Object.entries(properties).map(([key, value]) => [normalizeKey(key), value] as const));
  for (const name of names) {
    const hit = map.get(normalizeKey(name));
    if (hit) return hit;
  }
  return undefined;
};

const parsePlainText = (property: any): string => {
  if (!property || typeof property !== "object") return "";

  if (property.type === "title") {
    const rich = property.title ?? [];
    return rich.map((item: any) => item?.plain_text || "").join("").trim();
  }

  if (property.type === "rich_text") {
    const rich = property.rich_text ?? [];
    return rich.map((item: any) => item?.plain_text || "").join("").trim();
  }

  if (property.type === "select") {
    return property.select?.name?.trim?.() || "";
  }

  if (property.type === "multi_select") {
    return (property.multi_select ?? []).map((item: any) => item?.name || "").filter(Boolean).join(", ").trim();
  }

  if (property.type === "url") {
    return property.url || "";
  }

  if (property.type === "formula" && property.formula) {
    if (property.formula.type === "string") return String(property.formula.string || "").trim();
    if (property.formula.type === "number") return String(property.formula.number ?? "").trim();
    if (property.formula.type === "boolean") return property.formula.boolean ? "true" : "false";
  }

  return "";
};

const parseUrlsFromProperty = (property: any): string[] => {
  if (!property || typeof property !== "object") return [];

  if (property.type === "files") {
    return (property.files ?? [])
      .map((item: any) => item?.external?.url || item?.file?.url || "")
      .filter(Boolean);
  }

  if (property.type === "url") {
    return property.url ? [property.url] : [];
  }

  const rawText = parsePlainText(property);
  if (!rawText) return [];

  const directUrls = extractUrlsFromText(rawText);
  if (directUrls.length > 0) return directUrls;

  return rawText
    .split(/[\n,;]+/)
    .map((value) => value.trim())
    .filter((value) => /^https?:\/\//i.test(value));
};

const parseDate = (property: any): string => {
  if (!property || typeof property !== "object") return "";
  if (property.type === "date") return property.date?.start || "";
  if (property.type === "formula" && property.formula?.type === "date") return property.formula.date?.start || "";
  return parsePlainText(property);
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

  const text = parsePlainText(property).trim().toLowerCase();
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

const expandGoogleDriveFolderUrls = async (folderUrls: string[]): Promise<{ images: string[]; videos: string[] }> => {
  const googleDriveApiKey = process.env.GOOGLE_DRIVE_API_KEY || "";
  if (!googleDriveApiKey || folderUrls.length === 0) return { images: [], videos: [] };

  const imageUrls: string[] = [];
  const videoUrls: string[] = [];

  for (const folderUrl of folderUrls) {
    const folderId = extractGoogleDriveFolderId(folderUrl);
    if (!folderId) continue;

    const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,mimeType)&pageSize=200&key=${googleDriveApiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) continue;

      const data = await response.json();
      const files = data?.files ?? [];
      for (const file of files) {
        const fileId = String(file?.id || "");
        const mimeType = String(file?.mimeType || "");
        if (!fileId) continue;

        if (mimeType.startsWith("image/")) {
          imageUrls.push(`https://drive.google.com/uc?export=view&id=${fileId}`);
          continue;
        }

        if (mimeType.startsWith("video/")) {
          videoUrls.push(`https://drive.google.com/file/d/${fileId}/preview`);
        }
      }
    } catch {
    }
  }

  return { images: imageUrls, videos: videoUrls };
};

const buildMediaSections = async (urls: string[]) => {
  const uniqueUrls = Array.from(new Set(urls.map((value) => value.trim()).filter(Boolean)));
  const folderUrls = uniqueUrls.filter((value) => isDriveFolderUrl(value));
  const directUrls = uniqueUrls.filter((value) => !isDriveFolderUrl(value));

  const expanded = await expandGoogleDriveFolderUrls(folderUrls);

  const imageUrls: string[] = [];
  const videoEntries: Array<{ embedUrl?: string; videoUrl?: string }> = [];

  for (const rawUrl of directUrls) {
    const normalizedUrl = normalizeDriveFileUrl(rawUrl);

    if (isYouTubeUrl(rawUrl) || isVimeoUrl(rawUrl)) {
      videoEntries.push({ embedUrl: toEmbedVideoUrl(rawUrl) });
      continue;
    }

    if (isVideoFileUrl(rawUrl)) {
      videoEntries.push({ videoUrl: rawUrl });
      continue;
    }

    if (isImageUrl(rawUrl)) {
      imageUrls.push(normalizedUrl);
      continue;
    }
  }

  imageUrls.push(...expanded.images);
  videoEntries.push(...expanded.videos.map((embedUrl) => ({ embedUrl })));

  const sections: NewsItem["mediaSections"] = [];

  const uniqImages = Array.from(new Set(imageUrls));
  if (uniqImages.length > 0) {
    sections.push({
      type: "gallery",
      title: uniqImages.length === 1 ? "Fotografie" : "Fotogalerie",
      images: uniqImages,
    });
  }

  videoEntries.forEach((video, index) => {
    sections.push({
      type: "video",
      title: videoEntries.length > 1 ? `Video ${index + 1}` : "Video",
      ...(video.embedUrl ? { embedUrl: video.embedUrl } : {}),
      ...(video.videoUrl ? { videoUrl: video.videoUrl } : {}),
    });
  });

  return {
    mediaSections: sections,
    firstImageUrl: uniqImages[0] || "",
  };
};

const loadNewsFromNotion = async () => {
  const notionToken = process.env.NOTION_TOKEN || FALLBACK_NOTION_TOKEN;
  const notionDatabaseId = process.env.NOTION_NEWS_DATABASE_ID || "";

  if (!notionDatabaseId) {
    throw new Error("Missing NOTION_NEWS_DATABASE_ID. News endpoint will not fallback to NOTION_DATABASE_ID to avoid mixing data with Events.");
  }

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
    const title = parsePlainText(titleProperty);
    relatedTitleCache.set(pageId, title);
    return title;
  };

  const items = await Promise.all(
    pages.map(async (page: any, index: number) => {
      const properties = page?.properties ?? {};
      if (!resolveVisibility(properties)) return null;

      const titleProp = findProperty(properties, ["Název", "Nazev", "Name", "Titulek", "Aktualita", "Title"]);
      const slugProp = findProperty(properties, ["Slug", "URL", "Permalink", "Link"]);
      const dateProp = findProperty(properties, ["Datum", "Date", "Kdy", "Publikováno", "Publish date", "Datum publikace"]);
      const teamProp = findProperty(properties, ["Družstvo", "Druzstvo", "Družstva", "Druzstva", "Team", "Kategorie", "Tým", "Tym"]);
      const excerptProp = findProperty(properties, ["Perex", "Excerpt", "Popis", "Summary", "Anotace"]);
      const contentProp = findProperty(properties, ["Text", "Obsah", "Content", "Článek", "Clanek", "Detail"]);
      const photoUrlProp = findProperty(properties, ["Foto URL", "Foto", "Photo URL", "Image URL", "Obrázek URL", "Obrazek URL"]);
      const mediaProp = findProperty(properties, ["Média", "Media", "Media URL", "Media URLs", "Galerie", "Gallery", "Soubory", "Files"]);
      const videoProp = findProperty(properties, ["Video", "Video URL", "Videa", "Videos", "YouTube"]);
      const folderProp = findProperty(properties, ["Složka", "Slozka", "Folder", "Folder URL", "Drive folder", "Google Drive folder"]);

      const relationIds = teamProp?.type === "relation"
        ? (teamProp.relation ?? []).map((relation: any) => relation?.id).filter(Boolean)
        : [];

      let teamNames: string[] = [];
      if (relationIds.length > 0) {
        const resolvedNames = await Promise.all(relationIds.map((relationId: string) => readRelatedTitle(relationId)));
        teamNames = resolvedNames.map((value) => value.trim()).filter(Boolean);
      }

      if (teamNames.length === 0) {
        const plainTeam = parsePlainText(teamProp);
        teamNames = plainTeam
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);
      }

      if (teamNames.length === 0) {
        teamNames = ["Klub"];
      }

      const teamSlugs = teamNames.map((value) => toSlug(value));
      const date = formatDateForCz(parseDate(dateProp));
      const title = parsePlainText(titleProp) || "Aktualita";
      const explicitSlug = toSlug(parsePlainText(slugProp));
      const stableSlug = explicitSlug || `${toSlug(title)}-${String(page?.id || index).slice(-6).toLowerCase()}`;
      const excerpt = parsePlainText(excerptProp);
      const content = parsePlainText(contentProp) || excerpt;
      const mediaUrls = [
        ...parseUrlsFromProperty(photoUrlProp),
        ...parseUrlsFromProperty(mediaProp),
        ...parseUrlsFromProperty(videoProp),
        ...parseUrlsFromProperty(folderProp),
        ...extractUrlsFromText(content),
      ];
      const mediaData = await buildMediaSections(mediaUrls);
      const photoUrl = mediaData.firstImageUrl || normalizeDriveFileUrl(parsePlainText(photoUrlProp));

      return {
        id: page?.id || `notion-news-${index}`,
        slug: stableSlug,
        date,
        title,
        excerpt,
        content,
        photoUrl,
        teamName: teamNames.join(", "),
        teamSlug: teamSlugs[0] || "klub",
        teamNames,
        teamSlugs,
        mediaSections: mediaData.mediaSections,
      } satisfies NewsItem;
    }),
  );

  return items
    .filter((item): item is NewsItem => item !== null)
    .sort((a, b) => parseDateTs(b.date) - parseDateTs(a.date));
};

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const freshMode = req?.query?.fresh === "1";
    const now = Date.now();
    const canUseCache = !freshMode && cachedNews && now - cachedNews.fetchedAt < NEWS_CACHE_TTL_MS;
    const news = canUseCache && cachedNews ? cachedNews.news : await loadNewsFromNotion();

    if (!canUseCache) {
      cachedNews = {
        news,
        fetchedAt: now,
      };
    }

    res.setHeader("Cache-Control", "s-maxage=180, stale-while-revalidate=600");
    return res.status(200).json({ news, source: canUseCache ? "cache" : "notion" });
  } catch (error: any) {
    console.error("News API error:", error);

    if (cachedNews) {
      res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=600");
      return res.status(200).json({ news: cachedNews.news, source: "cache" });
    }

    return res.status(500).json({
      error: "Aktuality se nepodařilo načíst z Notion.",
      detail: error?.message || "Unknown error",
    });
  }
}
