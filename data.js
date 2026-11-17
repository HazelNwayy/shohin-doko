/* =========================================================
   data.js  -  All the information the website uses.
   To add or change a product, edit the PRODUCTS list below.
   ========================================================= */

/* Settings
   sheetsUrl: paste your Google Apps Script web app URL here
   (see README, Step 7). Leave it empty ('') to keep the search
   records only in this browser.
   staffPassword: the word staff type to open the staff page and
   the dashboard. Change it before you show the site to anyone.
   NOTE: this is a demo gate, not real security. See README. */
const CONFIG = {
  storeId: 'demo-beppu',
  sheetsUrl: '',
  staffPassword: 'tencho2026'
};

/* The store shown on the page (a demo store, not a real one) */
const STORE = {
  name: {
    easy: 'デモスーパー べっぷてん',
    ja:   'デモスーパー 別府店',
    en:   'Demo Supermarket Beppu',
    zh:   '演示超市 别府店',
    ko:   '데모 슈퍼 벳푸점'
  },
  aisles: 6
};

/* Languages. "speech" is the code the browser uses for voice. */
const LANGS = [
  { code: 'easy', label: 'やさしい にほんご', speech: 'ja-JP' },
  { code: 'ja',   label: '日本語',           speech: 'ja-JP' },
  { code: 'en',   label: 'English',          speech: 'en-US' },
  { code: 'zh',   label: '中文',             speech: 'zh-CN' },
  { code: 'ko',   label: '한국어',           speech: 'ko-KR' }
];

/* Sections of the store */
const SECTIONS = {
  daily: {
    easy: 'せいかつで つかう もの', ja: '日用品', en: 'Household goods',
    zh: '日用品', ko: '생활용품'
  },
  medicine: {
    easy: 'くすり', ja: '医薬品', en: 'Medicine',
    zh: '药品', ko: '의약품'
  },
  tools: {
    easy: 'どうぐ・にわの もの', ja: '日用品・園芸', en: 'Tools and garden',
    zh: '工具・园艺', ko: '공구・원예'
  }
};

/* Products
   aisle: aisle number (1 to 6)
   side:  'left' or 'right' (as seen when you walk in from the entrance side)
   shelf: 'top', 'middle' or 'bottom'
   keywords: every word a shopper might say or type, in any language.
             Add more words here when people cannot find a product. */
const PRODUCTS = [
  {
    id: 'toilet-paper',
    name: {
      easy: 'トイレットペーパー', ja: 'トイレットペーパー', en: 'Toilet paper',
      zh: '卫生纸', ko: '화장지'
    },
    aisle: 6, side: 'left', shelf: 'bottom', section: 'daily',
    lastChecked: '2026-11-14',
    keywords: [
      'トイレットペーパー', 'トイレットペーパ', 'トイレの紙', 'トイレ紙', 'ちり紙',
      'toilet paper', 'toiletpaper', 'toilet roll', 'toilet tissue', 'tissue',
      '卫生纸', '卫生卷纸', '厕纸', '衛生紙', '手纸',
      '화장지', '휴지', '두루마리 휴지', '두루마리'
    ]
  },
  {
    id: 'digestive',
    name: {
      easy: 'おなかの くすり', ja: '胃腸薬', en: 'Digestive aid',
      zh: '肠胃药', ko: '소화제'
    },
    aisle: 1, side: 'right', shelf: 'middle', section: 'medicine',
    lastChecked: '2026-11-14',
    keywords: [
      '胃腸薬', 'いちょうやく', '胃薬', 'いぐすり', '消化剤', '整腸剤', '胃腸',
      'おなかのくすり', 'お腹の薬', 'おなか', '腹痛', '胸焼け', '胃もたれ',
      'digestive', 'digestive aid', 'antacid', 'stomach medicine', 'stomach',
      'indigestion', 'heartburn',
      '肠胃药', '胃药', '消化药', '肠胃', '胃藥', '腸胃藥',
      '소화제', '위장약', '소화약', '위장', '배탈약'
    ]
  },
  {
    id: 'rope',
    name: {
      easy: 'ロープ（ひも）', ja: 'ロープ', en: 'Rope',
      zh: '绳子', ko: '로프'
    },
    aisle: 5, side: 'right', shelf: 'top', section: 'tools',
    lastChecked: '2026-11-14',
    keywords: [
      'ロープ', 'ひも', '紐', '縄', 'なわ', '荷造りひも', '荷造り紐', 'ビニールひも',
      'rope', 'string', 'cord', 'twine',
      '绳子', '绳', '绳索', '繩子',
      '로프', '밧줄', '끈', '노끈'
    ]
  }
];

