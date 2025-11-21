## Objectives

* Make shopping tasks executable by an AI assistant: discover products, compare, upsell, add to cart, and checkout.

* Provide machine-readable product/price/inventory data and consistent UI intents that an AI can call.

* Integrate Try‑On and blog content so AI can recommend, explain, and guide purchases.

## Data & Schema Readiness

* Standardize product schema with explicit numeric fields: `id`, `sku`, `name`, `price` (number), `images[]`, `variants[]`, `attributes{color,material,style}`, `inventory`, `categories[]`, `tags[]`.

* Serve catalog/search endpoints optimized for AI:

  * `GET /api/products` → full list (IDs, variants, numeric prices).

  * `GET /api/products/:id` → single product with variants.

  * `GET /api/search?q=...` → filtered products.

* Add a lightweight `GET /api/related?sku=...` for upsell/cross‑sell.

* Ensure product pages render JSON‑LD Product schema (microdata) for each product to make content machine‑parsable.

## UI Intent Layer (Assistant‑Callable)

* Expose global, side‑effecting functions the assistant can trigger in the browser:

  * `searchProducts(term, filters)` → updates listing.

  * `viewProduct(sku)` → navigates to detail.

  * `addToCart(item)` → adds to localStorage/cart.

  * `buyNow(item)` → add then `window.location` to cart/checkout.

  * `openTryOn(product)` → navigates to Try‑On.

* Keep cart state unified via `localStorage['cart']` with numeric coercion and storage events; update `.cart-count` and `#cartCount` everywhere.

## AI Assistant & Chat Integration

* Provide an on‑site AI shopper assistant (Gemini‑powered) with clear intents:

  * Product discovery (“show totes under RM300”), compatibility (“match batik sling with outfit”), size/material guidance, shipping/returns FAQs.

* Connect assistant actions to UI intents above (e.g., recommending items calls `addToCart`; “buy now” calls `buyNow`).

* Add a small `/api/faq` and `/api/policies` so assistant can ground answers; or generate a static JSON from existing pages.

## Try‑On Integration

* Keep a single entry point for AI Try‑On (embedded iframe and new‑tab option) and expose `openTryOn(productNameOrSku)` for assistant.

* Preselect product/variant when arriving from product detail or assistant suggestion.

## Recommendations & Upsell

* Implement upsell on cart page using `/api/products` and `/api/related` with numeric prices; fallback to a local mock when backend is offline.

* Add “Buy Now” to cards and product detail (add→checkout) so assistant can shortcut purchase flow.

## Checkout Flow & Payments

* Simplify to guest checkout first; expose `checkout()` intent that sends the user to `pages/checkout/guest.html` (or payment page) with cart serialized.

* Validate totals server‑side before payment; ensure numeric price math only.

## Content & Blog (AI Knowledge)

* Add a simple blog admin on Journal page (already scaffolded) and plan backend endpoints:

  * `POST /api/blog` (title, body, image), `GET /api/blog` list, `GET /api/blog/:id`.

* Generate `RSS/Atom` feed and `sitemap.xml` so AI can ingest content; include canonical URLs and categories.

* Add JSON‑LD `Article` schema for blog posts.

## Telemetry & Observability

* Instrument events with a single client tracker: `view_product`, `add_to_cart`, `buy_now`, `checkout_start`, `tryon_open`, `blog_publish`.

* Provide `/api/events` (already referenced) and summary; guard against backend offline to avoid UI failures.

## Performance & UX Baselines

* Fix icon kit and static assets; optimize images (responsive `srcset`, compression), lazy‑load images/lists.

* Cache catalog responses; debounce search; reduce blocking scripts; standardize header/footer CSS across pages.

## Privacy & Security

* Keep API keys in env vars; never log PII; rate‑limit public endpoints.

* Add consent for analytics; provide data deletion request path.

## Rollout Steps

1. Catalog normalization and JSON‑LD injection on product/detail pages.
2. Implement/search/related endpoints; numeric price enforcement server‑side.
3. UI intent layer functions; unify cart and badge sync.
4. Upsell on cart with graceful fallback; Buy Now everywhere.
5. Assistant integration wired to intents; Try‑On deep link.
6. Blog admin + feed + schema; sitemap generation.
7. Telemetry consolidation; performance passes; asset fixes.

## Verification

* Local preview: backend online and offline paths; add items, compute totals, buy now, upsell add.

* Assistant end‑to‑end: ask for product, add to cart, checkout; open Try‑On; cite blog content.

* Accessibility and mobile checks.

## Notes

* <br />

