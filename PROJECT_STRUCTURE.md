# Reweave Website - Project Structure

## 📁 Directory Structure

```
/
├── index.html                    # Main homepage (served at /)
├── vercel.json                   # Vercel routing configuration
├── package.json                  # Build configuration
│
├── pages/                        # All website pages
│   ├── tryon/
│   │   ├── index.html           # AI Try-On page (accessible at /tryon)
│   │   └── test-embed.html      # Test page for development
│   ├── cart/
│   │   └── index.html           # Shopping cart page (accessible at /cart)
│   ├── shop/
│   │   ├── index.html           # Shop listing page
│   │   ├── product-detail.html  # Product detail page
│   │   └── configure.html       # Product configuration page
│   ├── story/
│   │   └── index.html           # Our Story page
│   ├── impact/
│   │   └── index.html           # Sustainability/Impact page
│   ├── community/
│   │   └── index.html           # Community page
│   ├── team/
│   │   └── index.html           # Team/Contact page
│   ├── account/
│   │   └── index.html           # User account page
│   ├── checkout/
│   │   ├── guest.html           # Guest checkout
│   │   └── fpx.html             # FPX payment checkout
│   ├── admin/                    # Admin pages
│   │   ├── dashboard.html
│   │   ├── orders.html
│   │   ├── leads.html
│   │   ├── events.html
│   │   └── analytics.html
│   └── [other pages...]
│
├── shared/                       # Shared assets used by all pages
│   ├── styles.css               # Main stylesheet (global styles)
│   ├── script.js                # Main JavaScript (cart, navigation, etc.)
│   ├── chatbot.js               # Chatbot widget script
│   ├── header.html              # Header component (for reference)
│   └── footer.html              # Footer component (for reference)
│
├── images/                       # Image assets
│   ├── Reweave logo.png
│   └── [product images...]
│
└── archive/                      # Archived/unused files
    └── [old versions and unused files]
```

## 🔗 URL Routing (from vercel.json)

| URL Path | Serves File | Description |
|----------|-------------|-------------|
| `/` | `/index.html` | Homepage |
| `/tryon` | `/pages/tryon/index.html` | AI Try-On page |
| `/cart` | `/pages/cart/index.html` | Shopping cart |
| `/pages/*` | `/pages/$1` | All other pages |
| `/shared/*` | `/shared/$1` | Shared assets (CSS, JS) |
| `/ai/*` | Streamlit Cloud proxy | AI Try-On app proxy |

## 📄 File Naming Conventions

### Pages
- **Location**: `pages/{page-name}/index.html`
- **URL**: `/pages/{page-name}/` or custom route in `vercel.json`
- **Example**: `pages/shop/index.html` → accessible at `/pages/shop/`

### Shared Assets
- **Location**: `shared/{asset-name}.{ext}`
- **URL**: `/shared/{asset-name}.{ext}`
- **Examples**:
  - `shared/styles.css` → `/shared/styles.css`
  - `shared/script.js` → `/shared/script.js`
  - `shared/chatbot.js` → `/shared/chatbot.js`

### Images
- **Location**: `images/{image-name}.{ext}`
- **URL**: `/images/{image-name}.{ext}` (or relative path from page)

## 🔧 How Pages Reference Shared Assets

All pages use **absolute paths** starting with `/shared/`:

```html
<!-- In any page HTML file -->
<link rel="stylesheet" href="/shared/styles.css">
<script src="/shared/script.js"></script>
<script src="/shared/chatbot.js"></script>
```

**Why absolute paths?**
- Works regardless of page depth (`/pages/shop/` vs `/pages/shop/product-detail.html`)
- Consistent across all pages
- Easy to understand and maintain

## 🎯 Key Files Explained

### `vercel.json`
- Defines URL routing rules
- Maps clean URLs (`/tryon`) to actual files (`/pages/tryon/index.html`)
- Proxies `/ai/*` to Streamlit Cloud

### `shared/styles.css`
- Global stylesheet
- Contains header, footer, and common component styles
- Used by ALL pages

### `shared/script.js`
- Main JavaScript file
- Handles cart functionality, navigation, product loading
- Used by ALL pages

### `shared/chatbot.js`
- Chatbot widget script
- Loads Shieldbase chatbot
- Used by ALL pages

## 🚫 Files NOT Used in Deployment

These files exist but are **not** part of the active deployment:

- `vercel-deployment/` folder (legacy, kept for backward compatibility)
- `archive/` folder (old versions)
- `Reweave-AI-Try-On/` (separate Streamlit app, deployed separately)
- Root level old HTML files (`cart.html`, `tryon.html`, etc.)

## 📝 For AI Coders

**Quick Reference:**
- **Pages go in**: `pages/{name}/index.html`
- **Shared assets go in**: `shared/`
- **Reference shared assets as**: `/shared/{filename}`
- **Routing config**: `vercel.json`
- **Main homepage**: `index.html` (root)

**Common Tasks:**
- Add new page → Create `pages/{name}/index.html`, reference `/shared/styles.css` and `/shared/script.js`
- Update styles → Edit `shared/styles.css`
- Update navigation → Edit `shared/script.js` (look for `TRYON_URL`, `CART_URL`)
- Add shared component → Add to `shared/` folder, reference with `/shared/{filename}`

