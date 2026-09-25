import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export default function MeishoLayout({
  children,
}: Props) {
  return (
    <>
      <style>{`
        nav[aria-label='ページ内目次']
          > span[aria-hidden='true']
          + span[aria-hidden='true'] {
          display: none;
        }

        nav[aria-label='ページ内目次']
          a[href='#visual-comparison'] {
          display: none;
        }

        nav[aria-label='ページ内目次']
          a[href='#visual-comparison']
          + span[aria-hidden='true'] {
          display: none;
        }

        #visual-comparison {
          display: none !important;
        }
      `}</style>

      {children}
    </>
  )
}
