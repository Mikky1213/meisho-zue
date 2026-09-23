import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      style={{
        maxWidth: '760px',
        margin: '0 auto',
        padding: '100px 24px 120px',
        textAlign: 'center',
        color: '#292722',
      }}
    >
      <div
        style={{
          marginBottom: '12px',
          color: '#918879',
          fontSize: '0.8rem',
          letterSpacing: '0.18em',
        }}
      >
        404
      </div>

      <h1
        style={{
          margin: 0,
          fontFamily:
            '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Noto Serif JP", serif',
          fontSize: '2rem',
          fontWeight: 500,
        }}
      >
        名所が見つかりません
      </h1>

      <p
        style={{
          margin: '20px 0 32px',
          color: '#716a61',
          lineHeight: 1.9,
        }}
      >
        URLが変更されたか、まだ公開されていない名所の可能性があります。
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <Link
          href="/meisho"
          style={{
            padding: '11px 19px',
            borderRadius: '6px',
            background: '#3f4a45',
            color: '#fff',
            textDecoration: 'none',
          }}
        >
          名所一覧へ
        </Link>

        <Link
          href="/"
          style={{
            padding: '10px 19px',
            border: '1px solid #cfc8bd',
            borderRadius: '6px',
            color: '#575149',
            textDecoration: 'none',
          }}
        >
          トップへ
        </Link>
      </div>
    </main>
  )
}
