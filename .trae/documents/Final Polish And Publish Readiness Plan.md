## Objectives

* Refine UX, styling, and consistency across all pages

* Ensure cart, product detail, Try‑On, Wardrobe Mirror, and Outfit Co‑Pilot work end‑to‑end

* Optimize performance, accessibility, SEO and structured data

* Wire GenAI suggestions confidently with guardrails and sensible credit usage

* Prepare clean handover for publishing to reweave.shop

## Credit Strategy

* Cache suggestions in the local suggest server and batch calls to reduce spend

* Prefer lightweight “flash” model for copy and selection; reserve stronger models only if needed

* Use offline/catalog fallback where sensible; keep credits for final publishing validation

## UX Consistency

* Standardize header/footer across all pages, including legacy variants

* Ensure cart icon links to canonical cart page everywhere

* Align typography, spacing, and icon set; remove placeholder kit

* Verify mobile menu and cart badge sync across routes

## Catalog & Data

* Switch mimic from `/api/products.json` to production catalog API when ready

* Add `/api/related` for upsell/cross‑sell; fallback if offline

* Keep numeric price coercion and variant mapping throughout

## Product Detail & Structured Data

* Validate JSON‑LD Product and Breadcrumb; extend with Organization on homepage

* Add FAQ JSON‑LD using policies/FAQ to improve machine parsing

* Confirm SKU routing and variant preselection

## Try‑On, Wardrobe Mirror & Outfit Co‑Pilot

* Preselect product variants in Try‑On via query params; ensure CTA back to cart/detail

* Wardrobe Mirror: send color cues and catalog to suggest server; render confident justifications

* Outfit Co‑Pilot: send occasion/palette/budget to suggest server; render curated picks

* Add client‑side fallback scoring to avoid failures

## GenAI Suggest Server

* Keep POST `/suggest` with robust prompt; enable `/health` GET for monitoring

* Add cache and error handling; log minimal anonymized metrics

* Tune prompts for luxury tone; ground on palette/silhouette/price

## Performance & Accessibility

* Lazy‑load images and below‑the‑fold sections

* Add responsive images (`srcset`) and compress heavy assets

* Debounce search and retry with backoff for APIs

* Run Lighthouse checks and fix major issues (contrast, keyboard nav, ARIA)

## Observability & Telemetry

* Instrument `view_product`, `tryon_open`, `add_to_cart`, `buy_now`, `checkout_start`, `checkout_complete`

* Provide a simple events summary page without breaking UI if backend offline

## SEO & Content

* Journal admin ready; generate RSS/Atom and sitemap entries

* Ensure canonical URLs and meta tags; add alt text for all images

## Publishing Prep

* Replace local URLs with production endpoints

* Verify SSL, CORS, and env key handling (no keys exposed client‑side)

* Dry run on staging; final pass on reweave.shop with credits reserved for validation

## Verification

* End‑to‑end flows: homepage → product detail → try‑on → add/buy now → cart → checkout

* GenAI suggestions: Wardrobe Mirror and Co‑Pilot produce confident justifications and actionable picks

* Mobile and desktop smoke tests; numeric price validation everywhere

