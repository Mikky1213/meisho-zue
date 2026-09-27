import type { CurrentPlace } from '../currentPlaces'
import { tokyoMeishoZue4510 } from './4510TokyoMeishoZue'

export const meisho4510: CurrentPlace = {
  currentName: '小石川養生所跡（小石川植物園）',

  address: '東京都文京区白山3-7-1',

  description:
    '江戸幕府が小石川御薬園内に設けた施療施設・小石川養生所の跡。町医者小川笙船の意見をもとに享保7年（1722）に設けられ、明治維新まで続いた。現在は東京大学小石川植物園の一部となり、旧養生所で用いられた井戸が現存する。',

  photos: [
    {
      url: 'https://koishikawa-bg.jp/wp/wp-content/uploads/2022/12/well01-scaled.jpg',
      caption: '現存する小石川養生所の井戸',
      alt: '小石川植物園内に残る旧小石川養生所の井戸',
      credit: '小石川植物園公式サイト',
      sourceUrl: 'https://koishikawa-bg.jp/ennai/ido/',
    },
    {
      url: 'https://koishikawa-bg.jp/wp/wp-content/themes/koisikawa.wp/asset/images/panorama.jpg',
      caption: '現在の小石川植物園',
      alt: '小石川養生所跡を含む現在の小石川植物園',
      credit: '小石川植物園公式サイト',
      sourceUrl: 'https://koishikawa-bg.jp/overview/',
    },
  ],

  documents: tokyoMeishoZue4510,

  comparison: [
    {
      title: '施藥所・養生所の開設',
      text: '『東京名所図会』は、町医師小川笙船の建議を受け、享保7年（1722）に小石川御薬園内へ施藥所（養生所）が設けられ、同年12月から貧困の病者を収容して薬餌を与えたと記す。現在の小石川植物園公式解説も、小川笙船の意見により享保7年に設立された施療所と説明している。',
      source: '『東京名所図会』・小石川植物園公式サイト',
      url: 'https://koishikawa-bg.jp/overview/memorial/',
    },
    {
      title: '御薬園の中に置かれた医療施設',
      text: '養生所は独立した場所ではなく、小石川御薬園の一角に設けられていた。現在もその旧地は小石川植物園の園内に含まれており、御薬園跡と養生所跡は一体として歴史的景観を伝えている。',
      source: '『東京名所図会』・文京区',
      url: 'https://www.city.bunkyo.lg.jp/b047/p004379.html',
    },
    {
      title: '旧養生所の井戸',
      text: '建物そのものは残っていないが、養生所で使われた井戸が現在も園内に残る。小石川植物園によれば水質・水量に恵まれ、大正12年（1923）の関東大震災時には避難者の飲料水としても役立った。',
      source: '小石川植物園公式サイト',
      url: 'https://koishikawa-bg.jp/ennai/ido/',
    },
    {
      title: '運営の具体像',
      text: '『東京名所図会』が引く「養生所一件」には、医師・町奉行与力・同心・下男・女性看護人などの配置案が記され、診療だけでなく病人の出入り、食事、薬の煎じ、洗濯、夜間の看護まで含む運営体制が構想されていたことがわかる。',
      source: '『東京名所図会』',
    },
    {
      title: '明治維新後と現在の史跡指定',
      text: '『東京名所図会』は、養生所が慶応年間まで約145年間続き、幕府瓦解後に東京府所轄となってほどなく当地を退いたと記す。現在、跡地を含む小石川植物園は「小石川植物園（御薬園跡及び養生所跡）」として国の名勝及び史跡に指定されている。',
      source: '『東京名所図会』・文京区',
      url: 'https://www.city.bunkyo.lg.jp/b047/p004379.html',
    },
    {
      title: '『東京名所図会』が見る養育院との関係',
      text: '『東京名所図会』は記事末尾で、施薬院を「今の市立養育院の前身なり」と位置づけている。これは同書が明治期の社会事業史の連続性をどのように理解していたかを示す記述として読むことができる。',
      source: '『東京名所図会』',
    },
  ],
}
