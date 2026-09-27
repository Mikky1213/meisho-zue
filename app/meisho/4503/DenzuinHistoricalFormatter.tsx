'use client'

import { useEffect } from 'react'

const DETAIL_CLASS = 'denzuin-heading-detail'
const TITLE_CLASS = 'denzuin-heading-title'

function splitParenthetical(element: HTMLElement) {
  if (element.querySelector(`.${TITLE_CLASS}`)) {
    return
  }

  const text = (element.textContent ?? '').trim()
  const index = text.indexOf('（')

  if (index <= 0) {
    return
  }

  const titleText = text.slice(0, index)
  const detailText = text.slice(index)

  const title = document.createElement('span')
  title.className = TITLE_CLASS
  title.textContent = titleText

  const detail = document.createElement('span')
  detail.className = DETAIL_CLASS
  detail.textContent = detailText

  element.replaceChildren(title, detail)
}

export default function DenzuinHistoricalFormatter() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(
      '.historical-text-body'
    )

    if (!root) {
      return
    }

    const apply = () => {
      root
        .querySelectorAll<HTMLElement>(
          '.historical-text-subheading, .historical-text-block > strong'
        )
        .forEach(splitParenthetical)
    }

    apply()

    const observer = new MutationObserver(apply)
    observer.observe(root, {
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [])

  return (
    <style>{`
      .historical-text-body .${TITLE_CLASS} {
        font-size: inherit;
        font-weight: inherit;
        letter-spacing: inherit;
      }

      .historical-text-body .${DETAIL_CLASS} {
        font-size: 1.02rem !important;
        font-weight: 400 !important;
        letter-spacing: 0.02em !important;
        line-height: 2.05 !important;
      }

      .historical-text-body .historical-text-subheading .${DETAIL_CLASS} {
        margin-left: 0;
      }
    `}</style>
  )
}
