/**
 * ============================================================
 *  Shopify — Empty Collections Extractor
 *  Run this in the browser DevTools console while on any page
 *  of the target Shopify store.
 *
 *  Strategy:
 *    1. Fetches /collections.json (paginated) to get every collection.
 *    2. For each collection, fetches /collections/<handle>/products.json
 *       with limit=1 — if products_count is 0 or the products array is
 *       empty the collection is considered "empty".
 *    3. Logs a summary table to the console.
 *    4. Auto-downloads a CSV: url
 *
 *  Note: Shopify's storefront JSON API is public (no auth needed).
 *        Rate-limit: ~2 req/s is safe; the script throttles automatically.
 * ============================================================
 */

(async () => {
  // ── Config ──────────────────────────────────────────────────────────────
  const STORE_ORIGIN   = window.location.origin;   // e.g. https://mystore.myshopify.com
  const PAGE_LIMIT     = 250;                       // max allowed by Shopify
  const REQUEST_DELAY  = 400;                       // ms between product-check requests
  const CSV_FILENAME   = 'shopify-empty-collections.csv';

  // ── Helpers ──────────────────────────────────────────────────────────────
  const sleep  = ms => new Promise(r => setTimeout(r, ms));
  const fetchJ = async url => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} → ${url}`);
    return res.json();
  };

  // ── Step 1: Fetch ALL collections (paginated) ────────────────────────────
  console.log('%c[Empty Collections] Starting scan…', 'color:#6c63ff;font-weight:bold');

  const allCollections = [];
  let page = 1;

  while (true) {
    const url  = `${STORE_ORIGIN}/collections.json?limit=${PAGE_LIMIT}&page=${page}`;
    const data = await fetchJ(url);
    const cols = data.collections ?? [];

    if (cols.length === 0) break;

    allCollections.push(...cols);
    console.log(`  ✔ Page ${page} — fetched ${cols.length} collections (total so far: ${allCollections.length})`);

    if (cols.length < PAGE_LIMIT) break; // last page
    page++;
    await sleep(REQUEST_DELAY);
  }

  console.log(`\n📦 Total collections found: ${allCollections.length}`);

  // ── Step 2: Check each collection for products ───────────────────────────
  const emptyCollections = [];

  for (let i = 0; i < allCollections.length; i++) {
    const col = allCollections[i];
    const checkUrl = `${STORE_ORIGIN}/collections/${col.handle}/products.json?limit=1`;
    const colUrl   = `${STORE_ORIGIN}/collections/${col.handle}`;

    try {
      const data     = await fetchJ(checkUrl);
      const products = data.products ?? [];

      const isEmpty =
        products.length === 0 ||
        (typeof col.products_count === 'number' && col.products_count === 0);

      if (isEmpty) {
        emptyCollections.push(colUrl);
        console.log(`  🚫 EMPTY → ${colUrl}`);
      } else {
        console.log(`  ✅ OK    → ${colUrl} (${products.length}+ products)`);
      }
    } catch (err) {
      console.warn(`  ⚠️  Could not check ${colUrl}: ${err.message}`);
    }

    await sleep(REQUEST_DELAY);
  }

  // ── Step 3: Summary ──────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`%c📋 Empty collections: ${emptyCollections.length} / ${allCollections.length}`, 'color:#e74c3c;font-weight:bold');

  if (emptyCollections.length === 0) {
    console.log('🎉 No empty collections found!');
    return;
  }

  console.log(emptyCollections.join('\n'));

  // ── Step 4: Export CSV ───────────────────────────────────────────────────
  const csvRows = [
    ['url'],
    ...emptyCollections.map(url => [
      `"${url}"`,
    ]),
  ];

  const csvContent = csvRows.map(r => r.join(',')).join('\n');
  const blob       = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link       = document.createElement('a');

  link.href     = URL.createObjectURL(blob);
  link.download = CSV_FILENAME;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log(`\n💾 CSV downloaded: ${CSV_FILENAME}`);
  console.log('   Columns: url');
})();
