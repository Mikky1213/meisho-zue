'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'

type HistoricalItem = {
  id: number
  item_order: number | null
  item_type: string | null
  heading: string | null
  raw_text: string | null
}

type LiteraryItem = {
  place_item_id: number
  item_type: string | null
  source_id: number | null
  author_id: number | null
  preface_text: string | null
  raw_text: string | null
}

type SourceRow = {
  id: number
  title: string
}

type AuthorRow = {
  id: number
  name: string
}

type LiteraryMeta = {
  sourceTitle: string
  authorName: string
}

const KOISHIKAWA_LITERARY_FALLBACK: Record<number, LiteraryMeta> = {
  3: {
    sourceTitle: '回国雑記',
    authorName: '道興准后',
  },
  5: {
    sourceTitle: '黄葉集',
    authorName: '烏丸光広',
  },
  6: {
    sourceTitle: '黄葉集',
    authorName: '芭蕉',
  },
  7: {
    sourceTitle: '黄葉集',
    authorName: '宗因',
  },
}

const LITERARY_TYPES = new Set([
  'waka',
  'haiku',
  'kyoka',
  'gyosei',
  'jisei',
  'renga',
])

function normalizeType(value: string | null) {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
}

function formatSourceTitle(title: string) {
  const trimmed = title.trim()

  if (!trimmed) {
    return ''
  }

  if (/^『[^』]+』$/.test(trimmed)) {
    return trimmed
  }

  if (trimmed === '同' || trimmed === '同上') {
    return trimmed
  }

  return `『${trimmed}』`
}

