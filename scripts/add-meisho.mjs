import fs from 'node:fs'
import path from 'node:path'
import {
  createClient,
} from '@supabase/supabase-js'
import {
  currentPlacesPath,
  fail,
  loadEnvLocal,
  parseCliArgs,
  printSuccess,
  projectRoot,
  requireInteger,
  tsString,
  writeUtf8,
} from './lib/content-utils.mjs'

async function main() {
  loadEnvLocal()

  const {
    positional,
  } = parseCliArgs()

  const entryId =
    requireInteger(
      positional[0],
      'entry ID'
    )

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

  const {
    data: entry,
    error,
  } = await supabase
    .from('entries')
    .select(`
      id,
      heading,
      reading,
      work_id,
      volume_id,
      entry_order
    `)
    .eq('id', entryId)
    .single()

  if (error || !entry) {
    throw new Error(
      `entries.id=${entryId} を取得できません: ${error?.message ?? 'not found'}`
    )
  }

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

  const filePath =
    path.join(
      meishoDir,
      `${entryId}.ts`
    )

  if (!fs.existsSync(filePath)) {
    const source = `import type { CurrentPlace } from '../currentPlaces'

export const meisho${entryId}: CurrentPlace = {
  currentName: ${tsString(entry.heading)},

  address: '',

  description: '',

  translation: [],

  documents: [],

  photos: [],

  comparison: [],
}
`

    writeUtf8(
      filePath,
      source
    )

    printSuccess(
      `記事ファイル作成: src/data/meisho/${entryId}.ts`
    )
  } else {
    console.log(
      `- 既存記事は上書きしません: src/data/meisho/${entryId}.ts`
    )
  }

  const registryPath =
    currentPlacesPath()

  let registry =
    fs.readFileSync(
      registryPath,
      'utf8'
    )

  const importLine =
    `import { meisho${entryId} } from './meisho/${entryId}'`

  if (
    !registry.includes(
      importLine
    )
  ) {
    const importMatches = [
      ...registry.matchAll(
        /^import .*$/gm
      ),
    ]

    if (
      importMatches.length === 0
    ) {
      throw new Error(
        'currentPlaces.ts の import 部分を解析できません'
      )
    }

    const lastImport =
      importMatches[
        importMatches.length - 1
      ]

    const insertAt =
      lastImport.index +
      lastImport[0].length

    registry =
      registry.slice(0, insertAt) +
      `\n${importLine}` +
      registry.slice(insertAt)
  }

  const mapMarker =
    'export const currentPlaces'

  const mapStart =
    registry.indexOf(
      mapMarker
    )

  if (mapStart === -1) {
    throw new Error(
      'currentPlaces の定義が見つかりません'
    )
  }

  const openBrace =
    registry.indexOf(
      '{',
      registry.indexOf(
        '=',
        mapStart
      )
    )

  const closeBrace =
    registry.indexOf(
      '\n}',
      openBrace
    )

  if (
    openBrace === -1 ||
    closeBrace === -1
  ) {
    throw new Error(
      'currentPlaces のマップ終端を解析できません'
    )
  }

  const mapBody =
    registry.slice(
      openBrace + 1,
      closeBrace
    )

  const entryPattern =
    new RegExp(
      `(^|\\n)\\s*${entryId}\\s*:`
    )

  if (!entryPattern.test(mapBody)) {
    registry =
      registry.slice(
        0,
        closeBrace
      ) +
      `\n  ${entryId}: meisho${entryId},` +
      registry.slice(
        closeBrace
      )
  }

  writeUtf8(
    registryPath,
    registry
  )

  printSuccess(
    `currentPlaces に ${entryId} を登録`
  )

  console.log(
    `  名所: ${entry.heading}`
  )
  console.log(
    `  読み: ${entry.reading ?? '-'}`
  )
}

main().catch(fail)
