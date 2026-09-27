import type { CurrentPlace } from '../currentPlaces'
import { tokyoMeishoZue4508 } from './4508TokyoMeishoZue'
import { hakusanFestival4508 } from './4508Festival'

export const meisho4508: CurrentPlace = {
  currentName: '白山神社',

  address: '東京都文京区白山5-31-26',

  description:
    '文京区白山に鎮座する神社。天暦年間に加賀国一宮白山神社を本郷の地へ勧請したと伝えられ、元和年間に巣鴨原、明暦元年（1655）に現在地へ遷座した。現在は文京あじさいまつりの会場としても知られる。',

  photos: [
    {
      url: 'https://www.city.bunkyo.lg.jp/images/3727/hakusannjinja2.jpg',
      caption: '現在の白山神社',
      alt: '東京都文京区白山の白山神社',
      credit: '文京区',
      sourceUrl: 'https://www.city.bunkyo.lg.jp/b014/p003824.html',
    },
    {
      url: 'https://www.city.bunkyo.lg.jp/images/3727/hakusannjinja1.jpg',
      caption: '白山神社の参道・階段',
      alt: '白山神社へ続く参道と階段',
      credit: '文京区',
      sourceUrl: 'https://www.city.bunkyo.lg.jp/b014/p003824.html',
    },
  ],

  documents: [
    ...tokyoMeishoZue4508.filter(
      (document) => document.title !== '『東京名所図会』享和二年の祭禮'
    ),
    hakusanFestival4508,
  ],

  comparison: [
    {
      title: '創建年代と遷座',
      text: '『東京名所図会』は、江戸期の諸書が元和年間の勧請としたことを疑い、社蔵の由緒書を根拠に、白山神社の起源を天暦年間まで遡らせている。現在の文京区の案内でも、天暦年間に加賀一宮白山神社を本郷一丁目付近へ勧請し、元和年間に巣鴨原、明暦元年（1655）に現在地へ移ったと紹介しており、東京名所図会の整理とほぼ一致する。',
      source: '『東京名所図会』・文京区',
      url: 'https://www.city.bunkyo.lg.jp/b014/p003824.html',
    },
    {
      title: '白山御殿との関係',
      text: '『東京名所図会』は、白山神社・氷川社・女体権現がかつて同じ地域に並んでいたとする伝承を引き、御用地化によってそれぞれ移された経緯を記す。現在の文京区も、巣鴨原の旧社地が館林侯綱吉の屋敷造営地となったため、白山神社が現在地へ遷座したと説明している。',
      source: '『東京名所図会』・文京区',
      url: 'https://www.city.bunkyo.lg.jp/b014/p003824.html',
    },
    {
      title: '江戸期の大祭と氏子圏',
      text: '『東京名所図会』所収の由緒書では、寛文年間から享保年間にかけて隔年で盛大な祭礼が行われ、本郷・小石川・丸山・駒込の氏子町から山車や練物が出たとされる。また明治期の氏子は約三千戸と記され、白山神社が広い地域の鎮守として機能していたことがわかる。',
      source: '『東京名所図会』',
    },
    {
      title: '旗櫻',
      text: '『東京名所図会』は、境内の旗櫻について源義家の旗にちなむ複数の伝説を紹介し、明治29年建立の「旗櫻記」も全文掲載する。『江戸名所図会』関連の現地調査では旧木は昭和12年（1937）に枯れ、現在は後継樹と石碑が残るとされている。',
      source: '『東京名所図会』・『江戸名所図会の根津・駒込を歩く』',
      url: 'https://ma-maison.sakura.ne.jp/hill/meishozue/zue_komagome.html',
    },
    {
      title: '現在の白山神社',
      text: '現在も同地に鎮座し、白山神社境内と隣接する白山公園では毎年「文京あじさいまつり」が行われている。2026年の案内では約3,000株の紫陽花が紹介され、富士塚の特別公開なども行われている。',
      source: '文京区',
      url: 'https://www.city.bunkyo.lg.jp/b003/p008243.html',
    },
  ],
}