export default function HistoricalTextFormatter() {
  const pathname = usePathname()

  useEffect(() => {
    const match = pathname.match(/^\/meisho\/(\d+)\/?$/)

    if (!match) {
      return
    }

    const entryId = Number(match[1])
    let cancelled = false

    async function applyFormatting() {
      const { data } = await supabase
        .from('place_items')
        .select(`
          id,
          item_order,
          item_type,
          heading,
          raw_text
        `)
        .eq('entry_id', entryId)
        .neq('item_type', 'full_text')
        .order('item_order')

      if (cancelled || !data) {
        return
      }

      const root = document.querySelector<HTMLElement>(
        '.historical-text-body'
      )

      if (!root) {
        return
      }

      root
        .querySelectorAll('.historical-generated-meta')
        .forEach((node) => node.remove())

      const items = data as HistoricalItem[]
      const elements = Array.from(root.children) as HTMLElement[]
      const count = Math.min(elements.length, items.length)

      const itemIds = items.map((item) => item.id)

      let literaryRows: LiteraryItem[] = []
      let sourceRows: SourceRow[] = []
      let authorRows: AuthorRow[] = []

      if (itemIds.length > 0) {
        const { data: literaryData } = await supabase
          .from('literary_items')
          .select(`
            place_item_id,
            item_type,
            source_id,
            author_id,
            preface_text,
            raw_text
          `)
          .in('place_item_id', itemIds)

        literaryRows = (literaryData ?? []) as LiteraryItem[]

        const sourceIds = [
          ...new Set(
            literaryRows
              .map((item) => item.source_id)
              .filter((id): id is number => id !== null)
          ),
        ]

        const authorIds = [
          ...new Set(
            literaryRows
              .map((item) => item.author_id)
              .filter((id): id is number => id !== null)
          ),
        ]

        if (sourceIds.length > 0) {
          const { data: sourcesData } = await supabase
            .from('sources')
            .select('id, title')
            .in('id', sourceIds)

          sourceRows = (sourcesData ?? []) as SourceRow[]
        }

        if (authorIds.length > 0) {
          const { data: authorsData } = await supabase
            .from('authors')
            .select('id, name')
            .in('id', authorIds)

          authorRows = (authorsData ?? []) as AuthorRow[]
        }
      }

      if (cancelled) {
        return
      }

      const literaryByPlaceItem = new Map(
        literaryRows.map((item) => [item.place_item_id, item])
      )

      const sourceMap = new Map(
        sourceRows.map((item) => [item.id, item.title])
      )

      const authorMap = new Map(
        authorRows.map((item) => [item.id, item.name])
      )

      let lastSourceTitle = ''

      for (let index = 0; index < count; index += 1) {
        const element = elements[index]
        const item = items[index]
        const type = normalizeType(item.item_type)

        if (type) {
          element.classList.add(`historical-item-${type}`)
          element.dataset.itemType = type
        }

        if (type === 'kotobagaki') {
          continue
        }

        if (!LITERARY_TYPES.has(type)) {
          lastSourceTitle = ''
          continue
        }

        const literary = literaryByPlaceItem.get(item.id)
        const fallback =
          entryId === 4502 && item.item_order !== null
            ? KOISHIKAWA_LITERARY_FALLBACK[item.item_order]
            : undefined

        const sourceTitle =
          literary?.source_id !== null && literary?.source_id !== undefined
            ? sourceMap.get(literary.source_id)?.trim() ??
              fallback?.sourceTitle ??
              ''
            : fallback?.sourceTitle ?? ''

        const authorName =
          literary?.author_id !== null && literary?.author_id !== undefined
            ? authorMap.get(literary.author_id)?.trim() ??
              fallback?.authorName ??
              ''
            : fallback?.authorName ?? ''

        if (sourceTitle) {
          if (sourceTitle !== lastSourceTitle) {
            const sourceMetaKey = `source-${item.id}`

            if (
              !root.querySelector(
                `[data-historical-meta-key="${sourceMetaKey}"]`
              )
            ) {
              const sourceElement = document.createElement('div')
              sourceElement.className =
                'historical-generated-meta historical-source-title'
              sourceElement.dataset.historicalMetaKey = sourceMetaKey
              sourceElement.textContent = formatSourceTitle(sourceTitle)

              let anchor: HTMLElement = element

              if (
                index > 0 &&
                normalizeType(items[index - 1].item_type) === 'kotobagaki'
              ) {
                anchor = elements[index - 1]
              }

              root.insertBefore(sourceElement, anchor)
            }
          }

          lastSourceTitle = sourceTitle
        } else {
          lastSourceTitle = ''
        }

        if (authorName) {
          const authorMetaKey = `author-${item.id}`

          if (
            !root.querySelector(
              `[data-historical-meta-key="${authorMetaKey}"]`
            )
          ) {
            const authorElement = document.createElement('div')
            authorElement.className =
              'historical-generated-meta historical-literary-author'
            authorElement.dataset.historicalMetaKey = authorMetaKey
            authorElement.textContent = authorName
            element.insertAdjacentElement('afterend', authorElement)
          }
        }
      }
    }

    const frame = window.requestAnimationFrame(() => {
      void applyFormatting()
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
    }
  }, [pathname])

  return (
    <style>{`
      .historical-text-body > .historical-source-title {
        margin: 8px 0 0 3ch !important;
        padding: 0 !important;
        border-left: 0 !important;
        text-align: left !important;
        white-space: pre-wrap;
      }

      .historical-text-body > .historical-item-kotobagaki {
        margin: 0 0 0 10ch !important;
        padding: 0 !important;
        border-left: 0 !important;
        text-align: left !important;
      }

      .historical-text-body > .historical-item-waka,
      .historical-text-body > .historical-item-haiku,
      .historical-text-body > .historical-item-kyoka,
      .historical-text-body > .historical-item-gyosei,
      .historical-text-body > .historical-item-jisei,
      .historical-text-body > .historical-item-renga {
        margin: 0 0 0 6ch !important;
        padding: 0 !important;
        border-left: 0 !important;
        text-align: left !important;
      }

      .historical-text-body > .historical-literary-author {
        margin: 0 3ch 6px 6ch !important;
        padding: 0 !important;
        border-left: 0 !important;
        text-align: right !important;
        white-space: pre-wrap;
      }

      .historical-text-body > .historical-item-end {
        display: none !important;
      }

      .historical-text-body > .historical-item-kotobagaki > strong,
      .historical-text-body > .historical-item-waka > strong,
      .historical-text-body > .historical-item-haiku > strong,
      .historical-text-body > .historical-item-kyoka > strong,
      .historical-text-body > .historical-item-gyosei > strong,
      .historical-text-body > .historical-item-jisei > strong,
      .historical-text-body > .historical-item-renga > strong {
        display: inline;
        font-weight: inherit;
      }

      @media (max-width: 720px) {
        .historical-text-body > .historical-source-title {
          margin-left: 3ch !important;
        }

        .historical-text-body > .historical-item-kotobagaki {
          margin-left: 8ch !important;
        }

        .historical-text-body > .historical-item-waka,
        .historical-text-body > .historical-item-haiku,
        .historical-text-body > .historical-item-kyoka,
        .historical-text-body > .historical-item-gyosei,
        .historical-text-body > .historical-item-jisei,
        .historical-text-body > .historical-item-renga {
          margin-left: 6ch !important;
        }

        .historical-text-body > .historical-literary-author {
          margin-left: 6ch !important;
          margin-right: 1ch !important;
        }
      }
    `}</style>
  )
}
