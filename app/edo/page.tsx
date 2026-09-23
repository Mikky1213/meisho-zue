import { supabase } from '../../src/lib/supabase'

export default async function EdoPage() {
  const { data, error } = await supabase
    .from('entry_places')
    .select(`
      id,
      entry_id,
      place_id,
      relation_type,
      note
    `)
    .eq('entry_id', 4498)

  return (
    <main style={{ padding: '40px' }}>
      <h1>鬼子母神堂 entry_places 確認</h1>

      {error ? (
        <>
          <h2>取得エラー</h2>
          <pre>{error.message}</pre>
        </>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </main>
  )
}