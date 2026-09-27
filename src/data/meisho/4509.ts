import type { CurrentPlace } from '../currentPlaces'
import { tokyoMeishoZue4509 } from './4509TokyoMeishoZue'

export const meisho4509: CurrentPlace = {
  currentName: '東京大学大学院理学系研究科附属植物園（小石川植物園）',

  address: '東京都文京区白山3-7-1',

  description:
    '江戸幕府の小石川御薬園を前身とする東京大学の附属植物園。貞享元年（1684）に白山御殿の一部へ御薬園が設けられ、享保6年（1721）に御殿跡全体へ拡張された。現在も薬園保存園、乾薬場跡、旧養生所の井戸など、御薬園・養生所時代の歴史を伝える遺構が残る。',

  photos: [
    {
      url: 'https://koishikawa-bg.jp/wp/wp-content/themes/koisikawa.wp/asset/images/panorama.jpg',
      caption: '現在の小石川植物園',
      alt: '東京大学大学院理学系研究科附属植物園（小石川植物園）',
      credit: '小石川植物園公式サイト',
      sourceUrl: 'https://koishikawa-bg.jp/overview/',
    },
    {
      url: 'https://koishikawa-bg.jp/wp/wp-content/uploads/2022/12/medicinal_herbs01-scaled.jpg',
      caption: '薬園保存園',
      alt: '小石川植物園の薬園保存園',
      credit: '小石川植物園公式サイト',
      sourceUrl: 'https://koishikawa-bg.jp/ennai/medical/',
    },
    {
      url: 'https://koishikawa-bg.jp/wp/wp-content/themes/koisikawa.wp/asset/images/drying-herbal-medicines.jpg',
      caption: '御薬園時代の乾薬場跡',
      alt: '小石川植物園に残る御薬園時代の乾薬場跡',
      credit: '小石川植物園公式サイト',
      sourceUrl: 'https://koishikawa-bg.jp/overview/memorial/',
    },
  ],

  documents: tokyoMeishoZue4509,

  comparison: [
    {
      title: '小石川御薬園から小石川植物園へ',
      text: '『東京名所図会』は、白山御殿跡に設けられた幕府の御薬園が明治期に東京府、大学東校の管轄を経て小石川植物園へ改称した経緯を記す。現在の小石川植物園も、貞享元年（1684）に設けられた小石川御薬園を直接の前身としている。',
      source: '『東京名所図会』・小石川植物園公式サイト',
      url: 'https://koishikawa-bg.jp/overview/',
    },
    {
      title: '白山御殿跡と享保期の拡張',
      text: '『東京名所図会』には、白山御殿廃止後の跡地を御薬園とし、享保6年（1721）に約4万4,800坪を整備した記録が引かれている。小石川植物園の公式沿革でも、享保6年に御薬園が御殿地全体へ拡張され、約4万5千坪のほぼ現在の植物園の形になったとしている。',
      source: '『東京名所図会』・小石川植物園公式サイト',
      url: 'https://koishikawa-bg.jp/overview/oyakuen/',
    },
    {
      title: '南園・北園と薬園奉行',
      text: '『東京名所図会』は御薬園を南北二区に分け、南園を岡田家、北園を芥川小野寺家が預かったと記す。現在の公式解説でも、享保期の拡張後、西北側を芥川小野寺、東南側を岡田利左衛門が管理したとされ、当時の管理体制を確認できる。',
      source: '『東京名所図会』・小石川植物園公式サイト',
      url: 'https://koishikawa-bg.jp/overview/oyakuen/',
    },
    {
      title: '乾薬場跡',
      text: '『東京名所図会』が記す御薬園では、園内で薬草の栽培と調製が行われた。現在も園内には、薬草を並べて乾燥させた乾薬場の平石の一部が当時の位置に残されている。',
      source: '『東京名所図会』・小石川植物園公式サイト',
      url: 'https://koishikawa-bg.jp/overview/memorial/',
    },
    {
      title: '明治期の改称時期',
      text: '『東京名所図会』は明治10年（1877）5月に「小石川植物園」と改称したと記す。一方、現在の植物園公式年譜では、明治8年（1875）に文部省所轄教育博物館附属「小石川植物園」と改称し、明治10年に東京大学附属植物園となったとしており、名称変更の整理には差がみられる。',
      source: '『東京名所図会』・小石川植物園公式年譜',
      url: 'https://koishikawa-bg.jp/overview/timeline/',
    },
    {
      title: '現在の小石川植物園',
      text: '現在は東京大学大学院理学系研究科附属植物園として研究・教育に利用され、一般にも公開されている。園内は161,588平方メートルで、御薬園・養生所時代の遺構を含むことから「小石川植物園（御薬園跡及び養生所跡）」として国の名勝・史跡に指定されている。',
      source: '小石川植物園公式サイト',
      url: 'https://koishikawa-bg.jp/overview/',
    },
  ],
}
