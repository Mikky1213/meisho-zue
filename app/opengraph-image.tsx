import { ImageResponse } from 'next/og'

export const alt = '名所図会 今昔'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '90px',
          background: '#f4efe5',
          color: '#292722',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            letterSpacing: '0.18em',
            color: '#756b5d',
            marginBottom: 28,
          }}
        >
          MEISHO ZUE ARCHIVE
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 82,
            fontWeight: 600,
            letterSpacing: '0.08em',
          }}
        >
          名所図会 今昔
        </div>

        <div
          style={{
            display: 'flex',
            width: 150,
            height: 3,
            background: '#9b8e79',
            marginTop: 34,
            marginBottom: 34,
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 30,
            lineHeight: 1.6,
            color: '#5c554b',
          }}
        >
          <div
            style={{
              display: 'flex',
            }}
          >
            名所図会の原文と
          </div>

          <div
            style={{
              display: 'flex',
            }}
          >
            現在の風景をたどる
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
