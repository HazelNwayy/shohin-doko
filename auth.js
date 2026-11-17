/* =========================================================
   auth.js  -  The password screen for the staff pages.

   IMPORTANT, PLEASE READ:
   This is a DEMO GATE, not real security. The password is written
   in js/data.js, which anyone can read by viewing the page source.
   It is enough to stop a shopper from tapping into the staff screen
   by accident, and enough to show judges how the two sides differ.
   Before any real store uses this, the staff pages need a proper
   login on a server. Say this honestly if anyone asks.
   ========================================================= */

/* Puts a password screen over the page.
   onOpen runs once the correct password is entered. */
function requireStaffLogin(onOpen) {
  if (sessionStorage.getItem('shohinDokoStaff') === 'yes') {
    onOpen();
    return;
  }

  const gate = document.createElement('div');
  gate.className = 'gate';
  gate.innerHTML =
    '<form class="gate-card" id="gateForm">' +
      '<div class="gate-title">店舗スタッフ用ページ</div>' +
      '<p class="gate-note">このページは店舗の方専用です。パスワードを入力してください。</p>' +
      '<input type="password" id="gatePass" class="gate-input" ' +
        'autocomplete="current-password" aria-label="パスワード">' +
      '<button type="submit" class="btn btn-primary gate-btn">開く</button>' +
      '<p class="gate-error" id="gateError" role="alert"></p>' +
      '<a class="gate-back" href="index.html">買い物客の画面に戻る</a>' +
    '</form>';
  document.body.appendChild(gate);
  document.getElementById('gatePass').focus();

  document.getElementById('gateForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const typed = document.getElementById('gatePass').value;
    if (typed === CONFIG.staffPassword) {
      try { sessionStorage.setItem('shohinDokoStaff', 'yes'); } catch (err) { /* ignore */ }
      gate.remove();
      onOpen();
    } else {
      document.getElementById('gateError').textContent = 'パスワードが違います。';
      document.getElementById('gatePass').value = '';
      document.getElementById('gatePass').focus();
    }
  });
}

/* Signs the staff member out and returns to the shopper page */
function staffLogout() {
  try { sessionStorage.removeItem('shohinDokoStaff'); } catch (e) { /* ignore */ }
  window.location.href = 'index.html';
}
