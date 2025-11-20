# Reweave One‑Page • Figma Design Spec

This spec translates the implemented one‑page (`onepage.html`) into a Figma blueprint your team can build with Auto Layout, grids, and components. It includes layout, styles, components, and prototype linking.

## Frames & Grid
- Frame: `OnePage / Default`
  - Size: Desktop 1440 × auto (extend vertically)
  - Grid: 12 columns, `gutter: 24`, `margin: 24`, `maxWidth: 1100`
  - Background: `primaryWhite`

## Sections (Layers)
- `Header`
  - Fixed to top (simulate sticky in prototype if needed)
  - Contents: Brand centered, Cart button on right
  - Height: 72 (padding 15 top/bottom in CSS)

- `Hero`
  - Auto Layout: horizontal, spacing `32`
  - Left: Title, description, buttons
    - Title (H1): “Batik Luxe, crafted for modern life”
    - Body: One line value prop
    - Buttons: `btn-light` and `btn-outline`
  - Right: Image, corner radius `14`
  - Padding: top `120`, bottom `60`

- `Products`
  - Section title: “Shop the Collection” (H2)
  - Grid: Responsive cards (min 280, max 1fr), gap `24`
  - Two cards: Tote and Sling

- `Footer`
  - Minimal: Brand + line of reassurance (shipping/returns/support)
  - Center aligned

## Typography
- Headings: `Playfair Display`
  - H1: 56, weight 300, lineHeight 1.2, letterSpacing 1
  - H2: 40, weight 300, lineHeight 1.2, letterSpacing 1
  - H3: 29, weight 400, lineHeight 1.2
- Body: `Montserrat`
  - Base: 16, weight 300, lineHeight 1.8, letterSpacing 0.5

Create Figma Text Styles:
- `Heading/H1`, `Heading/H2`, `Heading/H3`
- `Body/Default`, `Body/Subtext`

## Colors
- `primaryBlack` #000000
- `primaryWhite` #ffffff
- `luxuryGray` #f8f8f8
- `textGray` #666666
- `borderGray` #e5e5e5
- `hoverGray` #f0f0f0
- Accents (swatches):
  - `DeepPlum` #5a2b5f
  - `Indigo` #27438a
  - `Olive` #6b7d4b
  - `MatteBlack` #111111

Create Figma Color Styles:
- `Base/Black`, `Base/White`, `UI/LuxuryGray`, `UI/TextGray`, `UI/BorderGray`, `UI/HoverGray`
- `Accent/DeepPlum`, `Accent/Indigo`, `Accent/Olive`, `Accent/MatteBlack`

## Spacing & Radius
- Spacing scale: 4, 8, 12, 16, 24, 32, 60, 120
- Corner radius: `xs 6`, `sm 10`, `md 14`

## Components & Variants
Create these as Figma components with Auto Layout.

### Button
- Variants:
  - `type`: `primary` (black border), `outline`, `light`
  - `state`: `default`, `hover`, `disabled`
- Properties:
  - Padding `10×18`, letterSpacing `1`, uppercase
  - Primary uses `primaryBlack` text/border; `outline` transparent fill; `light` white fill

### Swatch
- Variants:
  - `selected`: `true/false`
  - `color`: `DeepPlum/Indigo/Olive/MatteBlack`
- Size: 24×24, border `borderGray`, radius 50%
- Selected outline: 2px `primaryBlack`, offset 2
- Tooltip (spec): tiny black label above (optional for prototype)

### Product Card
- Variants:
  - `sku`: `Tote` / `Sling`
  - `color`: `DeepPlum/Indigo/Olive/MatteBlack`
- Structure:
  - `product-media` (image 320 height, cover, radius `14`)
  - `product-body` (Auto Layout vertical: Title, Price, Swatches, Actions)
  - `card-actions`: two buttons with equal flex

### Header
- Minimal bar with brand and cart icon (count badge optional)
- Sticky awareness (visual, prototyping optional)

### Footer
- Brand line + reassurance copy centered

## Assets Mapping
- Tote default: `images/Batik Front (WIP).png`
- Tote alt: `images/Batik Front (WIP) (1).png`
- Sling default: `images/Gemini_Generated_Image_mwmxxemwmxxemwmx.png`
- Sling alt: `images/Gemini_Generated_Image_j8e9c1j8e9c1j8e9.png`

Use these images in Figma as fills in `product-media` frames.

## Prototype Links
- `Buy Now` on each Product Card → `Cart` frame (or external link)
- `Cart` icon in Header → `Cart` frame

## Build Steps in Figma
1) Create frame `OnePage / Default` with 12‑col grid.
2) Add `Header` component instance at top.
3) Build `Hero` with Auto Layout: left stack (title/body/buttons) and right image.
4) Add `Products` section title, then Auto Layout grid of `Product Card` instances.
5) Add `Footer` component.
6) Publish components to a library under `Reweave / OnePage`.
7) Hook prototype links for `Buy Now` and `Cart`.

## Notes for Dev Handoff
- Container max width: `1100px`, section padding: `60px`, hero top padding: `120px`.
- Product image height: `320px` with `object-fit: cover`.
- Use CSS variables for colors; map to Figma styles above.
- Swatch interactions: toggle selected outline and swap image.

If you use Tokens Studio, import `docs/figma/tokens.json` to register colors, spacing, radius, and type styles automatically.