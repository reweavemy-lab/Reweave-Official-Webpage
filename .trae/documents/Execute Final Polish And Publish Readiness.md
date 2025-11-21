## Scope & Priorities

1. UX consistency across all pages (headers/footers/cart links)
2. End‑to‑end flows (homepage → detail → try‑on → add/buy → cart → checkout)
3. Performance/accessibility/SEO structured data
4. GenAI suggestions with safe credit usage (cache/batching/fallback)
5. Publishing readiness for reweave.shop

## Implementation Steps

### 1. UX Consistency

* Standardize header/footer across:

  * vercel‑deployment pages: shop, product‑detail, cart, tryon, story, culture, community, impact, team, artisan, customize, checkout (guest/fpx), admin (events/leads)

  * legacy pages (vercel‑shopping‑deployment and vercel‑deployment/cart.html)

* Ensure cart icon links to canonical cart page `vercel‑deployment/pages/cart/index.html` everywhere

* Load shared CSS `archive/development-files/css/styles.css` and script `archive/development-files/script.js` on all pages

* Remove placeholder Font Awesome kit (swap to CDN CSS already used)

### 2. End‑to‑End Flows

* Product detail:

  * Confirm data source (mimic: `/api/products.json`, later: production API)

  * SKU routing and variant preselection

  * Maintain JSON‑LD Product + Breadcrumb injection

* Try‑On:

  * Embed Streamlit app; preselect product via query params

  * Wardrobe Mirror (color analysis of uploads) → request to suggest server, fallback scoring if offline

  * Outfit Co‑Pilot (occasion/palette/budget) → request to suggest server, fallback scoring if offline

  * CTA buttons wired: Add, Buy Now, Try On

* Cart:

  * Numeric price math (coercion), totals, promo codes

  * Upsell: primary `/api/related` (to implement or switch) and fallback curated picks

* Checkout:

  * Confirm routing to guest checkout, totals validation on client; leave hooks for backend validation

### 3. Performance & Accessibility

* Images:

  * Add `srcset`/`sizes` to hero/product images; compress heavy assets

  * Lazy‑load below‑the‑fold grids and images

* Scripts:

  * Debounce search; retry with backoff on APIs; avoid blocking render

* Accessibility:

  * ARIA labels for interactive controls; keyboard navigation; color contrast fixes

* Lighthouse run and remediate: CLS, LCP, accessibility major flags

### 4. SEO & Structured Data

* Homepage: Organization JSON‑LD

* Product detail: Product + Breadcrumb JSON‑LD

* FAQ JSON‑LD generated from `api/faq.json`/policies for a site‑wide FAQ page

* Journal: JSON‑LD Article; generate RSS/Atom feeds; update sitemap

* Canonical URLs and meta tags; alt text coverage

### 5. GenAI Suggest Server & Credit Strategy

* Suggest server:

  * Keep POST `/suggest` with tuned prompt (luxury tone, palette/silhouette/price grounding)

  * Health endpoint `GET /health`; info endpoint `/`

  * In‑memory cache of prompts/responses; batch suggestions where inputs match

* Frontend:

  * Prefer lightweight flash model; fallback to local heuristic scoring when server unavailable

  * Minimal, anonymized logging only; no PII

### 6. Catalog & Data

* Mimic:

  * Continue with `/api/products.json` for local testing; remove console errors

* Production switchover:

  * Implement endpoints: `/api/products`, `/api/related`, `/api/faq`, `/api/policies`

  * Numeric price coercion on client, validation hooks on server

### 7. Observability & Telemetry

* Instrument shopper events:

  * `view_product`, `tryon_open`, `add_to_cart`, `buy_now`, `checkout_start`, `checkout_complete`

* Present a simple events summary page; ensure UI doesn’t break if backend offline

### 8. Publishing Prep

* Replace local endpoints with production URLs; verify SSL/CORS

* Env handling: keys only server‑side; no client exposure

* Staging dry run → final publish to reweave.shop; reserve credits for final validation

## Verification Plan

* Manual flows:

  * Homepage → product detail → Try‑On (preselect) → add/buy → cart (upsell) → checkout

  * Wardrobe Mirror & Co‑Pilot suggestions with justifications; fallback when server offline

* Desktop/mobile smoke tests; numeric price checks; structured data visible in dev tools

* Lighthouse before/after report

## Credit Use Plan

* Cache suggestions to avoid duplicated model calls; batch similar requests

* Use gemini flash for selection/copy; escalate model only if required for quality

* Keep a buffer for final publish validation on reweave.shop

## Deliverables

* Updated pages with consistent header/footer and cart routing

* Try‑On enhancements with intelligent suggestions and justifications

* Performance/accessibility/SEO improvements (assets, structured data, alt tags)

* GenAI server and frontend wiring with caching and fallback

* Publishing checklist and endpoint switch configuration

