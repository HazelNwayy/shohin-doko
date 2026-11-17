/* =========================================================
   Code.gs  -  Google Apps Script for the Google Sheet.
   It does three things:
   1. doPost: saves each search from the website as a new row.
   2. doGet: sends the rows to the dashboard page.
   3. weeklyReport: emails a summary to the store manager every week.
   See README, Step 7, for how to set it up.
   ========================================================= */

const SHEET_NAME = 'logs';
const REPORT_EMAIL = 'your-email@example.com';   // change to the store manager's email
const STORE_NAME = 'デモスーパー 別府店';

const PRODUCT_NAMES = {
  'toilet-paper': 'トイレットペーパー',
  'digestive': '胃腸薬',
  'rope': 'ロープ'
};

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['time', 'store', 'type', 'lang', 'input', 'query', 'productId']);
  }
  return sheet;
}

/* 1. Save one record sent from the website */
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  getSheet_().appendRow([
    d.time || new Date().toISOString(),
    String(d.store || '').slice(0, 50),
    String(d.type || '').slice(0, 20),
    String(d.lang || '').slice(0, 10),
    String(d.input || '').slice(0, 20),
    String(d.query || '').slice(0, 100),
    String(d.productId || '').slice(0, 50)
  ]);
  return ContentService.createTextOutput('ok');
}

/* 2. Give the records to the dashboard page */
function doGet(e) {
  const store = e && e.parameter && e.parameter.store;
  const rows = readRows_().filter(function (r) { return !store || r.store === store; });
  return ContentService.createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}

function readRows_() {
  const values = getSheet_().getDataRange().getValues();
  const head = values.shift();
  return values.map(function (v) {
    const r = {};
    head.forEach(function (h, i) { r[h] = v[i] instanceof Date ? v[i].toISOString() : String(v[i]); });
    return r;
  });
}

/* 3. Weekly email to the store manager */
function weeklyReport() {
  const from = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const rows = readRows_().filter(function (r) { return new Date(r.time).getTime() >= from; });
  const searches = rows.filter(function (r) { return r.type === 'search'; });
  const hits = searches.filter(function (r) { return r.productId; });
  const founds = rows.filter(function (r) { return r.type === 'found'; });
  const reports = rows.filter(function (r) { return r.type === 'report'; });
  const answers = founds.length + reports.length;

  function top(list, keyFn, n) {
    const m = {};
    list.forEach(function (r) { const k = keyFn(r); m[k] = (m[k] || 0) + 1; });
    return Object.keys(m).map(function (k) { return [k, m[k]]; })
      .sort(function (a, b) { return b[1] - a[1]; }).slice(0, n);
  }
  function li(pairs) {
    if (!pairs.length) { return '<li>なし</li>'; }
    return pairs.map(function (p) { return '<li>' + p[0] + '：' + p[1] + '件</li>'; }).join('');
  }
  const hitRate = searches.length ? Math.round(hits.length / searches.length * 100) + '%' : '-';
  const accuracy = answers >= 10 ? Math.round(founds.length / answers * 100) + '%' : 'データ不足';

  const html =
    '<h2>商品どこ？ 週次レポート（' + STORE_NAME + '）</h2>' +
    '<p>過去7日間の検索回数：<b>' + searches.length + '件</b>／検索ヒット率：<b>' + hitRate + '</b></p>' +
    '<p>棚位置の正答率：<b>' + accuracy + '</b>（お客様の回答 ' + answers + '件）／' +
    '「ここにない」報告：<b>' + reports.length + '件</b></p>' +
    '<h3>よく検索された商品</h3><ul>' + li(top(hits, function (r) { return PRODUCT_NAMES[r.productId] || r.productId; }, 5)) + '</ul>' +
    '<h3>「ここにない」報告があった商品（棚の確認をお願いします）</h3><ul>' +
      li(top(reports, function (r) { return PRODUCT_NAMES[r.productId] || r.productId; }, 5)) + '</ul>' +
    '<h3>登録がなく見つからなかった言葉（取り扱いの検討に）</h3><ul>' +
      li(top(searches.filter(function (r) { return !r.productId; }), function (r) { return r.query; }, 5)) + '</ul>' +
    '<p style="color:#666;font-size:12px">このメールは自動で送信されています。</p>';

  MailApp.sendEmail({
    to: REPORT_EMAIL,
    subject: '【商品どこ？】週次レポート ' + STORE_NAME,
    htmlBody: html
  });
}

/* Run this ONE time to send weeklyReport every Monday around 8:00 */
function createWeeklyTrigger() {
  ScriptApp.newTrigger('weeklyReport')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8)
    .create();
}
