/* =========================================================
   app.js  -  How the shopper page works.
   1. Language buttons   2. Search   3. Voice input
   4. Result and map     5. Read aloud   6. Feedback buttons
   7. Today's pick       8. Records for the dashboard
   ========================================================= */

let lang = loadSetting('shohinDokoLang') || 'ja';
let currentProduct = null;

/* ---------- Small helpers ---------- */

function $(id) { return document.getElementById(id); }

function loadSetting(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function saveSetting(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
}
function t() { return TEXT[lang]; }
function langInfo() { return LANGS.find(function (l) { return l.code === lang; }); }

/* Make text easy to compare:
   full-width to half-width, lower case, katakana to hiragana,
   and remove spaces and punctuation. */
function normalize(text) {
  let s = (text || '').normalize('NFKC').toLowerCase();
  s = s.replace(/[ァ-ヶ]/g, function (ch) {
    return String.fromCharCode(ch.charCodeAt(0) - 0x60);
  });
  s = s.replace(/[\s　.,!?、。・「」()（）'"]/g, '');
  return s;
}

/* ---------- 1. Language ---------- */

function buildLanguageButtons() {
  const box = $('langButtons');
  box.innerHTML = '';
  LANGS.forEach(function (l) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lang-btn' + (l.code === lang ? ' active' : '');
    b.textContent = l.label;
    b.addEventListener('click', function () { setLanguage(l.code); });
    box.appendChild(b);
  });
}

function setLanguage(code) {
  lang = code;
  saveSetting('shohinDokoLang', code);
  document.documentElement.lang =
    code === 'easy' ? 'ja' : code === 'zh' ? 'zh-CN' : code;
  buildLanguageButtons();
  applyTexts();
  showPick();
  if (currentProduct) { showResult(currentProduct); }
  if (!$('noMatch').hidden) { $('noMatch').textContent = t().noMatch; }
}

function applyTexts() {
  $('storeName').textContent = STORE.name[lang];
  $('langLabel').textContent = t().language;
  $('tagline').textContent = t().tagline;
  $('searchInput').placeholder = t().placeholder;
  $('searchBtn').textContent = t().search;
  $('voiceText').textContent = t().speak;
  $('examplesTitle').textContent = t().examples;
  $('resultTitle').textContent = t().resultTitle;
  $('mapTitle').textContent = t().map;
  $('readBtn').textContent = t().readAloud;
  $('foundBtn').textContent = t().foundIt;
  $('reportBtn').textContent = t().notHere;
  $('status').textContent = '';

  const chips = $('chips');
  chips.innerHTML = '';
  PRODUCTS.forEach(function (p) {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'chip';
    c.textContent = p.name[lang];
    c.addEventListener('click', function () {
      $('searchInput').value = p.name[lang];
      runSearch(p.name[lang], 'example');
    });
    chips.appendChild(c);
  });
}

/* ---------- 7. Today's pick from the manager ---------- */

function showPick() {
  const pick = getPick();
  const card = $('pickCard');
  const product = PRODUCTS.find(function (p) { return p.id === pick.productId; });
  if (!pick.on || !product) { card.hidden = true; return; }

  $('pickTitle').textContent = t().pickTitle;
  $('pickName').textContent = product.name[lang];
  $('pickMessage').textContent = pick.message || '';
  $('pickMessage').hidden = !pick.message;
  $('pickWhere').textContent =
    t().aisle(product.aisle) + ' / ' + t().side[product.side] + ' / ' + t().shelf[product.shelf];
  card.hidden = false;

  $('pickBtn').onclick = function () {
    $('searchInput').value = product.name[lang];
    runSearch(product.name[lang], 'pick');
  };
}

/* ---------- 2. Search ---------- */

function findProduct(query) {
  const q = normalize(query);
  if (!q) { return null; }
  let best = null;
  let bestScore = 0;
  PRODUCTS.forEach(function (p) {
    const words = p.keywords.concat(Object.values(p.name));
    words.forEach(function (w) {
      const k = normalize(w);
      if (!k) { return; }
      let score = 0;
      if (q === k) {
        score = 100 + k.length;
      } else if (k.length >= 2 && q.indexOf(k) !== -1) {
        score = k.length;
      } else if (q.length >= 2 && k.indexOf(q) !== -1) {
        score = q.length;
      }
      if (score > bestScore) { bestScore = score; best = p; }
    });
  });
  return best;
}

function runSearch(query, inputType) {
  const product = findProduct(query);
  resetFeedback();
  if (product) {
    currentProduct = product;
    $('noMatch').hidden = true;
    showResult(product);
    $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    currentProduct = null;
    $('result').hidden = true;
    $('noMatch').textContent = t().noMatch;
    $('noMatch').hidden = false;
  }
  logEvent('search', query, inputType, product ? product.id : '');
}

/* ---------- 4. Result and map ---------- */

function showResult(p) {
  const tx = t();
  $('resultName').textContent = p.name[lang];
  $('resultLocation').innerHTML =
    '<span class="aisle">' + tx.aisle(p.aisle) + '</span>' +
    '<span class="where">' + tx.side[p.side] + ' / ' + tx.shelf[p.shelf] + '</span>';
  $('resultMeta').textContent =
    tx.section + ': ' + SECTIONS[p.section][lang] + '   ' +
    tx.checked + ': ' + p.lastChecked;
  $('map').innerHTML = buildMap(p);
  $('result').hidden = false;
}

/* Draws a simple floor plan. Aisle n is the walkway between shelf n-1 and shelf n. */
function buildMap(p) {
  const tx = t();
  const n = STORE.aisles;
  const shelfW = 14, laneW = 36, left = 20, top = 34, height = 120;
  let svg = '<svg viewBox="0 0 ' + (left * 2 + (n + 1) * shelfW + n * laneW) +
    ' 230" role="img" aria-label="' + tx.map + '">';

  for (let i = 0; i <= n; i++) {
    const x = left + i * (shelfW + laneW);
    const isTarget = (p.side === 'left' && i === p.aisle - 1) ||
                     (p.side === 'right' && i === p.aisle);
    svg += '<rect x="' + x + '" y="' + top + '" width="' + shelfW + '" height="' + height +
      '" rx="3" class="' + (isTarget ? 'shelf target' : 'shelf') + '"/>';
  }
  for (let a = 1; a <= n; a++) {
    const x = left + a * shelfW + (a - 1) * laneW;
    const active = a === p.aisle;
    if (active) {
      svg += '<rect x="' + x + '" y="' + top + '" width="' + laneW + '" height="' + height +
        '" class="lane-active"/>';
    }
    svg += '<text x="' + (x + laneW / 2) + '" y="' + (top - 10) +
      '" class="' + (active ? 'lane-label active' : 'lane-label') + '">' + a + '</text>';
    if (active) {
      const dotX = p.side === 'left' ? x + 9 : x + laneW - 9;
      svg += '<circle cx="' + dotX + '" cy="' + (top + height / 2) + '" r="8" class="dot"/>';
    }
  }
  const bottomY = top + height + 26;
  svg += '<rect x="' + left + '" y="' + bottomY + '" width="110" height="36" rx="6" class="area"/>';
  svg += '<text x="' + (left + 55) + '" y="' + (bottomY + 23) + '" class="area-label">' + tx.entrance + '</text>';
  const regX = left + (n + 1) * shelfW + n * laneW - 110;
  svg += '<rect x="' + regX + '" y="' + bottomY + '" width="110" height="36" rx="6" class="area"/>';
  svg += '<text x="' + (regX + 55) + '" y="' + (bottomY + 23) + '" class="area-label">' + tx.register + '</text>';
  svg += '</svg>';
  return svg;
}

/* ---------- 3. Voice input ---------- */

const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognizer = null;
let listening = false;

function startVoice() {
  if (!SpeechRec) {
    $('status').textContent = t().noSpeech;
    return;
  }
  if (listening && recognizer) { recognizer.stop(); return; }

  recognizer = new SpeechRec();
  recognizer.lang = langInfo().speech;
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;

  recognizer.onstart = function () {
    listening = true;
    $('voiceBtn').classList.add('listening');
    $('status').textContent = t().listening;
  };
  recognizer.onresult = function (event) {
    const said = event.results[0][0].transcript.replace(/[。．.]$/, '');
    $('searchInput').value = said;
    $('status').textContent = '';
    runSearch(said, 'voice');
  };
  recognizer.onerror = function (event) {
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      $('status').textContent = t().micDenied;
    } else {
      $('status').textContent = '';
    }
  };
  recognizer.onend = function () {
    listening = false;
    $('voiceBtn').classList.remove('listening');
    if ($('status').textContent === t().listening) { $('status').textContent = ''; }
  };
  recognizer.start();
}

/* ---------- 5. Read aloud ---------- */

function readAloud() {
  if (!currentProduct || !('speechSynthesis' in window)) { return; }
  const p = currentProduct;
  const tx = t();
  const sentence = tx.sentence(p.name[lang], tx.aisle(p.aisle), tx.side[p.side], tx.shelf[p.shelf]);
  const voice = new SpeechSynthesisUtterance(sentence);
  voice.lang = langInfo().speech;
  voice.rate = lang === 'easy' ? 0.85 : 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(voice);
}

/* ---------- 6. Feedback buttons ----------
   "Found it" and "Not here" together give the real accuracy rate
   that the dashboard reports to the store. */

function resetFeedback() {
  $('feedbackMsg').hidden = true;
  $('foundBtn').disabled = false;
  $('reportBtn').disabled = false;
}

function sendFeedback(type) {
  if (!currentProduct) { return; }
  logEvent(type, $('searchInput').value, '', currentProduct.id);
  $('feedbackMsg').textContent = type === 'found' ? t().foundThanks : t().thanks;
  $('feedbackMsg').className = type === 'found' ? 'feedback good' : 'feedback warn';
  $('feedbackMsg').hidden = false;
  $('foundBtn').disabled = true;
  $('reportBtn').disabled = true;
}

/* ---------- 8. Records for the dashboard ----------
   Only anonymous data is saved: time, language, words searched,
   which product was found, and the feedback buttons.
   No names, no login. */

function logEvent(type, query, inputType, productId) {
  const record = {
    time: new Date().toISOString(),
    store: CONFIG.storeId,
    type: type,                 // 'search', 'found' or 'report'
    lang: lang,
    input: inputType || '',     // 'text', 'voice', 'example' or 'pick'
    query: query || '',
    productId: productId || ''  // empty means not found
  };
  try {
    const list = JSON.parse(localStorage.getItem('shohinDokoLogs') || '[]');
    list.push(record);
    while (list.length > 3000) { list.shift(); }
    localStorage.setItem('shohinDokoLogs', JSON.stringify(list));
  } catch (e) { /* storage not available */ }

  if (CONFIG.sheetsUrl) {
    fetch(CONFIG.sheetsUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(record)
    }).catch(function () { /* offline: skip */ });
  }
}

/* ---------- Start ---------- */

$('searchForm').addEventListener('submit', function (e) {
  e.preventDefault();
  runSearch($('searchInput').value, 'text');
});
$('voiceBtn').addEventListener('click', startVoice);
$('readBtn').addEventListener('click', readAloud);
$('foundBtn').addEventListener('click', function () { sendFeedback('found'); });
$('reportBtn').addEventListener('click', function () { sendFeedback('report'); });

setLanguage(LANGS.some(function (l) { return l.code === lang; }) ? lang : 'ja');
