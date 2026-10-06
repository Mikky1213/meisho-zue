export type RegionDefinition = {
  slug: string
  title: string
  reading?: string
  subtitle?: string
  description: string
  entryIds: number[]
}

export const regions: RegionDefinition[] = [
  {
    slug: 'ichigaya-okubo',
    title: '市谷・大久保周辺',
    reading: 'いちがや・おおくぼしゅうへん',
    subtitle: '市谷八幡宮から大久保・柏木へ',
    description:
      '『江戸名所図会』巻之四の冒頭、市谷八幡宮から河田窪・大久保・四谷北寺町・柏木へ続く名所をまとめます。',
    entryIds: [
      4390,
      4391,
      4392,
      4393,
      4394,
      4395,
      4396,
      4398,
      4399,
      4400,
      4401,
    ],
  },
  {
    slug: 'yodobashi-nakano',
    title: '淀橋・中野周辺',
    reading: 'よどばし・なかのしゅうへん',
    subtitle: '淀橋から十二社・中野長者ゆかりの地へ',
    description:
      '『江戸名所図会』巻之四で、柏木の西から淀橋を渡り、角筈の十二所権現社、中野長者ゆかりの名所へ続く一帯をまとめます。',
    entryIds: [
      4402,
      4403,
      4404,
      4397,
      4405,
      4406,
      4407,
      4408,
    ],
  },
  {
    slug: 'koenji-asagaya',
    title: '高円寺・阿佐谷周辺',
    reading: 'こうえんじ・あさがやしゅうへん',
    subtitle: '桃園の旧地から阿佐谷へ',
    description:
      '『江戸名所図会』巻之四で、中野の桃園から西へ進み、高円寺・阿佐谷周辺に続く名所をまとめます。',
    entryIds: [
      4409,
      4410,
    ],
  },
  {
    slug: 'horinouchi-omiya',
    title: '堀ノ内・大宮周辺',
    reading: 'ほりのうち・おおみやしゅうへん',
    subtitle: '厄除け祖師から大宮八幡宮へ',
    description:
      '『江戸名所図会』巻之四で、堀ノ内の妙法寺から和田・大宮周辺へ続く名所をまとめます。',
    entryIds: [
      4411,
      4413,
    ],
  },
  {
    slug: 'hatagaya-inokashira',
    title: '幡ヶ谷・井の頭周辺',
    reading: 'はたがや・いのかしらしゅうへん',
    subtitle: '幡ヶ谷不動から井の頭池へ',
    description:
      '『江戸名所図会』巻之四で、幡ヶ谷不動から西へ進み、井の頭・吉祥寺方面へ続く名所をまとめます。',
    entryIds: [
      4414,
      4415,
      4416,
      4417,
    ],
  },
  {
    slug: 'koganei',
    title: '小金井・玉川上水周辺',
    reading: 'こがねい・たまがわじょうすいしゅうへん',
    subtitle: '小金井橋と玉川上水の桜',
    description:
      '『江戸名所図会』巻之四に描かれた小金井橋と玉川上水沿いの名所をまとめます。',
    entryIds: [
      4420,
    ],
  },
  {
    slug: 'koishikawa',
    title: '小石川周辺',
    reading: 'こいしかわしゅうへん',
    subtitle: '小石川・白山・千石・大塚の名所をたどる',
    description:
      '『江戸名所図会』巻之四に続いて現れる小石川周辺の名所をまとめます。小石川村・伝通院から白山、御薬園、氷川明神社、猫貍橋、大塚の十羅刹女堂まで、現在の記事を地域のまとまりとしてたどれます。',
    entryIds: [
      4502,
      4503,
      4504,
      4505,
      4506,
      4507,
      4508,
      4509,
      4510,
      4511,
      4512,
      4513,
    ],
  },
  {
    slug: 'itabashi',
    title: '板橋周辺',
    reading: 'いたばししゅうへん',
    subtitle: '板橋宿から赤塚へ、旧中山道沿いの名所をたどる',
    description:
      '『江戸名所図会』の板橋駅・板橋原・乗蓮寺から、志村・西台・赤塚方面へ続く名所を地域でまとめます。現在公開済みの記事に加え、今後整備する同地域の記事も順次この地域ページに加わります。',
    entryIds: [
      4514,
      4516,
      4517,
      4518,
      4519,
      4520,
      4521,
      4522,
      4523,
      4524,
      4525,
      4526,
      4527,
      4528,
      4529,
    ],
  },
  {
    slug: 'zoshigaya',
    title: '雑司ヶ谷',
    reading: 'ぞうしがや',
    subtitle: '『江戸名所図会』巻之四を中心にたどる',
    description:
      '「名所図会 今昔」で最初の重点地域として整備している雑司ヶ谷周辺の名所をまとめます。各記事の原文・現在情報・写真・関連史料・比較・歴史画像の登録状況も確認できます。',
    entryIds: [
      4495,
      7294,
      7293,
      4496,
      4497,
      4498,
      7292,
      4499,
      4500,
      4501,
    ],
  },
]

export function getRegionBySlug(
  slug: string
) {
  return regions.find(
    (region) =>
      region.slug === slug
  )
}

export function getRegionForEntry(
  entryId: number
) {
  return regions.find(
    (region) =>
      region.entryIds.includes(
        entryId
      )
  )
}
