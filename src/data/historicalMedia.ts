export type HistoricalImage = {
  url: string
  caption: string
  alt?: string
  source?: string
  sourceUrl?: string
  page?: string
  note?: string
}

/**
 * 歴史画像は Supabase Storage には置かず、
 * ImageKit 等に置いた画像URLを記事IDごとに登録する。
 */
const kishimojinHomyojiImageUrl =
  'https://ik.imagekit.io/meisho/4498/digidepo_959918_0103.jpg'

const denzuinSourceUrl =
  'https://ma-maison.sakura.ne.jp/hill/meishozue/zue_koishikawa.html'

export const historicalMedia: Record<
  number,
  HistoricalImage[]
> = {
  4498: [
    {
      url: kishimojinHomyojiImageUrl,
      caption: '『江戸名所図会』鬼子母神堂',
      alt: '『江戸名所図会』鬼子母神堂',
      source: '『江戸名所図会』',
      page: '巻之四',
    },
    {
      url: 'https://ik.imagekit.io/meisho/4498/clipboard_20260926_210705.png',
      caption: '『江戸名所図会』鬼子母神堂（1）',
      alt: '『江戸名所図会』鬼子母神堂（1）',
      source: '『江戸名所図会』',
      page: '巻之四',
    },
    {
      url: 'https://ik.imagekit.io/meisho/4498/clipboard_20260926_210724.png',
      caption: '『江戸名所図会』鬼子母神堂（2）',
      alt: '『江戸名所図会』鬼子母神堂（2）',
      source: '『江戸名所図会』',
      page: '巻之四',
    },
  ],

  4503: [
    {
      url: 'https://ma-maison.sakura.ne.jp/hill/meishozue/zue_koishikawa/101dentsuin_uramon.jpg',
      caption: '『江戸名所図会』傳通院裏門',
      alt: '『江戸名所図会』に描かれた傳通院裏門',
      source: '『江戸名所図会』',
      sourceUrl: denzuinSourceUrl,
      page: '巻之四 天権之部',
      note: '傳通院全景を構成する連続挿図の一部。',
    },
    {
      url: 'https://ma-maison.sakura.ne.jp/hill/meishozue/zue_koishikawa/102takuzosu.jpg',
      caption: '『江戸名所図会』其二 澤蔵主稲荷社',
      alt: '『江戸名所図会』に描かれた澤蔵主稲荷社',
      source: '『江戸名所図会』',
      sourceUrl: denzuinSourceUrl,
      page: '巻之四 天権之部',
      note: '「傳通院裏門」に続く連続挿図。',
    },
    {
      url: 'https://ma-maison.sakura.ne.jp/hill/meishozue/zue_koishikawa/103dentsuin_somon.jpg',
      caption: '『江戸名所図会』其三 傳通院総門・大黒天・念佛堂',
      alt: '『江戸名所図会』に描かれた傳通院総門・大黒天・念佛堂',
      source: '『江戸名所図会』',
      sourceUrl: denzuinSourceUrl,
      page: '巻之四 天権之部',
      note: '「澤蔵主稲荷社」に続く連続挿図。',
    },
  ],

  4504: [
    {
      url: 'https://ma-maison.sakura.ne.jp/hill/meishozue/zue_koishikawa/104koenji.jpg',
      caption: '『江戸名所図会』光圓寺',
      alt: '『江戸名所図会』に描かれた中臺山光圓寺',
      source: '『江戸名所図会』',
      sourceUrl: denzuinSourceUrl,
      page: '巻之四 天権之部',
      note: '光圓寺の境内と大銀杏を描いた挿図。',
    },
  ],

  4506: [
    {
      url: 'https://ma-maison.sakura.ne.jp/hill/meishozue/zue_koishikawa/105sokeiji.jpg',
      caption: '『江戸名所図会』宗慶寺・極楽水',
      alt: '『江戸名所図会』に描かれた吉水山宗慶寺と極楽水',
      source: '『江戸名所図会』',
      sourceUrl: denzuinSourceUrl,
      page: '巻之四 天権之部',
      note: '宗慶寺境内と極楽水を描いた挿図。',
    },
  ],

  4507: [
    {
      url: 'https://ma-maison.sakura.ne.jp/hill/meishozue/zue_koishikawa/106shounji_muryoin.jpg',
      caption: '『江戸名所図会』祥雲寺・無量院',
      alt: '『江戸名所図会』に描かれた瑞鳳山祥雲寺と薬王山無量院',
      source: '『江戸名所図会』',
      sourceUrl: denzuinSourceUrl,
      page: '巻之四 天権之部',
      note: '祥雲寺と無量院を一続きの景観として描いた見開き挿図。',
    },
  ],

  4508: [
    {
      url: 'https://ma-maison.sakura.ne.jp/hill/meishozue/zue_komagome/4-107hakusanjinja.jpg',
      caption: '『江戸名所図会』小石川白山権現社',
      alt: '『江戸名所図会』に描かれた小石川白山権現社',
      source: '『江戸名所図会』',
      sourceUrl: 'https://ma-maison.sakura.ne.jp/hill/meishozue/zue_komagome.html',
      page: '巻之四 天権之部',
      note: '現在の白山神社にあたる白山権現社の境内を描いた挿図。',
    },
  ],

  4511: [
    {
      url: 'https://ik.imagekit.io/meisho/4511/clipboard_20260930_211427.png',
      caption: '『江戸名所図会』氷川明神社',
      alt: '『江戸名所図会』に描かれた小石川氷川明神社',
      source: '『江戸名所図会』',
      page: '巻之四 天権之部',
      note: '現在の簸川神社にあたる氷川明神社の挿図。',
    },
  ],

  7292: [
    {
      url: kishimojinHomyojiImageUrl,
      caption: '『江戸名所図会』威光山法明寺',
      alt: '『江戸名所図会』威光山法明寺',
      source: '『江戸名所図会』',
      page: '巻之四',
    },
  ],

  7293: [
    {
      url: 'https://ik.imagekit.io/meisho/7293/clipboard_20260926_210757.png',
      caption: '『江戸名所図会』雑司ヶ谷鬼子母神出現所',
      alt: '『江戸名所図会』雑司ヶ谷鬼子母神出現所',
      source: '『江戸名所図会』',
      page: '巻之四',
    },
  ],
}
