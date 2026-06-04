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
  const notionToken = process.env.NOTION_TOKEN
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

function localApiCoachesProxy() {
  const notionApiBase = 'https://api.notion.com/v1'
  const notionVersion = '2022-06-28'
  const notionToken = process.env.NOTION_TOKEN || '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'
  const notionCoachesDatabaseId = process.env.NOTION_COACHES_DATABASE_ID || '350c5ef377c780dc942cf8b85ee0366e'

  const parseTitle = (property: any) => {
    if (!property) return ''
    const title = property.title ?? []
    return title.map((item: any) => item?.plain_text || '').join('').trim()
  }

  const parseRichText = (property: any) => {
    if (!property) return ''
    const richText = property.rich_text ?? []
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

  const loadCoaches = async () => {
    let hasMore = true
    let nextCursor: string | null = null
    const pages: any[] = []

    while (hasMore) {
      const response = await fetch(`${notionApiBase}/databases/${notionCoachesDatabaseId}/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${notionToken}`,
          'Notion-Version': notionVersion,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_size: 100,
          ...(nextCursor ? { start_cursor: nextCursor } : {}),
        }),
      })

      if (!response.ok) {
        const detail = await response.text()
        throw new Error(`Notion API error (${response.status}): ${detail}`)
      }

      const data = await response.json()
      pages.push(...(data.results ?? []))
      hasMore = Boolean(data.has_more)
      nextCursor = data.next_cursor ?? null
    }

    const relatedTitleCache = new Map<string, string>()
    const readRelatedTitle = async (pageId: string) => {
      if (relatedTitleCache.has(pageId)) return relatedTitleCache.get(pageId) || ''
      const response = await fetch(`${notionApiBase}/pages/${pageId}`, {
        headers: {
          Authorization: `Bearer ${notionToken}`,
          'Notion-Version': notionVersion,
        },
      })
      if (!response.ok) {
        relatedTitleCache.set(pageId, '')
        return ''
      }
      const data = await response.json()
      const properties = data?.properties ?? {}
      const titleProperty = Object.values(properties).find((property: any) => property?.type === 'title')
      const title = parseRichText(titleProperty)
      relatedTitleCache.set(pageId, title)
      return title
    }

    return Promise.all(
      pages.map(async (page: any, index: number) => {
        const properties = page?.properties ?? {}
        const name = parseTitle(Object.values(properties).find((property: any) => property?.type === 'title'))
        const position = parseRichText(Object.values(properties).find((property: any) => property?.type === 'rich_text' && property?.key !== 'email'))
        const phone = parseRichText(Object.values(properties).find((property: any) => property?.key === 'Telefon' || property?.key === 'Phone'))
        const email = parseRichText(Object.values(properties).find((property: any) => property?.key === 'E-mail' || property?.key === 'Email'))

        let teamName = 'Nezařazeno'
        let teamSlug = ''

        const teamProperties = Object.values(properties)
        const teamProperty = teamProperties.find((property: any) => property?.type === 'relation')

        if (teamProperty?.relation && Array.isArray(teamProperty.relation)) {
          const relationIds = teamProperty.relation.map((relation: any) => relation?.id).filter(Boolean)
          if (relationIds.length > 0) {
            const resolvedNames = await Promise.all(relationIds.map((relationId: string) => readRelatedTitle(relationId)))
            const resolved = resolvedNames.filter(Boolean)
            if (resolved.length > 0) {
              teamName = resolved[0]
              teamSlug = toSlug(teamName)
            }
          }
        }

        return {
          id: page?.id || `notion-coach-${index}`,
          name,
          position,
          teamName,
          teamSlug,
          phone,
          email,
        }
      }),
    )
  }

  const handleRequest = async (req: any, res: any, next: any) => {
    if (req.method !== 'GET') {
      next()
      return
    }

    try {
      const coaches = await loadCoaches()
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify({ coaches, source: 'notion-dev-proxy' }))
    } catch (error) {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 500
      res.end(JSON.stringify({
        error: 'Trenéry se nepodařilo načíst z Notion v lokálním proxy režimu.',
        detail: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }

  return {
    name: 'local-api-coaches-proxy',
    configureServer(server) {
      server.middlewares.use('/api/coaches', handleRequest)
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    localApiEventsProxy(),
    localApiCoachesProxy(),
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
