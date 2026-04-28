import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

function localApiEventsProxy() {
  const notionApiBase = 'https://api.notion.com/v1'
  const notionVersion = '2022-06-28'
  const notionToken = process.env.NOTION_TOKEN || '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'
  const notionDatabaseId = process.env.NOTION_DATABASE_ID || '350c5ef377c78092a67cd5e8b3869bb8'

  const parseTitle = (properties: any) => {
    const title = properties?.['Název']?.title || properties?.['Nazev']?.title || properties?.['Name']?.title || properties?.['title']?.title
    return (title || []).map((item: any) => item?.plain_text || '').join('').trim() || 'Akce'
  }

  const parseRichText = (value: any) => {
    const richText = value?.rich_text || []
    return richText.map((item: any) => item?.plain_text || '').join('').trim()
  }

  const toSlug = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

  const loadEvents = async () => {
    let hasMore = true
    let nextCursor: string | null = null
    const pages: any[] = []

    while (hasMore) {
      const response = await fetch(`${notionApiBase}/databases/${notionDatabaseId}/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${notionToken}`,
          'Notion-Version': notionVersion,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_size: 100, ...(nextCursor ? { start_cursor: nextCursor } : {}) }),
      })

      if (!response.ok) {
        const detail = await response.text()
        throw new Error(`Notion API error (${response.status}): ${detail}`)
      }

      const data = await response.json()
      pages.push(...(data.results || []))
      hasMore = Boolean(data.has_more)
      nextCursor = data.next_cursor || null
    }

    return pages.map((page: any, index: number) => {
      const properties = page?.properties || {}
      const title = parseTitle(properties)
      const date = parseRichText(properties['Datum od'] || properties['Datum'] || properties['Date']) || '—'
      const location = parseRichText(properties['Místo'] || properties['Misto'] || properties['Location']) || ''
      const teamName = parseRichText(properties['Družstva'] || properties['Druzstva'] || properties['Team']) || 'Nezařazeno'

      return {
        id: page?.id || `notion-${index}`,
        date,
        title,
        location,
        teamName,
        teamSlug: toSlug(teamName),
      }
    })
  }

  const handleRequest = async (req: any, res: any, next: any) => {
    if (req.method !== 'GET') {
      next()
      return
    }

    try {
      const events = await loadEvents()
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify({ events, source: 'notion-dev-proxy' }))
    } catch (error) {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 500
      res.end(JSON.stringify({
        error: 'Akce se nepodařilo načíst z Notion v lokálním proxy režimu.',
        detail: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }

  return {
    name: 'local-api-events-proxy',
    configureServer(server) {
      server.middlewares.use('/api/events', handleRequest)
      server.middlewares.use('/api/notion', handleRequest)
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    localApiEventsProxy(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
