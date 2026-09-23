import { supabase } from '../src/lib/supabase'

export default async function Home() {
  const { data: works, error } = await supabase
    .from('works')
    .select('*')

  return (
    <main style={{ padding: '40px' }}>
      <h1>名所図会 今昔</h1>

      {error ? (
        <>
          <h2>Supabase接続エラー</h2>
          <pre>{error.message}</pre>
        </>
      ) : (
        <>
          <h2>works テーブル</h2>
          <pre>{JSON.stringify(works, null, 2)}</pre>
        </>
      )}
    </main>
  )
}