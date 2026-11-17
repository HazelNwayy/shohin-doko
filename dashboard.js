/* =========================================================
   dashboard.js  -  Weekly report page for store managers.
   It reads the search records and turns them into numbers,
   bar charts and improvement hints.
   ========================================================= */

function $(id) { return document.getElementById(id); }

const LANG_NAMES = { easy: 'やさしい日本語', ja: '日本語', en: '英語', zh: '中国語', ko: '韓国語' };
let lastSummary = '';

/* ---------- Where the records come from ---------- */

/* Demo data: 30 days of made-up searches, so the page can be shown
   before any real store uses it. Always the same numbers (fixed seed). */
function makeDemoData() {
  let seed = 20261116;
  function rand() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let x = Math.imul(seed ^ seed >>> 15, 1 | seed);
    x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x;
    return ((x ^ x >>> 14) >>> 0) / 4294967296;
  }
  function pick(items) {
    let r = rand(), sum = 0;
    for (const it of items) { sum += it[1]; if (r <= sum) { return it[0]; } }
    return items[items.length - 1][0];
  }
  const products = [['toilet-paper', 0.42], ['digestive', 0.25], ['rope', 0.16], ['', 0.17]];
  const langs = [['ja', 0.58], ['easy', 0.1], ['en', 0.12], ['zh', 0.11], ['ko', 0.09]];
  const hours = [[9, 0.06], [10, 0.12], [11, 0.12], [12, 0.08], [13, 0.06], [14, 0.06],
                 [15, 0.08], [16, 0.12], [17, 0.14], [18, 0.1], [19, 0.06]];
  const unknown = ['乾電池', 'マスク', 'ゴミ袋', 'batteries', '口罩', '乾電池', '건전지', 'マスク'];
  /* How often a shopper presses a feedback button, and how often
     the answer was wrong when they did. */
  const answerRate = 0.45;
  const wrongRate = { 'toilet-paper': 0.04, 'digestive': 0.08, 'rope': 0.3 };

  const out = [];
  const now = new Date();
  for (let d = 29; d >= 0; d--) {
    const count = 25 + Math.floor(rand() * 35);
    for (let i = 0; i < count; i++) {
      const day = new Date(now);
      day.setDate(now.getDate() - d);
      day.setHours(pick(hours), Math.floor(rand() * 60), 0, 0);
      if (day > now) { continue; }
      const lang = pick(langs);
      const pid = pick(products);
      const p = PRODUCTS.find(function (x) { return x.id === pid; });
      const query = p ? p.name[lang] : unknown[Math.floor(rand() * unknown.length)];
      const input = rand() < 0.3 ? 'voice' : 'text';
      const base = { time: day.toISOString(), store: CONFIG.storeId, lang: lang, input: input, query: query };
      out.push(Object.assign({}, base, { type: 'search', productId: pid }));
      if (pid && rand() < answerRate) {
        const wrong = rand() < wrongRate[pid];
        out.push(Object.assign({}, base, { type: wrong ? 'report' : 'found', input: '', productId: pid }));
      }
    }
  }
  return out;
}

function loadBrowserData() {
  try { return JSON.parse(localStorage.getItem('shohinDokoLogs') || '[]'); }
  catch (e) { return []; }
}

function loadSheetData() {
  if (!CONFIG.sheetsUrl) { return Promise.resolve(null); }
  return fetch(CONFIG.sheetsUrl + '?store=' + encodeURIComponent(CONFIG.storeId))
    .then(function (r) { return r.json(); })
    .catch(function () { return null; });
}

/* ---------- Turning records into numbers ---------- */

function filterPeriod(rows, period) {
  if (period === 'all') { return rows; }
  const from = Date.now() - Number(period) * 24 * 60 * 60 * 1000;
  return rows.filter(function (r) { return new Date(r.time).getTime() >= from; });
}

function countBy(rows, keyFn) {
  const m = {};
  rows.forEach(function (r) { const k = keyFn(r); m[k] = (m[k] || 0) + 1; });
  return Object.entries(m).sort(function (a, b) { return b[1] - a[1]; });
}

