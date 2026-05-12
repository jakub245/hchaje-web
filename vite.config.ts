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
  const notionDatabaseId = process.env.NOTION_DATABASE_ID

  const normalizeKey = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')

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

  const resolveCanonicalTeamSlug = (teamName: string) => {
    const key = normalizeKey(teamName)

    if (key.includes('zen')) return 'zeny'
    if (key.includes('starsidorosten')) return 'starsi-dorostenky'
    if (key.includes('mladsidorosten')) return 'mladsi-dorostenky'
    if (key.includes('starsi') && key.includes('zak')) return 'starsi-zakyne'
    if (key.includes('mladsi') && key.includes('zak')) return 'mladsi-zakyne'
    if (key.includes('mini') && key.includes('zak')) return 'mini-zakyne'
    if (key.includes('priprav')) return 'pripravka'

    return toSlug(teamName)
  }

  const loadEvents = async () => {
    if (!notionToken || !notionDatabaseId) {
      throw new Error('Missing NOTION_TOKEN or NOTION_DATABASE_ID for /api/events local proxy')
    }

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
        const date = parseRichText(properties?.['Datum od'] || properties?.['Datum'] || properties?.['Date'] || properties?.['date'])
        const title = parseTitle(properties)
        const location = parseRichText(properties?.['Místo'] || properties?.['Misto'] || properties?.['Location'] || properties?.['location'])

        let teamName = 'Nezařazeno'
        let teamSlug = ''

        const teamRelation = properties?.['Družstva']?.relation || properties?.['Druzstva']?.relation || properties?.['Družstvo']?.relation || properties?.['Druzstvo']?.relation || properties?.['Team']?.relation || properties?.['team']?.relation || []
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
          teamSlug: resolveCanonicalTeamSlug(teamName),
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

function localApiNewsProxy() {
  const notionApiBase = 'https://api.notion.com/v1'
  const notionVersion = '2022-06-28'
  const notionToken = process.env.NOTION_TOKEN || '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'
  const notionNewsDatabaseId = process.env.NOTION_NEWS_DATABASE_ID || '344c5ef377c780c4b188d58520070c3c'

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

  const toSlug = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

  const parsePlainText = (property: any): string => {
    if (!property || typeof property !== 'object') return ''

    if (property.type === 'title') {
      const rich = property.title ?? []
      return rich.map((item: any) => item?.plain_text || '').join('').trim()
    }

    if (property.type === 'rich_text') {
      const rich = property.rich_text ?? []
      return rich.map((item: any) => item?.plain_text || '').join('').trim()
    }

    if (property.type === 'select') return property.select?.name || ''
    if (property.type === 'url') return property.url || ''
    if (property.type === 'multi_select') {
      return (property.multi_select ?? []).map((item: any) => item?.name || '').filter(Boolean).join(', ')
    }

    return ''
  }

  const parseBooleanLike = (property: any): boolean | null => {
    if (!property || typeof property !== 'object') return null
    if (property.type === 'checkbox') return Boolean(property.checkbox)
    if (property.type === 'select' && property.select?.name) {
      const value = String(property.select.name).trim().toLowerCase()
      if (['ano', 'yes', 'true', 'published', 'visible', '1'].includes(value)) return true
      if (['ne', 'no', 'false', 'draft', 'hidden', '0'].includes(value)) return false
    }
    const text = parsePlainText(property).trim().toLowerCase()
    if (['ano', 'yes', 'true', 'published', 'visible', '1'].includes(text)) return true
    if (['ne', 'no', 'false', 'draft', 'hidden', '0'].includes(text)) return false
    return null
  }

  const resolveVisibility = (properties: Record<string, any>): boolean => {
    const visibilityProp = findProperty(properties, [
      'Zobrazeno',
      'Zobrazit',
      'Publikovano',
      'Publikováno',
      'Published',
      'Publish',
      'Visible',
    ])

    const explicit = parseBooleanLike(visibilityProp)
    if (explicit !== null) return explicit
    return true
  }

  const parseDateTs = (value: string) => {
    const clean = String(value || '').replace(/\s/g, '')
    if (/^\d{4}-\d{2}-\d{2}/.test(clean)) return new Date(clean).getTime()
    const [day, month, year] = clean.split('.').filter(Boolean)
    if (!day || !month || !year) return Number.MIN_SAFE_INTEGER
    return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
  }

  const formatDateForCz = (value: string) => {
    if (!value) return ''
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const [year, month, day] = value.slice(0, 10).split('-')
      return `${day}. ${month}. ${year}`
    }
    return value
  }

  const parseDate = (property: any): string => {
    if (!property || typeof property !== 'object') return ''
    if (property.type === 'date') return property.date?.start || ''
    return parsePlainText(property)
  }

  const extractGoogleDriveFileId = (value: string): string => {
    const fromFilePath = value.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (fromFilePath?.[1]) return fromFilePath[1]

    const fromQuery = value.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    if (fromQuery?.[1]) return fromQuery[1]

    return ''
  }

  const normalizeDriveFileUrl = (value: string): string => {
    if (!value || !value.includes('drive.google.com')) return value
    const fileId = extractGoogleDriveFileId(value)
    if (!fileId) return value
    return `https://drive.google.com/uc?export=view&id=${fileId}`
  }

  const extractGoogleDriveFolderId = (value: string): string => {
    const fromFolderPath = value.match(/\/folders\/([a-zA-Z0-9_-]+)/)
    if (fromFolderPath?.[1]) return fromFolderPath[1]

    const fromOpenQuery = value.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    if (fromOpenQuery?.[1] && value.includes('drive/folders')) return fromOpenQuery[1]

    return ''
  }

  const isDriveFolderUrl = (value: string) => value.includes('drive.google.com') && (value.includes('/folders/') || value.includes('drive/folders'))

  const extractUrlsFromText = (value: string): string[] => {
    if (!value) return []
    const matches = value.match(/https?:\/\/[^\s,;]+/g) ?? []
    return matches.map((url) => url.trim())
  }

  const parseUrlsFromProperty = (property: any): string[] => {
    if (!property || typeof property !== 'object') return []

    if (property.type === 'files') {
      return (property.files ?? [])
        .map((item: any) => item?.external?.url || item?.file?.url || '')
        .filter(Boolean)
    }

    if (property.type === 'url') {
      return property.url ? [property.url] : []
    }

    const text = parsePlainText(property)
    if (!text) return []

    const directUrls = extractUrlsFromText(text)
    if (directUrls.length > 0) return directUrls

    return text
      .split(/[\n,;]+/)
      .map((value) => value.trim())
      .filter((value) => /^https?:\/\//i.test(value))
  }

  const isYouTubeUrl = (value: string) => /youtube\.com|youtu\.be/i.test(value)
  const isVimeoUrl = (value: string) => /vimeo\.com/i.test(value)
  const isImageUrl = (value: string) => /\.(jpg|jpeg|png|webp|gif|avif)(\?|#|$)/i.test(value) || /googleusercontent\.com|drive\.google\.com/i.test(value)
  const isVideoFileUrl = (value: string) => /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(value)

  const toEmbedVideoUrl = (value: string): string => {
    try {
      const parsed = new URL(value)
      const host = parsed.hostname.toLowerCase()

      if (host.includes('youtu.be')) {
        const id = parsed.pathname.replace('/', '').trim()
        return id ? `https://www.youtube.com/embed/${id}` : value
      }

      if (host.includes('youtube.com')) {
        if (parsed.pathname.includes('/shorts/')) {
          const id = parsed.pathname.split('/shorts/')[1]?.split('/')[0]
          return id ? `https://www.youtube.com/embed/${id}` : value
        }

        const id = parsed.searchParams.get('v')
        return id ? `https://www.youtube.com/embed/${id}` : value
      }

      if (host.includes('vimeo.com')) {
        const id = parsed.pathname.split('/').filter(Boolean).pop()
        return id ? `https://player.vimeo.com/video/${id}` : value
      }

      return value
    } catch {
      return value
    }
  }

  const expandGoogleDriveFolderUrls = async (folderUrls: string[]): Promise<{ images: string[]; videos: string[] }> => {
    const googleDriveApiKey = process.env.GOOGLE_DRIVE_API_KEY || ''
    if (!googleDriveApiKey || folderUrls.length === 0) return { images: [], videos: [] }

    const imageUrls: string[] = []
    const videoUrls: string[] = []

    for (const folderUrl of folderUrls) {
      const folderId = extractGoogleDriveFolderId(folderUrl)
      if (!folderId) continue

      const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`)
      const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,mimeType)&pageSize=200&key=${googleDriveApiKey}`

      try {
        const response = await fetch(url)
        if (!response.ok) continue

        const data = await response.json()
        const files = data?.files ?? []
        for (const file of files) {
          const fileId = String(file?.id || '')
          const mimeType = String(file?.mimeType || '')
          if (!fileId) continue

          if (mimeType.startsWith('image/')) {
            imageUrls.push(`https://drive.google.com/uc?export=view&id=${fileId}`)
            continue
          }

          if (mimeType.startsWith('video/')) {
            videoUrls.push(`https://drive.google.com/file/d/${fileId}/preview`)
          }
        }
      } catch {
      }
    }

    return { images: imageUrls, videos: videoUrls }
  }

  const buildMediaSections = async (urls: string[]) => {
    const uniqueUrls = Array.from(new Set(urls.map((value) => value.trim()).filter(Boolean)))
    const folderUrls = uniqueUrls.filter((value) => isDriveFolderUrl(value))
    const directUrls = uniqueUrls.filter((value) => !isDriveFolderUrl(value))
    const expanded = await expandGoogleDriveFolderUrls(folderUrls)

    const imageUrls: string[] = []
    const videoEntries: Array<{ embedUrl?: string; videoUrl?: string }> = []

    for (const rawUrl of directUrls) {
      if (isYouTubeUrl(rawUrl) || isVimeoUrl(rawUrl)) {
        videoEntries.push({ embedUrl: toEmbedVideoUrl(rawUrl) })
        continue
      }

      if (isVideoFileUrl(rawUrl)) {
        videoEntries.push({ videoUrl: rawUrl })
        continue
      }

      if (isImageUrl(rawUrl)) {
        imageUrls.push(normalizeDriveFileUrl(rawUrl))
      }
    }

    imageUrls.push(...expanded.images)
    videoEntries.push(...expanded.videos.map((embedUrl) => ({ embedUrl })))

    const uniqImages = Array.from(new Set(imageUrls))
    const sections: Array<
      | { type: 'gallery'; title: string; images: string[]; caption?: string }
      | { type: 'video'; title: string; embedUrl?: string; videoUrl?: string; caption?: string }
    > = []

    if (uniqImages.length > 0) {
      sections.push({
        type: 'gallery',
        title: uniqImages.length === 1 ? 'Fotografie' : 'Fotogalerie',
        images: uniqImages,
      })
    }

    videoEntries.forEach((video, index) => {
      sections.push({
        type: 'video',
        title: videoEntries.length > 1 ? `Video ${index + 1}` : 'Video',
        ...(video.embedUrl ? { embedUrl: video.embedUrl } : {}),
        ...(video.videoUrl ? { videoUrl: video.videoUrl } : {}),
      })
    })

    return {
      mediaSections: sections,
      firstImageUrl: uniqImages[0] || '',
    }
  }

  const parseRichTextArray = (value: any[] = []) =>
    value
      .map((item: any) => {
        const text = String(item?.plain_text || '')
        if (!text) return ''

        const href = String(item?.href || item?.text?.link?.url || '').trim()
        if (!href) return text

        return `[${text}](${href})`
      })
      .join('')
      .trim()

  const extractTextFromBlock = (block: any): string => {
    const type = block?.type
    if (!type) return ''

    const data = block?.[type]
    if (!data || typeof data !== 'object') return ''

    if (Array.isArray(data.rich_text)) {
      return parseRichTextArray(data.rich_text)
    }

    if (type === 'table_row' && Array.isArray(data.cells)) {
      return data.cells
        .map((cell: any[]) => parseRichTextArray(Array.isArray(cell) ? cell : []))
        .filter(Boolean)
        .join(' | ')
    }

    if (type === 'equation' && typeof data.expression === 'string') {
      return data.expression.trim()
    }

    return ''
  }

  const readBlockChildrenText = async (
    blockId: string,
    depth = 0,
  ): Promise<string[]> => {
    if (!blockId || depth > 2) return []

    const lines: string[] = []
    let hasMore = true
    let nextCursor: string | null = null

    while (hasMore) {
      const query = new URLSearchParams({ page_size: '100' })
      if (nextCursor) query.set('start_cursor', nextCursor)

      const response = await fetch(`${notionApiBase}/blocks/${blockId}/children?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${notionToken}`,
          'Notion-Version': notionVersion,
        },
      })

      if (!response.ok) break

      const data = await response.json()
      const blocks = data?.results ?? []

      for (const block of blocks) {
        const line = extractTextFromBlock(block)
        if (line) lines.push(line)

        if (block?.has_children && block?.id) {
          const childLines = await readBlockChildrenText(block.id, depth + 1)
          lines.push(...childLines)
        }
      }

      hasMore = Boolean(data?.has_more)
      nextCursor = data?.next_cursor ?? null
    }

    return lines
  }

  const loadNews = async () => {
    let hasMore = true
    let nextCursor: string | null = null
    const pages: any[] = []

    while (hasMore) {
      const response = await fetch(`${notionApiBase}/databases/${notionNewsDatabaseId}/query`, {
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

      if (!response.ok) throw new Error('Failed to query Notion news database')

      const data = await response.json()
      pages.push(...(data.results ?? []))
      hasMore = Boolean(data.has_more)
      nextCursor = data.next_cursor ?? null
    }

    const relatedTitleCache = new Map<string, string>()
    const pageContentCache = new Map<string, string>()

    const readPageContent = async (pageId: string) => {
      if (pageContentCache.has(pageId)) return pageContentCache.get(pageId) || ''

      const lines = await readBlockChildrenText(pageId)
      const text = lines.join('\n\n').trim()
      pageContentCache.set(pageId, text)
      return text
    }

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
      const title = parsePlainText(titleProperty as any)
      relatedTitleCache.set(pageId, title)
      return title
    }

    const news = await Promise.all(
      pages.map(async (page: any, index: number) => {
        const properties = page?.properties ?? {}
        if (!resolveVisibility(properties)) return null

        const title = parsePlainText(findProperty(properties, ['Název', 'Nazev', 'Name', 'Titulek', 'Title'])) || 'Aktualita'
        const explicitSlug = toSlug(parsePlainText(findProperty(properties, ['Slug', 'URL', 'Permalink', 'Link'])))
        const stableSlug = explicitSlug || `${toSlug(title)}-${String(page?.id || index).slice(-6).toLowerCase()}`
        const date = formatDateForCz(parseDate(findProperty(properties, ['Datum', 'Date', 'Kdy', 'Datum publikace'])))
        const excerpt = parsePlainText(findProperty(properties, ['Perex', 'Excerpt', 'Popis', 'Summary', 'Anotace']))
        const propertyContent = parsePlainText(findProperty(properties, ['Text', 'Obsah', 'Content', 'Článek', 'Clanek', 'Detail']))
        const blockContent = await readPageContent(page?.id || '')
        const content = propertyContent || blockContent || excerpt
        const photoUrlProp = findProperty(properties, ['Foto URL', 'Foto', 'Photo URL', 'Image URL', 'Obrázek URL', 'Obrazek URL'])
        const mediaProp = findProperty(properties, ['Média', 'Media', 'Media URL', 'Media URLs', 'Galerie', 'Gallery', 'Soubory', 'Files'])
        const videoProp = findProperty(properties, ['Video', 'Video URL', 'Videa', 'Videos', 'YouTube'])
        const folderProp = findProperty(properties, ['Složka', 'Slozka', 'Folder', 'Folder URL', 'Drive folder', 'Google Drive folder'])

        const mediaUrls = [
          ...parseUrlsFromProperty(photoUrlProp),
          ...parseUrlsFromProperty(mediaProp),
          ...parseUrlsFromProperty(videoProp),
          ...parseUrlsFromProperty(folderProp),
          ...extractUrlsFromText(content),
        ]
        const mediaData = await buildMediaSections(mediaUrls)
        const photoUrl = mediaData.firstImageUrl || normalizeDriveFileUrl(parsePlainText(photoUrlProp))

        const teamProp = findProperty(properties, ['Družstvo', 'Druzstvo', 'Družstva', 'Druzstva', 'Team', 'Kategorie', 'Tým', 'Tym'])
        let teamNames: string[] = []

        if (teamProp?.type === 'relation') {
          const relationIds = (teamProp.relation ?? []).map((relation: any) => relation?.id).filter(Boolean)
          const resolvedNames = await Promise.all(relationIds.map((relationId: string) => readRelatedTitle(relationId)))
          teamNames = resolvedNames.map((value) => value.trim()).filter(Boolean)
        }

        if (teamNames.length === 0) {
          const plain = parsePlainText(teamProp)
          teamNames = plain.split(',').map((value) => value.trim()).filter(Boolean)
        }

        if (teamNames.length === 0) teamNames = ['Klub']
        const teamSlugs = teamNames.map((value) => toSlug(value))

        return {
          id: page?.id || `notion-news-${index}`,
          slug: stableSlug,
          date,
          title,
          excerpt,
          content,
          photoUrl,
          teamName: teamNames.join(', '),
          teamSlug: teamSlugs[0] || 'klub',
          teamNames,
          teamSlugs,
          mediaSections: mediaData.mediaSections,
        }
      }),
    )

    return news
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => parseDateTs(b.date) - parseDateTs(a.date))
  }

  const handleRequest = async (req: any, res: any, next: any) => {
    if (req.method !== 'GET') {
      next()
      return
    }

    try {
      const news = await loadNews()
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify({ news, source: 'notion-dev-proxy' }))
    } catch (error) {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 500
      res.end(JSON.stringify({
        error: 'Aktuality se nepodařilo načíst z Notion v lokálním proxy režimu.',
        detail: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }

  return {
    name: 'local-api-news-proxy',
    configureServer(server) {
      server.middlewares.use('/api/news', handleRequest)
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

  const parseNumberLike = (property: any): number | null => {
    if (!property || typeof property !== 'object') return null

    if (property.type === 'number' && typeof property.number === 'number') return property.number
    if (property.type === 'formula' && property.formula?.type === 'number' && typeof property.formula.number === 'number') {
      return property.formula.number
    }

    const text = parseRichText(property).trim()
    const value = Number(text.replace(',', '.'))
    return Number.isFinite(value) ? value : null
  }

  const parseTextLike = (property: any): string => {
    if (!property || typeof property !== 'object') return ''
    if (property.type === 'select') return String(property.select?.name || '').trim()
    if (property.type === 'status') return String(property.status?.name || '').trim()
    return parseRichText(property).trim()
  }

  const rankByPosition = (position: string): number => {
    const normalized = normalizeKey(position || '')
    if (normalized.includes('trener') || normalized.includes('trainer') || normalized === 'coach') return 0
    if (normalized.includes('hlavni')) return 0
    if (normalized.includes('asistent') || normalized.includes('assistant')) return 1
    return 2
  }

  const parseSortPriority = (properties: Record<string, any>, position: string): number => {
    const priorityProp = findProperty(properties, [
      'Důležitost',
      'Dulezitost',
      'Priorita',
      'Priority',
      'Pořadí',
      'Poradi',
      'Order',
    ])

    const numberValue = parseNumberLike(priorityProp)
    if (numberValue !== null) return numberValue

    const textValue = parseTextLike(priorityProp)
    if (textValue) return rankByPosition(textValue)

    return rankByPosition(position)
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
        const sortPriority = parseSortPriority(properties, position)
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
          sortPriority,
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

  const parseProperty = (property: any): string => {
    if (!property || typeof property !== 'object') return ''
    
    // Handle select
    if (property.type === 'select' && property.select) {
      return property.select.name || ''
    }
    
    // Handle multi_select
    if (property.type === 'multi_select' && property.multi_select) {
      return (property.multi_select as any[]).map((item: any) => item.name).join(', ')
    }
    
    // Handle number
    if (property.type === 'number' && property.number !== null && property.number !== undefined) {
      return String(property.number)
    }
    
    // Handle rich_text / title
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
        const year = parseProperty(findProperty(properties, ['Ročník', 'Rocnik', 'Year', 'Věk', 'Vek'])) || ''
        const position = parseProperty(findProperty(properties, ['Pozice', 'Post', 'Role', 'Position'])) || ''
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
          year,
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

function localApiTrainingsProxy() {
  const notionApiBase = 'https://api.notion.com/v1'
  const notionVersion = '2022-06-28'
  const notionToken = process.env.NOTION_TOKEN || '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'
  const notionTrainingsDatabaseId = process.env.NOTION_TRAININGS_DATABASE_ID || '350c5ef377c780f697d7eae5d0688831'

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
    if (property.type === 'title') {
      const rich = property.title ?? []
      return rich.map((item: any) => item?.plain_text || '').join('').trim()
    }
    const rich = property.rich_text ?? []
    return rich.map((item: any) => item?.plain_text || '').join('').trim()
  }

  const parseProperty = (property: any): string => {
    if (!property || typeof property !== 'object') return ''

    if (property.type === 'select' && property.select) {
      return property.select.name || ''
    }

    if (property.type === 'multi_select' && property.multi_select) {
      return (property.multi_select as any[]).map((item: any) => item?.name || '').filter(Boolean).join(', ')
    }

    if (property.type === 'number' && property.number !== null && property.number !== undefined) {
      return String(property.number)
    }

    if (property.type === 'date' && property.date?.start) {
      return property.date.start
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

  const parseTimeWindow = (properties: Record<string, any>) => {
    const directTime = parseProperty(findProperty(properties, ['Čas', 'Cas', 'Time', 'Kdy', 'Trénink'])) || ''
    if (directTime) return directTime

    const from = parseProperty(findProperty(properties, ['Čas od', 'Cas od', 'Od', 'Začátek', 'Zacatek', 'Start'])) || ''
    const to = parseProperty(findProperty(properties, ['Čas do', 'Cas do', 'Do', 'Konec', 'End'])) || ''
    if (from && to) return `${from} - ${to}`
    return from || to || ''
  }

  const loadTrainings = async () => {
    const pages: any[] = []
    let hasMore = true
    let nextCursor: string | null = null

    while (hasMore) {
      const response = await fetch(`${notionApiBase}/databases/${notionTrainingsDatabaseId}/query`, {
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

    const trainings = await Promise.all(
      pages.map(async (page: any, index: number) => {
        const properties = page?.properties ?? {}
        const day = parseProperty(findProperty(properties, ['Den', 'Day'])) || ''
        const time = parseTimeWindow(properties) || ''
        const hall = parseProperty(findProperty(properties, ['Místo', 'Misto', 'Hala', 'Hall', 'Location'])) || ''
        const section = parseProperty(findProperty(properties, [
          'Sezona',
          'Sezóna',
          'Sekce',
          'Období',
          'Obdobi',
          'Období tréninků',
          'Obdobi treninku',
          'Rozvrh',
          'Skupina',
          'Blok',
          'Title',
          'Název',
          'Nazev',
        ])) || ''

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
          const plain = parseProperty(teamProperty)
          if (plain) {
            teamName = plain
            teamSlug = toSlug(teamName)
          }
        }

        return {
          id: page?.id || `notion-training-${index}`,
          day,
          time,
          hall,
          section,
          teamName,
          teamSlug,
        }
      }),
    )

    return trainings.filter((item) => item.day || item.time || item.hall)
  }

  const handleRequest = async (req: any, res: any, next: any) => {
    if (req.method !== 'GET') {
      next()
      return
    }

    try {
      const trainings = await loadTrainings()
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify({ trainings, source: 'notion-dev-proxy' }))
    } catch (error) {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 500
      res.end(JSON.stringify({
        error: 'Tréninky se nepodařilo načíst z Notion v lokálním proxy režimu.',
        detail: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }

  return {
    name: 'local-api-trainings-proxy',
    configureServer(server) {
      server.middlewares.use('/api/trainings', handleRequest)
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    localApiEventsProxy(),
    localApiNewsProxy(),
    localApiCoachesProxy(),
    localApiPlayersProxy(),
    localApiTrainingsProxy(),
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
