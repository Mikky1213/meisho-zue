import type { CurrentPlace } from '../currentPlaces'
import { tokyoMeishoZue4512 } from './4512TokyoMeishoZue'

export const meisho4512: CurrentPlace = {
  currentName: '猫貍橋跡（猫又橋跡）',

  address: '東京都文京区千石3-13-14付近',

  description:
    '『江戸名所図会』に描かれた猫貍橋（猫又橋）の跡。簸川神社の西方を流れていた小石川（千川）に架かっていた。川は昭和9年（1934）に暗渠化され、橋は撤去されたが、現在も猫又坂の坂下付近に橋の袖石が保存され、「猫又橋際」の名称も残る。',

  translation: [
    {
      title: '現代語訳',
      text: `猫貍橋は、氷川明神社の西の方にあり、小石川の流れに架かっている。

『南向亭茶話』には、昔、大木の根の股になった部分を橋の代わりにして架けたため、この名がついたと記されている。

考えてみると、東国の人々は木の根を「根っ子」と呼ぶので、この説はもっともであろう。

また、神田松下町の小路を俗に「ねこや新道」と呼ぶのも、材木屋が多く住み、木の根の部分を売る家が多かったため、そのように呼ばれたのである。`,
    },
  ],

  photos: [
    {
      url: 'https://ma-maison.sakura.ne.jp/hill/meishozue/zue_koishikawa/109nekomatabashi_photo.jpg',
      caption: '現在の猫貍橋跡',
      alt: '東京都文京区千石の猫貍橋跡',
      credit: '「江戸名所図会の小石川を歩く」',
      sourceUrl: 'https://ma-maison.sakura.ne.jp/hill/meishozue/zue_koishikawa.html',
    },
    {
      url: 'https://ma-maison.sakura.ne.jp/hill/meishozue/zue_koishikawa/109nekomatabashi_oyabashira.jpg',
      caption: '保存されている猫又橋親柱の袖石',
      alt: '猫又橋跡に保存されている親柱の袖石',
      credit: '「江戸名所図会の小石川を歩く」',
      sourceUrl: 'https://ma-maison.sakura.ne.jp/hill/meishozue/zue_koishikawa.html',
    },
  ],

  documents: tokyoMeishoZue4512,

  comparison: [
    {
      title: '小石川の橋から暗渠上の道路へ',
      text: '『江戸名所図会』では、猫貍橋は氷川明神社の西を流れる小石川に架かる橋として描かれる。現在、この流れは暗渠となって道路下を通り、橋そのものは失われている。',
      source: '『江戸名所図会』・文京区',
      url: 'https://www.city.bunkyo.lg.jp/b011/p001251.html',
    },
    {
      title: '「猫又橋際」の名が残る',
      text: '橋は撤去されたが、文京区の施設名には現在も「猫又橋際公衆便所」が残り、所在地は千石3丁目13番14号である。猫又橋があった場所を示す現在の目印の一つとなっている。',
      source: '文京区「公園集会所、公衆トイレ等の案内」',
      url: 'https://www.city.bunkyo.lg.jp/b036/p004913.html',
    },
    {
      title: '木橋・石橋・コンクリート橋',
      text: '江戸期には木の根の股を利用した橋に由来するという説が語られ、『東京名所図会』の時代にはすでに石橋へ架け替えられていた。その後、大正7年（1918）にコンクリート橋となり、昭和9年（1934）の千川暗渠化に伴って撤去された。',
      source: '『東京名所図会』・「江戸名所図会の小石川を歩く」',
      url: 'https://ma-maison.sakura.ne.jp/hill/meishozue/zue_koishikawa.html',
    },
    {
      title: '妖怪説と「根っ子」説',
      text: '『続江戸砂子』は、白い獣を狸と思って逃げた道心者が川へ落ちたという怪異譚を伝える。一方、『南向茶話』は木の根の股を橋にしたため「根子股橋」と呼ばれたという農民の説を記し、『江戸名所図会』は後者をもっともな説として採っている。',
      source: '『東京名所図会』所引『続江戸砂子』『南向茶話』・『江戸名所図会』',
    },
    {
      title: '猫又坂',
      text: '現在、不忍通りが千石二丁目と三丁目の間を下る坂は猫又坂（猫貍坂・猫股坂）と呼ばれる。橋がなくなった後も、その名は坂名として残っている。',
      source: '文京区「景観に関する基礎調査」',
      url: 'https://www.city.bunkyo.lg.jp/documents/4404/sankousiryou1.pdf',
    },
  ],
}
