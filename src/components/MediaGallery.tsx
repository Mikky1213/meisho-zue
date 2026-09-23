'use client'

import {
  useEffect,
  useState,
} from 'react'

export type MediaGalleryItem = {
  url: string
  alt?: string
  caption?: string
  meta?: string[]
  sourceUrl?: string
}

type Props = {
  items: MediaGalleryItem[]
  emptyText?: string
}

export default function MediaGallery({
  items,
  emptyText,
}: Props) {
  const [activeIndex, setActiveIndex] =
    useState<number | null>(null)

  const activeItem =
    activeIndex !== null
      ? items[activeIndex]
      : null

  const close = () => {
    setActiveIndex(null)
  }

  const previous = () => {
    setActiveIndex((current) => {
      if (current === null) {
        return null
      }

      return (
        current - 1 + items.length
      ) % items.length
    })
  }

  const next = () => {
    setActiveIndex((current) => {
      if (current === null) {
        return null
      }

      return (
        current + 1
      ) % items.length
    })
  }

  useEffect(() => {
    if (activeIndex === null) {
      return
    }

    const originalOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    const onKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        close()
      }

      if (
        event.key === 'ArrowLeft' &&
        items.length > 1
      ) {
        previous()
      }

      if (
        event.key === 'ArrowRight' &&
        items.length > 1
      ) {
        next()
      }
    }

    window.addEventListener(
      'keydown',
      onKeyDown
    )

    return () => {
      document.body.style.overflow =
        originalOverflow

      window.removeEventListener(
        'keydown',
        onKeyDown
      )
    }
  }, [activeIndex, items.length])

  if (items.length === 0) {
    return emptyText ? (
      <div
        style={{
          padding: '20px',
          border:
            '1px dashed #d8d2c7',
          borderRadius: '8px',
          color: '#888077',
          fontSize: '0.88rem',
        }}
      >
        {emptyText}
      </div>
    ) : null
  }

  return (
    <>
      <div className="media-gallery-grid">
        {items.map((item, index) => (
          <figure
            key={`${item.url}-${index}`}
            className="media-gallery-item"
          >
            <button
              type="button"
              onClick={() =>
                setActiveIndex(index)
              }
              aria-label={`画像を拡大: ${
                item.caption ||
                item.alt ||
                index + 1
              }`}
              className="media-gallery-button"
            >
              <img
                src={item.url}
                alt={
                  item.alt ||
                  item.caption ||
                  `画像 ${index + 1}`
                }
                loading="lazy"
                className="media-gallery-image"
              />

              <span className="media-gallery-zoom">
                拡大
              </span>
            </button>

            {(item.caption ||
              (item.meta &&
                item.meta.length > 0) ||
              item.sourceUrl) && (
              <figcaption className="media-gallery-caption">
                {item.caption && (
                  <div className="media-gallery-caption-title">
                    {item.caption}
                  </div>
                )}

                {item.meta?.map(
                  (line, metaIndex) => (
                    <div
                      key={`${line}-${metaIndex}`}
                    >
                      {line}
                    </div>
                  )
                )}

                {item.sourceUrl && (
                  <div>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      出典を開く
                    </a>
                  </div>
                )}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {activeItem &&
        activeIndex !== null && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="画像拡大表示"
            className="media-lightbox"
            onClick={close}
          >
            <div
              className="media-lightbox-inner"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <button
                type="button"
                onClick={close}
                aria-label="閉じる"
                className="media-lightbox-close"
              >
                ×
              </button>

              <div className="media-lightbox-image-wrap">
                <img
                  src={activeItem.url}
                  alt={
                    activeItem.alt ||
                    activeItem.caption ||
                    '拡大画像'
                  }
                  className="media-lightbox-image"
                />
              </div>

              {(activeItem.caption ||
                (activeItem.meta &&
                  activeItem.meta.length >
                    0) ||
                activeItem.sourceUrl) && (
                <div className="media-lightbox-caption">
                  {activeItem.caption && (
                    <div className="media-lightbox-caption-title">
                      {activeItem.caption}
                    </div>
                  )}

                  {activeItem.meta?.map(
                    (
                      line,
                      metaIndex
                    ) => (
                      <div
                        key={`${line}-${metaIndex}`}
                      >
                        {line}
                      </div>
                    )
                  )}

                  {activeItem.sourceUrl && (
                    <div>
                      <a
                        href={
                          activeItem.sourceUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        出典を開く
                      </a>
                    </div>
                  )}
                </div>
              )}

              {items.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={previous}
                    aria-label="前の画像"
                    className="media-lightbox-nav media-lightbox-prev"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={next}
                    aria-label="次の画像"
                    className="media-lightbox-nav media-lightbox-next"
                  >
                    ›
                  </button>

                  <div className="media-lightbox-counter">
                    {activeIndex + 1}
                    {' / '}
                    {items.length}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
    </>
  )
}
