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
        body: JSON.stringify({
          page_size: 100,
          ...(nextCursor ? { start_cursor: nextCursor } : {}),
        }),
      })

      if (!response.ok) throw new Error('Failed to query Notion events database')

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
      const title = parseRichText(titleProperty as any)
      relatedTitleCache.set(pageId, title)
      return title
    }

    return Promise.all(
      pages.map(async (page: any) => {
        const properties = page?.properties ?? {}
        const date = parseRichText(properties?.['Datum'] || properties?.['Date'] || properties?.['date'])
        const title = parseTitle(properties)
        const location = parseRichText(properties?.['Místo'] || properties?.['Misto'] || properties?.['Location'] || properties?.['location'])

        let teamName = 'Nezařazeno'
        let teamSlug = ''

        const teamRelation = properties?.['Družstvo']?.relation || properties?.['Druzstvo']?.relation || properties?.['Team']?.relation || properties?.['team']?.relation || []
        if (Array.isArray(teamRelation) && teamRelation.length > 0) {
          const resolvedNames = await Promise.all(teamRelation.map((relation: any) => readRelatedTitle(relation?.id)))
          const resolved = resolvedNames.filter(Boolean)
          if (resolved.length > 0) {
            teamName = resolved[0]
            teamSlug = toSlug(teamName)
          }
        }

        return {
          id: page?.id || '',
          date,
          title,
          location,
          teamName,
          teamSlug: toSlug(teamName),
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

  const normalizeKey = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')

  const findProperty = (properties: Record<string, any>, names: string[]) => {
    const map = new Map(Object.entries(properties).map(([key, value]) => [normalizeKey(key), value] as const))
    for (const name of names) {
      const hit = map.get(normalizeKey(name))
      if (hit) return hit
    }
    return undefined
  }

  const parseRichText = (property: any): string => {
    if (!property || typeof property !== 'object') return ''
    const richText = property.rich_text ?? []
    return richText.map((item: any) => item?.plain_text || '').join('').trim()
  }

  const parseTitle = (property: any): string => {
    if (!property || typeof property !== 'object') return ''
    const title = property.title ?? []
    const value = title.map((item: any) => item?.plain_text || '').join('').trim()
    return value || ''
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
    const pages: any[] = []
    let hasMore = true
    let nextCursor: string | null = null

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

      if (!response.ok) throw new Error(`Notion API error (${response.status})`)

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
      const title = parseRichText(titleProperty as any)
      relatedTitleCache.set(pageId, title)
      return title
    }

    return Promise.all(
      pages.map(async (page: any, index: number) => {
        const properties = page?.properties ?? {}
        const name = parseTitle(findProperty(properties, ['Jméno', 'Jmeno', 'Name']) || properties.title)
        const position = parseRichText(findProperty(properties, ['Pozice', 'Role', 'Position'])) || ''
        const phone = parseRichText(findProperty(properties, ['Telefon', 'Phone'])) || ''
        const email = parseRichText(findProperty(properties, ['E-mail', 'Email', 'Mail'])) || ''

        let teamName = 'Nezařazeno'
        let teamSlug = ''

        const teamProperty = findProperty(properties, ['Družstvo', 'Druzstvo', 'Team', 'Tým', 'Tym'])

        if (teamProperty?.type === 'relation') {
          const relationIds = (teamProperty.relation ?? []).map((relation: any) => relation?.id).filter(Boolean)
          if (relationIds.length > 0) {
            const resolvedNames = await Promise.all(relationIds.map((relationId: string) => readRelatedTitle(relationId)))
            const resolved = resolvedNames.filter(Boolean)
            if (resolved.length > 0) {
              teamName = resolved[0]
              teamSlug = toSlug(teamName)
            }
          }
        }

        if (teamName === 'Nezařazeno') {
          const plain = parseRichText(teamProperty)
          if (plain) {
            teamName = plain
            teamSlug = toSlug(teamName)
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

function localApiPlayersProxy() {
  const notionApiBase = 'https://api.notion.com/v1'
  const notionVersion = '2022-06-28'
  const notionToken = process.env.NOTION_TOKEN || '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'
  const notionPlayersDatabaseId = process.env.NOTION_PLAYERS_DATABASE_ID || '350c5ef377c780e7a67be50f9152fe33'

  const normalizeKey = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')

  const findProperty = (properties: Record<string, any>, names: string[]) => {
    const map = new Map(Object.entries(properties).map(([key, value]) => [normalizeKey(key), value] as const))
    for (const name of names) {
      const hit = map.get(normalizeKey(name))
      if (hit) return hit
    }
    return undefined
  }

  const parseRichText = (property: any): string => {
    if (!property || typeof property !== 'object') return ''
    const richText = property.rich_text ?? []
    return richText.map((item: any) => item?.plain_text || '').join('').trim()
  }

  const parseTitle = (property: any): string => {
    if (!property || typeof property !== 'object') return ''
    const title = property.title ?? []
    return title.map((item: any) => item?.plain_text || '').join('').trim()
  }

  const parseNumber = (property: any): string => {
    if (!property || typeof property !== 'object') return ''
    if (property.type === 'number' && property.number !== null && property.number !== undefined) {
      return String(property.number)
    }
    return parseRichText(property)
  }

  const toSlug = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

  const loadPlayers = async () => {
    const pages: any[] = []
    let hasMore = true
    let nextCursor: string | null = null

    while (hasMore) {
      const response = await fetch(`${notionApiBase}/databases/${notionPlayersDatabaseId}/query`, {
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

      if (!response.ok) throw new Error(`Notion API error (${response.status})`)

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
      const title = parseRichText(titleProperty as any)
      relatedTitleCache.set(pageId, title)
      return title
    }

    const players = await Promise.all(
      pages.map(async (page: any, index: number) => {
        const properties = page?.properties ?? {}
        const name = parseTitle(findProperty(properties, ['Jméno', 'Jmeno', 'Name']) || properties.title)
        const position = parseRichText(findProperty(properties, ['Pozice', 'Post', 'Role', 'Ročník', 'Rocnik', 'Position'])) || ''
        const number = parseNumber(findProperty(properties, ['Číslo', 'Cislo', 'Číslo hráčky', 'Cislo hracky', 'Number', 'Registrační číslo', 'Registracni cislo'])) || ''

        let teamName = 'Nezařazeno'
        let teamSlug = ''

        const teamProperty = findProperty(properties, ['Družstvo', 'Druzstvo', 'Team', 'Tým', 'Tym'])

        if (teamProperty?.type === 'relation') {
          const relationIds = (teamProperty.relation ?? []).map((relation: any) => relation?.id).filter(Boolean)
          if (relationIds.length > 0) {
            const resolvedNames = await Promise.all(relationIds.map((relationId: string) => readRelatedTitle(relationId)))
            const resolved = resolvedNames.filter(Boolean)
            if (resolved.length > 0) {
              teamName = resolved[0]
              teamSlug = toSlug(teamName)
            }
          }
        }

        if (teamName === 'Nezařazeno') {
          const plain = parseRichText(teamProperty)
          if (plain) {
            teamName = plain
            teamSlug = toSlug(teamName)
          }
        }

        return {
          id: page?.id || `notion-player-${index}`,
          name,
          position,
          number,
          teamName,
          teamSlug,
        }
      }),
    )

    return players.filter((player) => player.name)
  }

  const handleRequest = async (req: any, res: any, next: any) => {
    if (req.method !== 'GET') {
      next()
      return
    }

    try {
      const players = await loadPlayers()
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify({ players, source: 'notion-dev-proxy' }))
    } catch (error) {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 500
      res.end(JSON.stringify({
        error: 'Hráčky se nepodařilo načíst z Notion v lokálním proxy režimu.',
        detail: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }

  return {
    name: 'local-api-players-proxy',
    configureServer(server) {
      server.middlewares.use('/api/players', handleRequest)
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    localApiEventsProxy(),
    localApiCoachesProxy(),
    localApiPlayersProxy(),
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
