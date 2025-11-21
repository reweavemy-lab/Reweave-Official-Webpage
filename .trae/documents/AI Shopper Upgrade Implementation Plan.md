## Goals

- Make the site fully AI-operable: an assistant can search, recommend, explain, try-on, add to cart, and complete checkout reliably.
- Publish machine-readable catalog/content and expose safe browser intents the assistant can call.
- Improve discovery, personalization, upsell, and content to win conversion.

## Catalog & Schema

- Normalize product/variant schema (ids, sku, numeric prices, images[], attributes, inventory, categories/tags).
- Add JSON-LD Product on detail pages (done baseline) and extend with Breadcrumb/Organization/FAQ where relevant.
- Ensure image alt text and captions to help multi‑modal understanding.

## APIs (Mock First, Real Later)

- Implement/read endpoints:
  - `GET /api/products`, `GET /api/products/:id`, `GET /api/search?q=...`, `GET /api/related?sku=...`, `GET /api/inventory?sku=...`.
- Return numeric prices/stock; handle errors/timeouts robustly.
- Add `GET /api/faq` and `GET /api/policies` (returns/shipping) for grounded assistant answers.

## AI Intent Layer (Frontend)

- Finalize global intents wired to UI:
  - `AIShop.searchProducts(term, filters)`
  - `AIShop.viewProduct(sku)`
  - `AIShop.addToCart(item)` with numeric coercion
  - `AIShop.buyNow(item)` add→checkout
  - `AIShop.openTryOn(productOrSku)` (preselect variant)
  - `AIShop.checkout()`
- Ensure storage event badge sync and a single cart key.

## Try‑On Deep Links

- Preselect variant (color/size) via query params when coming from detail or assistant.
- Add “Compare” inside Try‑On (quick swap) and expose back-to-product/cart CTA.

## Discovery & Vector Search

- Build a local semantic index of catalog + blog (embeddings).
- Add suggest API for semantic queries (e.g., "batik tote under RM300 for office").
- Update assistant routing: semantic results → listing/detail.

## Personalization

- Capture preferences (colors, materials, silhouettes, price ceilings) and session memory.
- Ranking: simple heuristic to start, evolving to ML (click/add history, session signals).
- Saved looks/style boards the assistant can recall/edit.

## Cart, Upsell & Checkout

- Cart upsell: use `/api/related` with offline fallback (baseline added) and numeric prices.
- “Buy Now” everywhere (cards/detail): add → checkout page.
- Conversational checkout (guest-first): address validation and totals verification.

## Content & Blog

- Journal admin (baseline local) → add backend `POST/GET /api/blog` for persistence.
- Emit JSON-LD Article per post (baseline added) and publish RSS/Atom + sitemap updates.
- Create expert guides (materials, care, artisan stories) the assistant can cite.

## Telemetry & Observability

- Instrument: `view_product`, `tryon_open`, `add_to_cart`, `buy_now`, `checkout_start`, `checkout_complete`, `blog_publish`.
- Summaries dashboard; guard UI from backend downtime.

## Performance & UX

- Replace placeholder icon kit; defer non‑critical scripts; lazy-load images/lists.
- Cache catalog responses; debounce search; retry w/ backoff.
- Standardize header/footer across pages (baseline mostly aligned) and mobile accessibility.

## Trust, Privacy, Safety

- Keep keys in env; do not log PII; rate-limit public endpoints.
- Consent for analytics; data deletion requests; guardrails for policy compliance.

## Phased Rollout

1. Ship mock APIs (`products/search/related/faq/policies`) and wire assistant intents end‑to‑end.
2. Preselect variants in Try‑On; unify cart/checkout flows; expand upsell.
3. Add semantic search (vector index) and preference capture.
4. Blog persistence + feeds + sitemap; publish guides.
5. Telemetry and performance passes; production API swap.

## Verification

- Local: backend online/offline tests for search/upsell; add→checkout success.
- Assistant: ask for items, add, buy now, try‑on, and cite blog/FAQ.
- Accessibility/mobile smoke tests; numeric price validation throughout.