/* "Today's pick from the manager" when staff have not set one yet.
   Staff change this on the staff page (staff.html). */
const DEFAULT_PICK = {
  on: false,
  productId: 'digestive',
  message: ''
};

/* Words shown on the page, in each language */
const TEXT = {
  easy: {
    tagline: 'しょうひんの なまえを かいてください。はなしても さがせます。',
    placeholder: 'れい：トイレットペーパー',
    search: 'さがす',
    speak: 'はなして さがす',
    listening: 'きいています。しょうひんの なまえを いってください。',
    noSpeech: 'この ブラウザでは こえで さがせません。もじで かいてください。',
    micDenied: 'マイクが つかえません。ブラウザの せっていを みてください。',
    examples: 'よく さがされる しょうひん',
    resultTitle: 'うりばの ばしょ',
    aisle: function (n) { return n + 'ばん つうろ'; },
    side: { left: 'ひだりがわ', right: 'みぎがわ' },
    shelf: { top: 'うえの だん', middle: 'まんなかの だん', bottom: 'したの だん' },
    section: 'うりば',
    checked: 'さいごに たしかめた ひ',
    readAloud: 'こえで きく',
    foundIt: 'ありました',
    foundThanks: 'よかったです。おしえて くれて ありがとう ございます。',
    notHere: 'ここに ありませんでした',
    thanks: 'おしえて くれて ありがとう ございます。ちかくの てんいんに きいて ください。',
    noMatch: 'みつかりませんでした。ほかの ことばで さがすか、てんいんに きいて ください。',
    language: 'ことば',
    map: 'みせの ちず',
    entrance: 'いりぐち',
    register: 'レジ',
    pickTitle: 'きょうの てんちょうの おすすめ',
    sentence: function (name, aisle, side, shelf) {
      return name + 'は、' + aisle + 'の ' + side + '、' + shelf + 'に あります。';
    }
  },
  ja: {
    tagline: '商品名を入力するか、話しかけてください。',
    placeholder: '例：トイレットペーパー',
    search: '検索',
    speak: '話して検索',
    listening: '聞いています。商品名をお話しください。',
    noSpeech: 'このブラウザは音声入力に対応していません。文字で入力してください。',
    micDenied: 'マイクの使用が許可されていません。ブラウザの設定をご確認ください。',
    examples: 'よく探される商品',
    resultTitle: '売り場の場所',
    aisle: function (n) { return n + '番通路'; },
    side: { left: '左側', right: '右側' },
    shelf: { top: '上段', middle: '中段', bottom: '下段' },
    section: '売り場',
    checked: '最終確認日',
    readAloud: '読み上げる',
    foundIt: 'ありました',
    foundThanks: 'ありがとうございます。またご利用ください。',
    notHere: 'ここにありませんでした',
    thanks: 'ご報告ありがとうございます。お近くの店員にお尋ねください。',
    noMatch: '商品が見つかりませんでした。別の言葉で試すか、店員にお尋ねください。',
    language: '言語',
    map: '店内マップ',
    entrance: '入口',
    register: 'レジ',
    pickTitle: '今日の店長のおすすめ',
    sentence: function (name, aisle, side, shelf) {
      return name + 'は、' + aisle + 'の' + side + '、' + shelf + 'にあります。';
    }
  },
  en: {
    tagline: 'Type a product name, or just speak.',
    placeholder: 'e.g. toilet paper',
    search: 'Search',
    speak: 'Speak to search',
    listening: 'Listening. Please say the product name.',
    noSpeech: 'This browser does not support voice input. Please type instead.',
    micDenied: 'Microphone access is blocked. Please check your browser settings.',
    examples: 'Popular items',
    resultTitle: 'Location',
    aisle: function (n) { return 'Aisle ' + n; },
    side: { left: 'left side', right: 'right side' },
    shelf: { top: 'top shelf', middle: 'middle shelf', bottom: 'bottom shelf' },
    section: 'Section',
    checked: 'Last checked',
    readAloud: 'Read aloud',
    foundIt: 'Found it',
    foundThanks: 'Thank you for letting us know.',
    notHere: 'Not here',
    thanks: 'Thank you for letting us know. Please ask a nearby staff member.',
    noMatch: 'No product found. Try another word, or ask a staff member.',
    language: 'Language',
    map: 'Store map',
    entrance: 'Entrance',
    register: 'Checkout',
    pickTitle: "Today's pick from the manager",
    sentence: function (name, aisle, side, shelf) {
      return name + ' is in ' + aisle + ', ' + side + ', ' + shelf + '.';
    }
  },
  zh: {
    tagline: '请输入商品名称，或直接说话。',
    placeholder: '例：卫生纸',
    search: '搜索',
    speak: '语音搜索',
    listening: '正在听，请说出商品名称。',
    noSpeech: '此浏览器不支持语音输入，请用文字输入。',
    micDenied: '麦克风未被允许使用，请检查浏览器设置。',
    examples: '常用商品',
    resultTitle: '货架位置',
    aisle: function (n) { return n + '号通道'; },
    side: { left: '左侧', right: '右侧' },
    shelf: { top: '上层', middle: '中层', bottom: '下层' },
    section: '区域',
    checked: '最后确认',
    readAloud: '朗读',
    foundIt: '找到了',
    foundThanks: '感谢您的反馈。',
    notHere: '这里没有',
    thanks: '感谢您的反馈。请询问附近的店员。',
    noMatch: '未找到商品。请换个词搜索，或询问店员。',
    language: '语言',
    map: '店内地图',
    entrance: '入口',
    register: '收银台',
    pickTitle: '今日店长推荐',
    sentence: function (name, aisle, side, shelf) {
      return name + '在' + aisle + '，' + side + '，' + shelf + '。';
    }
  },
  ko: {
    tagline: '상품명을 입력하거나 말해 주세요.',
    placeholder: '예: 화장지',
    search: '검색',
    speak: '음성 검색',
    listening: '듣고 있습니다. 상품명을 말해 주세요.',
    noSpeech: '이 브라우저는 음성 입력을 지원하지 않습니다. 글자로 입력해 주세요.',
    micDenied: '마이크 사용이 허용되지 않았습니다. 브라우저 설정을 확인해 주세요.',
    examples: '자주 찾는 상품',
    resultTitle: '진열 위치',
    aisle: function (n) { return n + '번 통로'; },
    side: { left: '왼쪽', right: '오른쪽' },
    shelf: { top: '위 칸', middle: '가운데 칸', bottom: '아래 칸' },
    section: '코너',
    checked: '마지막 확인',
    readAloud: '읽어 주기',
    foundIt: '찾았어요',
    foundThanks: '알려 주셔서 감사합니다.',
    notHere: '여기에 없어요',
    thanks: '알려 주셔서 감사합니다. 가까운 직원에게 문의해 주세요.',
    noMatch: '상품을 찾지 못했습니다. 다른 단어로 검색하거나 직원에게 문의해 주세요.',
    language: '언어',
    map: '매장 지도',
    entrance: '입구',
    register: '계산대',
    pickTitle: '오늘의 점장 추천',
    sentence: function (name, aisle, side, shelf) {
      return name + '은(는) ' + aisle + ' ' + side + ' ' + shelf + '에 있습니다.';
    }
  }
};

/* =========================================================
   Shared helpers used by more than one page
   ========================================================= */

/* Staff can change where a product is, on the staff page.
   Those changes are saved in this browser and applied here. */
function applyStaffEdits() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem('shohinDokoEdits') || 'null'); }
  catch (e) { saved = null; }
  if (!saved) { return; }
  PRODUCTS.forEach(function (p) {
    const edit = saved[p.id];
    if (!edit) { return; }
    if (edit.aisle) { p.aisle = Number(edit.aisle); }
    if (edit.side) { p.side = edit.side; }
    if (edit.shelf) { p.shelf = edit.shelf; }
    if (edit.lastChecked) { p.lastChecked = edit.lastChecked; }
  });
}

/* The manager's pick, as set on the staff page */
function getPick() {
  try {
    const saved = JSON.parse(localStorage.getItem('shohinDokoPick') || 'null');
    if (saved) { return saved; }
  } catch (e) { /* ignore */ }
  return DEFAULT_PICK;
}

applyStaffEdits();
