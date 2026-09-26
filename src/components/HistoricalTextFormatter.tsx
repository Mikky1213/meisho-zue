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

const SOURCE_TITLE_PATTERN = /^『[^』]+』$/

function normalizeType(value: string | null) {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
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

      const elements = Array.from(root.children) as HTMLElement[]
      const items = data as HistoricalItem[]
      const count = Math.min(elements.length, items.length)

      for (let index = 0; index < count; index += 1) {
        const element = elements[index]
        const item = items[index]
        const type = normalizeType(item.item_type)

        if (type) {
          element.classList.add(`historical-item-${type}`)
          element.dataset.itemType = type
        }

        const text = (item.raw_text || item.heading || '').trim()

        if (
          type === 'waka' &&
          SOURCE_TITLE_PATTERN.test(text)
        ) {
          element.classList.add('historical-source-title')
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
      }

      .historical-text-body > .historical-item-kotobagaki {
        margin: 0 0 0 10ch !important;
        padding: 0 !important;
        border-left: 0 !important;
        text-align: left !important;
      }

      .historical-text-body > .historical-item-waka:not(.historical-source-title),
      .historical-text-body > .historical-item-haiku,
      .historical-text-body > .historical-item-kyoka,
      .historical-text-body > .historical-item-gyosei,
      .historical-text-body > .historical-item-jisei {
        margin: 0 0 0 6ch !important;
        padding: 0 !important;
        border-left: 0 !important;
        text-align: left !important;
      }

      .historical-text-body > .historical-item-author {
        margin: 0 3ch 6px 0 !important;
        padding: 0 !important;
        border-left: 0 !important;
        text-align: right !important;
      }

      .historical-text-body > .historical-item-end {
        display: none !important;
      }

      .historical-text-body > .historical-source-title > strong,
      .historical-text-body > .historical-item-kotobagaki > strong,
      .historical-text-body > .historical-item-waka > strong,
      .historical-text-body > .historical-item-haiku > strong,
      .historical-text-body > .historical-item-kyoka > strong,
      .historical-text-body > .historical-item-gyosei > strong,
      .historical-text-body > .historical-item-jisei > strong,
      .historical-text-body > .historical-item-author > strong {
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

        .historical-text-body > .historical-item-waka:not(.historical-source-title),
        .historical-text-body > .historical-item-haiku,
        .historical-text-body > .historical-item-kyoka,
        .historical-text-body > .historical-item-gyosei,
        .historical-text-body > .historical-item-jisei {
          margin-left: 6ch !important;
        }
      }
    `}</style>
  )
}