function productName(id) {
  const p = PRODUCTS.find(function (x) { return x.id === id; });
  return p ? p.name.ja : id;
}

function pct(a, b) { return b ? Math.round(a / b * 100) + '%' : '-'; }

/* ---------- Drawing ---------- */

function bars(container, pairs, warn) {
  if (!pairs.length) { $(container).innerHTML = '<p class="empty">データがありません</p>'; return; }
  const max = pairs[0][1];
  $(container).innerHTML = pairs.map(function (p) {
    const w = Math.max(2, Math.round(p[1] / max * 100));
    return '<div class="bar-row"><span class="name" title="' + escapeHtml(p[0]) + '">' + escapeHtml(p[0]) +
      '</span><div class="bar-track"><div class="bar-fill' + (warn ? ' warn' : '') +
      '" style="width:' + w + '%"></div></div><span class="num">' + p[1] + '</span></div>';
  }).join('');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function render(rows) {
  const period = $('period').value;
  const data = filterPeriod(rows, period);
  const searches = data.filter(function (r) { return r.type === 'search'; });
  const hits = searches.filter(function (r) { return r.productId; });
  const founds = data.filter(function (r) { return r.type === 'found'; });
  const reports = data.filter(function (r) { return r.type === 'report'; });
  const voice = searches.filter(function (r) { return r.input === 'voice'; });
  const answers = founds.length + reports.length;

  $('kSearch').textContent = searches.length;
  $('kFound').textContent = pct(hits.length, searches.length);
  $('kReport').textContent = reports.length;
  $('kVoice').textContent = pct(voice.length, searches.length);

  /* The accuracy rate the store is promised every month.
     It needs enough answers to mean anything. */
  if (answers >= 10) {
    $('kAccuracy').textContent = pct(founds.length, answers);
    $('kAccuracyNote').textContent = 'お客様の回答 ' + answers + '件から算出';
  } else {
    $('kAccuracy').textContent = '-';
    $('kAccuracyNote').textContent = 'お客様の回答が' + answers + '件です。10件以上で表示します。';
  }

  const top = countBy(hits, function (r) { return productName(r.productId); });
  bars('topProducts', top);
  bars('reports', countBy(reports, function (r) { return productName(r.productId); }), true);
  const unmatched = countBy(searches.filter(function (r) { return !r.productId; }),
    function (r) { return r.query || '(空欄)'; }).slice(0, 8);
  bars('unmatched', unmatched, true);
  bars('langs', countBy(searches, function (r) { return LANG_NAMES[r.lang] || r.lang; }));

  const hourCounts = new Array(24).fill(0);
  searches.forEach(function (r) { hourCounts[new Date(r.time).getHours()]++; });
  const hMax = Math.max.apply(null, hourCounts) || 1;
  $('hours').innerHTML = hourCounts.map(function (c, h) {
    return '<div title="' + h + '時台: ' + c + '件" style="height:' + Math.round(c / hMax * 100) + '%"></div>';
  }).join('');

  const tips = makeTips(searches, hits, founds, reports, unmatched, hourCounts);
  $('tips').innerHTML = tips.length
    ? tips.map(function (t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('')
    : '<li class="empty">データが増えると、ここにヒントが表示されます。</li>';

  const periodLabel = $('period').options[$('period').selectedIndex].text;
  lastSummary = [
    '【商品どこ？ 週次レポート】' + STORE.name.ja + '（' + periodLabel + '）',
    '検索回数: ' + searches.length + '件 / 棚位置の正答率: ' +
      (answers >= 10 ? pct(founds.length, answers) : 'データ不足') +
      ' / 「ここにない」報告: ' + reports.length + '件 / 音声検索: ' + pct(voice.length, searches.length),
    'よく検索された商品: ' + top.slice(0, 3).map(function (p) { return p[0] + '（' + p[1] + '件）'; }).join('、'),
    '改善のヒント:'
  ].concat(tips.map(function (t) { return '・' + t; })).join('\n');
}

/* Simple rules that turn the numbers into advice for the store */
function makeTips(searches, hits, founds, reports, unmatched, hourCounts) {
  const tips = [];
  const byProduct = {};
  hits.forEach(function (r) { byProduct[r.productId] = (byProduct[r.productId] || 0) + 1; });
  const reportBy = {};
  reports.forEach(function (r) { reportBy[r.productId] = (reportBy[r.productId] || 0) + 1; });
  const foundBy = {};
  founds.forEach(function (r) { foundBy[r.productId] = (foundBy[r.productId] || 0) + 1; });

  Object.keys(reportBy).forEach(function (id) {
    const p = PRODUCTS.find(function (x) { return x.id === id; });
    if (!p) { return; }
    const answers = (foundBy[id] || 0) + reportBy[id];
    const wrong = answers >= 5 ? Math.round(reportBy[id] / answers * 100) : null;
    if (reportBy[id] >= 3 || (byProduct[id] && reportBy[id] / byProduct[id] >= 0.05)) {
      tips.push(p.name.ja + '：「ここにない」報告が' + reportBy[id] + '件' +
        (wrong !== null ? '（回答の' + wrong + '%）' : '') + 'あります。' +
        p.aisle + '番通路の棚と、データの位置が合っているか確認してください。');
    }
  });

  unmatched.slice(0, 3).forEach(function (u) {
    if (u[1] >= 3) {
      tips.push('「' + u[0] + '」が' + u[1] + '回検索されましたが、登録された商品がありません。' +
        '取り扱いの有無を確認するか、言い換えの言葉に追加してください。');
    }
  });

  const topId = Object.keys(byProduct).sort(function (a, b) { return byProduct[b] - byProduct[a]; })[0];
  const topP = PRODUCTS.find(function (x) { return x.id === topId; });
  if (topP && topP.aisle >= 4) {
    tips.push(topP.name.ja + 'は最もよく探される商品ですが、入口から遠い' + topP.aisle +
      '番通路にあります。入口付近やエンド（棚の端）に一部を置くことを試す価値があります。');
  }

  const other = searches.filter(function (r) { return r.lang !== 'ja'; }).length;
  if (searches.length && other / searches.length >= 0.2) {
    tips.push('日本語以外（やさしい日本語を含む）での検索が' + pct(other, searches.length) +
      'あります。よく探される商品の売り場表示に、英語・中国語・韓国語を加えることを検討できます。');
  }

  const peak = hourCounts.indexOf(Math.max.apply(null, hourCounts));
  if (searches.length) {
    tips.push('検索が最も多いのは' + peak + '時台です。この時間の前に、よく探される商品の品出しを済ませておくと効果的です。');
  }
  return tips;
}

/* ---------- Start ---------- */

function refresh() {
  const source = $('source').value;
  if (source === 'demo') {
    $('sourceNote').textContent = 'デモデータを表示しています（実際の店舗のデータではありません）。';
    render(makeDemoData());
  } else if (source === 'browser') {
    $('sourceNote').textContent = 'このブラウザで行った検索の記録を表示しています。';
    render(loadBrowserData());
  } else {
    if (!CONFIG.sheetsUrl) {
      $('sourceNote').textContent = 'GoogleスプレッドシートのURLが未設定です（js/data.js の sheetsUrl）。';
      render([]);
      return;
    }
    $('sourceNote').textContent = '読み込み中...';
    loadSheetData().then(function (rows) {
      $('sourceNote').textContent = rows ? 'Googleスプレッドシートのデータを表示しています。' : '読み込みに失敗しました。';
      render(rows || []);
    });
  }
}

requireStaffLogin(function () {
  $('dashMain').hidden = false;
  $('storeName').textContent = STORE.name.ja;
  $('source').addEventListener('change', refresh);
  $('period').addEventListener('change', refresh);
  $('logoutBtn').addEventListener('click', staffLogout);
  $('copyBtn').addEventListener('click', function () {
    const done = function () { $('copyStatus').textContent = '週次サマリーをコピーしました。メールやLINEに貼り付けられます。'; };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(lastSummary).then(done, function () { window.prompt('コピーしてください', lastSummary); });
    } else {
      window.prompt('コピーしてください', lastSummary);
    }
  });
  refresh();
});
