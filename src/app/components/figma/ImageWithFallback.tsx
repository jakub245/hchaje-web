import React, { useEffect, useMemo, useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)
  const [candidateIndex, setCandidateIndex] = useState(0)

  const extractGoogleDriveFileId = (value: string) => {
    const fromFilePath = value.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (fromFilePath?.[1]) return fromFilePath[1]

    const fromQuery = value.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    if (fromQuery?.[1]) return fromQuery[1]

    return ''
  }

  const handleError = () => {
    if (candidateIndex < sourceCandidates.length - 1) {
      setCandidateIndex((index) => index + 1)
      return
    }
    setDidError(true)
  }

  const { src, alt, style, className, referrerPolicy, ...rest } = props
  const safeReferrerPolicy = referrerPolicy ?? 'no-referrer'

  const sourceCandidates = useMemo(() => {
    const rawSrc = String(src || '')
    if (!rawSrc) return ['']

    const unique = new Set<string>([rawSrc])
    if (rawSrc.includes('drive.google.com')) {
      const fileId = extractGoogleDriveFileId(rawSrc)
      if (fileId) {
        unique.add(`https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`)
        unique.add(`https://lh3.googleusercontent.com/d/${fileId}=w1200`)
        unique.add(`https://drive.google.com/uc?export=download&id=${fileId}`)
      }
    }

    return Array.from(unique)
  }, [src])

  useEffect(() => {
    setDidError(false)
    setCandidateIndex(0)
  }, [src])

  const currentSrc = sourceCandidates[candidateIndex] || String(src || '')

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} referrerPolicy={safeReferrerPolicy} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img src={currentSrc} alt={alt} className={className} style={style} {...rest} referrerPolicy={safeReferrerPolicy} onError={handleError} data-original-url={src} />
  )
}
