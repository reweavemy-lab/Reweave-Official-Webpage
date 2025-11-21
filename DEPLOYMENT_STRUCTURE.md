# Vercel Deployment Structure Analysis

## 📁 Files & Folders Actually Used for Deployment

Based on `vercel.json` routing configuration, here's what's currently deployed:

### Root Level (Deployed Directly)
```
/
├── index.html              ✅ Main homepage
├── vercel.json            ✅ Routing configuration
├── package.json           ✅ Build configuration
└── images/                ✅ Images (referenced by pages)
```

### Pages Directory (`/pages/*`)
```
pages/
├── tryon/index.html       ✅ AI Try-On page (accessible via /tryon)
├── cart/index.html        ✅ Cart page (accessible via /cart)
├── shop/index.html        ✅ Shop page
├── story/index.html       ✅ Story page
├── impact/index.html      ✅ Impact page
├── community/index.html   ✅ Community page
├── team/index.html        ✅ Team/Contact page
├── account/index.html      ✅ Account page
├── checkout/              ✅ Checkout pages
│   ├── guest.html
│   └── fpx.html
└── [other pages...]       ✅ Various other pages
```

### Shared Assets (`/vercel-deployment/shared/*`)
```
vercel-deployment/shared/
├── styles.css             ✅ Main stylesheet (used by all pages)
├── script.js              ✅ Main JavaScript (cart, navigation, etc.)
├── chatbot.js             ✅ Chatbot widget
├── header.html            ⚠️  Component file (not directly served, but referenced)
└── footer.html            ⚠️  Component file (not directly served, but referenced)
```

### Legacy/Backup Files (Still Accessible)
```
vercel-deployment/pages/tryon/index.html  ⚠️  Old version (accessible via /vercel-deployment/pages/tryon/index.html)
vercel-deployment/images/                 ⚠️  Duplicate images
```

---

## 🗑️ Files NOT Used for Deployment (Can be archived)

### Duplicate/Unused Files
```
❌ vercel-deployment/index.html           (old homepage)
❌ vercel-deployment/cart.html            (old cart page)
❌ vercel-deployment/pages/               (duplicate pages, except tryon)
❌ vercel-deployment/account.html         (old account page)
❌ vercel-deployment/build.sh             (not used)
❌ vercel-deployment/deploy-ready.sh      (not used)
❌ vercel-deployment/sw.js                (service worker, not used)
❌ vercel-deployment/test.html            (test file)
❌ vercel-deployment/pages-index.html     (old index)
❌ vercel-deployment/scripts/             (not used in deployment)
❌ vercel-deployment/README.md            (documentation)
❌ vercel-deployment/DRAG-DROP-DEPLOYMENT.md
❌ vercel-deployment/UPDATE-EXISTING-DEPLOYMENT.md
```

### Root Level Unused Files
```
❌ cart.html                              (old cart page)
❌ tryon.html                             (old tryon page)
❌ account.html                           (old account page)
❌ debug-cart.html                        (debug file)
❌ index.html.backup                      (backup)
❌ tryon/index.html                       (duplicate)
❌ cart/index.html                        (duplicate)
❌ deploy.sh                              (not used)
❌ DEPLOYMENT-GUIDE.md                    (documentation)
❌ standardize-pages.js                   (utility script)
```

### Archive/Development Files
```
❌ archive/                               (entire folder - old versions)
❌ vercel-shopping-deployment/            (old deployment package)
❌ vercel-shopping-deployment.zip         (old zip)
❌ godaddy-upload-package/                (old package)
❌ godaddy-upload-package.zip             (old zip)
❌ netlify-deploy/                        (not used)
❌ dist/                                  (old build output)
❌ Reweave-AI-Try-On/                     (separate Streamlit app - deployed separately)
```

### API/Backend (Not Used in Static Deployment)
```
❌ api/                                   (backend files, not used)
❌ supabase/migrations/                   (database migrations, not deployed)
```

---

## 🎯 Recommended Clean Structure

### Option 1: Keep Current Structure (Minimal Changes)
```
/
├── index.html                    ✅ Main homepage
├── vercel.json                   ✅ Routing config
├── package.json                  ✅ Build config
├── images/                       ✅ Images
├── pages/                        ✅ All page HTML files
│   ├── tryon/index.html
│   ├── cart/index.html
│   └── [other pages...]
└── vercel-deployment/
    └── shared/                   ✅ Shared assets only
        ├── styles.css
        ├── script.js
        ├── chatbot.js
        ├── header.html
        └── footer.html
```

### Option 2: Cleaner Structure (Recommended)
```
/
├── index.html                    ✅ Main homepage
├── vercel.json                   ✅ Routing config
├── package.json                  ✅ Build config
├── images/                       ✅ Images
├── pages/                        ✅ All page HTML files
│   ├── tryon/index.html
│   ├── cart/index.html
│   └── [other pages...]
└── shared/                       ✅ Rename vercel-deployment/shared to just shared
    ├── styles.css
    ├── script.js
    ├── chatbot.js
    ├── header.html
    └── footer.html
```

**Note:** Option 2 would require updating:
- `vercel.json` rewrite rule: `/shared/(.*)` → `/shared/$1`
- All HTML files referencing `/vercel-deployment/shared/` → `/shared/`

---

## 📊 Current Routing (from vercel.json)

| URL Path | Serves | Status |
|----------|--------|--------|
| `/` | `/index.html` | ✅ Active |
| `/tryon` | `/pages/tryon/index.html` | ✅ Active |
| `/cart` | `/pages/cart/index.html` | ✅ Active |
| `/pages/*` | `/pages/$1` | ✅ Active |
| `/vercel-deployment/*` | `/vercel-deployment/$1` | ⚠️ Legacy |
| `/shared/*` | `/vercel-deployment/shared/$1` | ✅ Active (proxy) |
| `/ai/*` | Streamlit Cloud proxy | ✅ Active |

---

## 🔍 Files Referencing Shared Assets

**Files that need updating if we rename `vercel-deployment/shared` to `shared`:**
- `index.html` → references `vercel-deployment/shared/styles.css` and `vercel-deployment/shared/script.js`
- `pages/tryon/index.html` → references `../../vercel-deployment/shared/styles.css` and `/vercel-deployment/shared/chatbot.js`
- `pages/cart/index.html` → references `../../vercel-deployment/shared/styles.css` and `/vercel-deployment/shared/chatbot.js`
- `pages/shop/index.html` → references `../../vercel-deployment/shared/styles.css`
- `pages/story/index.html` → references `../../vercel-deployment/shared/styles.css`
- All other pages in `pages/` directory

---

## 💡 Recommendations

1. **Keep `vercel-deployment/shared/` as-is** for now (minimal disruption)
2. **Archive unused files** to `archive/unused-deployment-files/`
3. **Remove duplicate pages** from `vercel-deployment/pages/` (except tryon which is still accessible)
4. **Clean up root level** old HTML files
5. **Document** which files are actively used vs archived

Would you like me to create a cleanup script to move unused files to archive?

