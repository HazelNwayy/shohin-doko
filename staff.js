/* =========================================================
   staff.js  -  The store staff page.
   1. Password screen (see auth.js)
   2. Change where a product is
   3. Set today's pick from the manager

   This page is in Japanese only, because store staff in Oita
   work in Japanese. The shopper page stays in 5 languages.
   ========================================================= */

function $(id) { return document.getElementById(id); }

const SIDES = { left: '左側', right: '右側' };
const SHELVES = { top: '上段', middle: '中段', bottom: '下段' };

function today() {
  const d = new Date();
  const two = function (n) { return (n < 10 ? '0' : '') + n; };
  return d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate());
}

/* ---------- 2. Change where a product is ---------- */

function buildEditList() {
  const box = $('editList');
  box.innerHTML = '';
  PRODUCTS.forEach(function (p) {
    const row = document.createElement('div');
    row.className = 'edit-row';

    let aisleOptions = '';
    for (let a = 1; a <= STORE.aisles; a++) {
      aisleOptions += '<option value="' + a + '"' +
        (p.aisle === a ? ' selected' : '') + '>' + a + '番通路</option>';
    }
    let sideOptions = '';
    Object.keys(SIDES).forEach(function (k) {
      sideOptions += '<option value="' + k + '"' +
        (p.side === k ? ' selected' : '') + '>' + SIDES[k] + '</option>';
    });
    let shelfOptions = '';
    Object.keys(SHELVES).forEach(function (k) {
      shelfOptions += '<option value="' + k + '"' +
        (p.shelf === k ? ' selected' : '') + '>' + SHELVES[k] + '</option>';
    });

    row.innerHTML =
      '<div class="edit-name">' + p.name.ja + '</div>' +
      '<div class="edit-selects">' +
        '<select data-id="' + p.id + '" data-field="aisle" aria-label="通路">' + aisleOptions + '</select>' +
        '<select data-id="' + p.id + '" data-field="side" aria-label="左右">' + sideOptions + '</select>' +
        '<select data-id="' + p.id + '" data-field="shelf" aria-label="段">' + shelfOptions + '</select>' +
      '</div>' +
      '<div class="edit-checked">最終確認日: ' + p.lastChecked + '</div>';
    box.appendChild(row);
  });
}

function saveEdits() {
  const edits = {};
  let changed = 0;

  PRODUCTS.forEach(function (p) {
    const get = function (field) {
      return document.querySelector('select[data-id="' + p.id + '"][data-field="' + field + '"]').value;
    };
    const aisle = Number(get('aisle'));
    const side = get('side');
    const shelf = get('shelf');
    const moved = aisle !== p.aisle || side !== p.side || shelf !== p.shelf;
    if (moved) { changed++; }
    edits[p.id] = {
      aisle: aisle,
      side: side,
      shelf: shelf,
      lastChecked: moved ? today() : p.lastChecked
    };
    p.aisle = aisle; p.side = side; p.shelf = shelf;
    if (moved) { p.lastChecked = today(); }
  });

  try {
    localStorage.setItem('shohinDokoEdits', JSON.stringify(edits));
    $('saveMsg').textContent = changed > 0
      ? changed + '件の売り場を変更しました。買い物客の画面にすぐ反映されます。'
      : '保存しました。変更はありませんでした。';
    $('saveMsg').className = 'feedback good';
  } catch (e) {
    $('saveMsg').textContent = '保存できませんでした。ブラウザの設定をご確認ください。';
    $('saveMsg').className = 'feedback warn';
  }
  $('saveMsg').hidden = false;
  buildEditList();
}

function resetEdits() {
  try { localStorage.removeItem('shohinDokoEdits'); } catch (e) { /* ignore */ }
  window.location.reload();
}

/* ---------- 3. Today's pick ---------- */

function buildPickForm() {
  const pick = getPick();
  const select = $('pickProduct');
  select.innerHTML = '';
  PRODUCTS.forEach(function (p) {
    const o = document.createElement('option');
    o.value = p.id;
    o.textContent = p.name.ja;
    if (p.id === pick.productId) { o.selected = true; }
    select.appendChild(o);
  });
  $('pickOn').value = pick.on ? 'yes' : 'no';
  $('pickMessageInput').value = pick.message || '';
}

function savePick() {
  const pick = {
    on: $('pickOn').value === 'yes',
    productId: $('pickProduct').value,
    message: $('pickMessageInput').value.trim()
  };
  try {
    localStorage.setItem('shohinDokoPick', JSON.stringify(pick));
    $('pickMsg').textContent = pick.on
      ? '保存しました。買い物客の検索画面に表示されます。'
      : '保存しました。今は表示されません。';
    $('pickMsg').className = 'feedback good';
  } catch (e) {
    $('pickMsg').textContent = '保存できませんでした。ブラウザの設定をご確認ください。';
    $('pickMsg').className = 'feedback warn';
  }
  $('pickMsg').hidden = false;
}

/* ---------- Start ---------- */

requireStaffLogin(function () {
  $('staffMain').hidden = false;
  $('storeName').textContent = STORE.name.ja;
  buildEditList();
  buildPickForm();
  $('saveBtn').addEventListener('click', saveEdits);
  $('resetBtn').addEventListener('click', resetEdits);
  $('savePickBtn').addEventListener('click', savePick);
  $('logoutBtn').addEventListener('click', staffLogout);
});
