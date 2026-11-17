# 商品どこ？ Prototype

A prototype of the shelf-location search for a demo supermarket.
It has two sides: a shopper page anyone can open, and staff pages behind a password.

## Pages

| Page | Who it is for | What it does |
|---|---|---|
| index.html | Shoppers | Search by typing or speaking, in 5 languages. Shows aisle, side, shelf and a store map. Shopper answers 「ありました」 or 「ここにありませんでした」 |
| staff.html | Store staff | Change where a product is. Set today's pick from the manager |
| dashboard.html | Store manager | Weekly report: searches, shelf accuracy rate, reports, improvement hints |

## Files

| File | What it is |
|---|---|
| css/style.css | Colors and layout for all pages |
| js/data.js | Products, keywords, store name, all text in 5 languages, settings |
| js/app.js | How the shopper page works |
| js/auth.js | The password screen for the staff pages |
| js/staff.js | How the staff page works |
| js/dashboard.js | How the dashboard works |
| google-apps-script/Code.gs | Optional: saves searches to Google Sheets and emails a weekly report |
| logo.jpg | Your logo (you add this file yourself) |

## Quick steps

1. Put your logo in this folder and name it `logo.jpg`.
2. Drag this whole folder onto https://app.netlify.com/drop
3. Open the link it gives you.

## The staff password

The password is in `js/data.js`, on the line `staffPassword: 'tencho2026'`.
Change it to something of your own before you show the site to anyone.

IMPORTANT: this is a demo gate, not real security. The password is written in a
file anyone can read by viewing the page source. It is enough to stop a shopper
tapping into the staff screen by accident, and enough to show how the two sides
differ. Before a real store uses this, the staff pages need a proper login on a
server. Say this honestly if anyone asks.

## How to add a product

Open `js/data.js`, copy one product block inside `PRODUCTS` (from `{` to `},`),
paste it below, and change the id, names, aisle, side, shelf, section and keywords.

## How to demo the two sides

Staff edits are saved in the browser you make them in. For a demo, use one phone
or one computer:

1. Open staff.html, enter the password, move a product to a different aisle, press 保存する.
2. Open index.html and search for that product. The new location shows, and the
   last-checked date is today.
3. On staff.html, turn on 今日の店長のおすすめ and write a short message.
4. On index.html, the pick appears above the results.

## Notes

- Voice search works in Chrome (Windows, Mac, Android) and Safari (iPhone).
  It does not work in Firefox. Voice needs the site opened over https.
- Only anonymous data is recorded: time, language, the words searched, the product
  found, and the two feedback buttons. No names, no login for shoppers.
- Staff edits and the manager's pick are saved only in that one browser. A real
  store needs a server database so every phone sees the same data.
- The store, the products and the dashboard demo data are made up for the prototype.
