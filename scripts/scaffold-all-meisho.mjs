import fs from 'node:fs'
import path from 'node:path'
import {
  createClient,
} from '@supabase/supabase-js'
import {
  fail,
  loadEnvLocal,
  parseCliArgs,
  printSuccess,
  projectRoot,
  tsString,
  writeUtf8,
} from './lib/content-utils.mjs'

const PAGE_SIZE = 1000
const ENTRY_CHUNK_SIZE = 200

async function fetchAllPlaceEntryIds(
  supabase
) {
  const ids = new Set()
  let from = 0

  while (true) {
    const {
      data,
      error,
    } = await supabase
      .from('entry_places')
      .select('entry_id')
      .range(
        from,
        from + PAGE_SIZE - 1
      )

    if (error) {
      throw new Error(
        `entry_places の取得に失敗しました: ${error.message}`
      )
    }

    for (const row of data ?? []) {
      if (
        Number.isInteger(
          row.entry_id
        )
      ) {
        ids.add(
          row.entry_id
        )
      }
    }

    if (
      !data ||
      data.length < PAGE_SIZE
    ) {
      break
    }

    from += PAGE_SIZE
  }

  return [...ids].sort(
    (a, b) => a - b
  )
}

async function fetchEntriesByIds(
  supabase,
  ids
) {
  const rows = []

  for (
    let index = 0;
    index < ids.length;
    index += ENTRY_CHUNK_SIZE
  ) {
    const chunk =
      ids.slice(
        index,
        index +
          ENTRY_CHUNK_SIZE
      )

    const {
      data,
      error,
    } = await supabase
      .from('entries')
      .select(`
        id,
        work_id,
        volume_id,
        entry_order,
        heading,
        reading
      `)
      .in('id', chunk)

    if (error) {
      throw new Error(
        `entries の取得に失敗しました: ${error.message}`
      )
    }

    rows.push(
      ...(data ?? [])
    )
  }

  return rows
}

function buildSkeleton(
  entry
) {
  return `import type { CurrentPlace } from '../currentPlaces'

export const meisho${entry.id}: CurrentPlace = {
  currentName: ${tsString(entry.heading)},

  address: '',

  description: '',

  photos: [],
}
`
}

async function main() {
  loadEnvLocal()

  const {
    flags,
  } = parseCliArgs()

  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL

  const supabaseKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (
    !supabaseUrl ||
    !supabaseKey
  ) {
    throw new Error(
      '.env.local の NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY を確認してください'
    )
  }

  const supabase =
    createClient(
      supabaseUrl,
      supabaseKey
    )

  const workId =
    typeof flags.work === 'string'
      ? Number(flags.work)
      : null

  if (
    workId !== null &&
    !Number.isInteger(workId)
  ) {
    throw new Error(
      '--work は整数で指定してください'
    )
  }

  const dryRun =
    flags['dry-run'] === true

  console.log(
    'entry_places から名所に紐づく entry ID を取得します...'
  )

  const placeEntryIds =
    await fetchAllPlaceEntryIds(
      supabase
    )

  console.log(
    `名所関連 entry: ${placeEntryIds.length}件`
  )

  const entries =
    await fetchEntriesByIds(
      supabase,
      placeEntryIds
    )

  const targets =
    workId === null
      ? entries
      : entries.filter(
          (entry) =>
            entry.work_id ===
            workId
        )

  targets.sort(
    (a, b) => {
      if (
        a.work_id !==
        b.work_id
      ) {
        return (
          a.work_id -
          b.work_id
        )
      }

      if (
        (a.volume_id ?? 0) !==
        (b.volume_id ?? 0)
      ) {
        return (
          (a.volume_id ?? 0) -
          (b.volume_id ?? 0)
        )
      }

      return (
        (a.entry_order ??
          Number.MAX_SAFE_INTEGER) -
        (b.entry_order ??
          Number.MAX_SAFE_INTEGER)
      )
    }
  )

  const meishoDir =
    path.join(
      projectRoot,
      'src',
      'data',
      'meisho'
    )

  fs.mkdirSync(
    meishoDir,
    {
      recursive: true,
    }
  )

  let created = 0
  let existing = 0

  for (const entry of targets) {
    const filePath =
      path.join(
        meishoDir,
        `${entry.id}.ts`
      )

    if (
      fs.existsSync(
        filePath
      )
    ) {
      existing += 1
      continue
    }

    if (!dryRun) {
      writeUtf8(
        filePath,
        buildSkeleton(
          entry
        )
      )
    }

    created += 1
  }

  console.log('')
  console.log(
    `対象: ${targets.length}件`
  )
  console.log(
    `既存: ${existing}件`
  )

  if (dryRun) {
    console.log(
      `新規作成予定: ${created}件`
    )
    console.log(
      '※ --dry-run のためファイルは変更していません'
    )
  } else {
    printSuccess(
      `基礎ファイルを ${created}件 作成しました`
    )
  }

  console.log('')
  console.log(
    'currentPlaces.ts は変更していません。'
  )
  console.log(
    'つまり、基礎ファイルを作っただけでは公開されません。'
  )
  console.log(
    '記事を公開するときは npm.cmd run add-meisho -- ENTRY_ID を実行してください。'
  )
}

main().catch(fail)
