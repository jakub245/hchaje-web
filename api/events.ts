import { loadEventsFromNotion } from "./notion";

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
