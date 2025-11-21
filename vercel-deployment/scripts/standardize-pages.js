#!/usr/bin/env node

/**
 * Script to standardize all Reweave vercel-deployment pages
 * This script updates headers, footers, cart links, and adds standardized CSS/JS
 */

const fs = require('fs');
const path = require('path');

// Standardized components
const STANDARD_HEADER = `<!-- Standardized Header Component for Reweave -->
<header class="header">
  <div class="header-container">
    <div class="nav-left">
      <button class="nav-btn" onclick="toggleMenu()">
        <i class="fas fa-bars"></i> Menu
      </button>
      <button class="nav-btn" onclick="window.location.href='pages/tryon/index.html'" title="AI Try-On">AI Try-On</button>
    </div>
    
    <a href="/index.html" class="logo">REWEAVE</a>
    
    <div class="nav-right">
      <button class="nav-btn cart-btn" onclick="window.location.href='pages/cart/index.html'">
        <i class="fas fa-shopping-bag"></i>
        <span class="cart-count" id="cartCount">0</span>
      </button>
    </div>
  </div>
</header>

<!-- Mobile Menu -->
<div class="mobile-menu" id="mobileMenu">
  <div class="menu-header">
    <h3>Menu</h3>
    <button class="nav-btn" onclick="toggleMenu()">
      <i class="fas fa-times"></i>
    </button>
  </div>
  
  <div class="menu-section">
    <div class="menu-title">Shop</div>
    <a href="pages/shop/index.html" class="menu-link">Shop All</a>
    <a href="pages/shop/index.html#new-arrivals" class="menu-link">New Arrivals</a>
    <a href="pages/shop/index.html#batik-heritage" class="menu-link">Batik Heritage</a>
    <a href="pages/shop/index.html#songket-collection" class="menu-link">Songket Collection</a>
    <a href="pages/shop/index.html#accessories" class="menu-link">Accessories</a>
  </div>
  
  <div class="menu-section">
    <div class="menu-title">Our Story</div>
    <a href="pages/story/index.html" class="menu-link">About Reweave</a>
    <a href="pages/artisan/index.html" class="menu-link">Artisan Craft</a>
    <a href="pages/culture/index.html" class="menu-link">Cultural Heritage</a>
    <a href="pages/impact/index.html" class="menu-link">Sustainability</a>
    <a href="pages/community/index.html" class="menu-link">Community</a>
  </div>
  
  <div class="menu-section">
    <div class="menu-title">Experience</div>
    <a href="pages/tryon/index.html" class="menu-link">AI Try-On</a>
    <a href="pages/customize/index.html" class="menu-link">Customize</a>
    <a href="pages/journal/index.html" class="menu-link">Journal</a>
  </div>
  
  <div class="menu-section">
    <div class="menu-title">Support</div>
    <a href="pages/team/index.html" class="menu-link">Contact Us</a>
    <a href="#" class="menu-link">Shipping & Returns</a>
    <a href="#" class="menu-link">Size Guide</a>
    <a href="#" class="menu-link">Care Instructions</a>
  </div>
</div>`;

const STANDARD_FOOTER = `<!-- Standardized Footer Component for Reweave -->
<footer class="footer">
  <div class="container">
    <div class="footer-brand">REWEAVE</div>
    <div class="footer-text">
      Sustainable fashion, reimagined. Crafting heritage into modern essentials.
    </div>
    <div class="footer-links">
      <a href="pages/story/index.html" class="footer-link">Our Story</a>
      <a href="pages/impact/index.html" class="footer-link">Sustainability</a>
      <a href="pages/community/index.html" class="footer-link">Community</a>
      <a href="pages/team/index.html" class="footer-link">Contact</a>
    </div>
    <div class="footer-trust">
      <span class="trust-badge">FPX Available</span>
      <span class="trust-badge">Visa</span>
      <span class="trust-badge">Mastercard</span>
      <span class="trust-badge">30-day Returns</span>
    </div>
  </div>
</footer>`;

const STANDARD_HEAD_LINKS = `
  <link rel="stylesheet" href="/shared/styles.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
`;

const STANDARD_SCRIPTS = `
  <script src="/shared/script.js"></script>
`;

// Pages to update (relative to vercel-deployment directory)
const PAGES_TO_UPDATE = [
  'index.html',
  'cart.html',
  'account.html',
  'pages/shop/index.html',
  'pages/shop/product-detail.html',
  'pages/shop/configure.html',
  'pages/tryon/index.html',
  'pages/cart/index.html',
  'pages/checkout/guest.html',
  'pages/checkout/fpx.html',
  'pages/story/index.html',
  'pages/culture/index.html',
  'pages/community/index.html',
  'pages/impact/index.html',
  'pages/team/index.html',
  'pages/artisan/index.html',
  'pages/customize/index.html',
  'pages/journal/index.html',
  'pages/account/index.html',
  'pages/admin/dashboard.html',
  'pages/admin/analytics.html',
  'pages/admin/orders.html',
  'pages/admin/events.html',
  'pages/admin/leads.html'
];

function updatePage(filePath) {
  console.log(`Processing: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changes = [];
    
    // 1. Update head section with standard CSS links
    if (!content.includes('shared/styles.css')) {
      // Find the head section and add CSS links
      const headMatch = content.match(/<head>([\s\S]*?)<\/head>/i);
      if (headMatch) {
        const headContent = headMatch[1];
        const newHeadContent = headContent.replace(
          /(<link[^>]*rel=["']stylesheet["'][^>]*>)(?=[\s\S]*<\/head>)/i,
          `$1\n  ${STANDARD_HEAD_LINKS.trim()}`
        );
        content = content.replace(headMatch[0], `<head>${newHeadContent}</head>`);
        changes.push('Added standard CSS links');
      }
    }
    
    // 2. Replace existing header with standardized header
    const headerRegex = /<header[\s\S]*?<\/header>/i;
    if (headerRegex.test(content)) {
      content = content.replace(headerRegex, STANDARD_HEADER);
      changes.push('Replaced header with standardized version');
    }
    
    // 3. Replace existing footer with standardized footer
    const footerRegex = /<footer[\s\S]*?<\/footer>/i;
    if (footerRegex.test(content)) {
      content = content.replace(footerRegex, STANDARD_FOOTER);
      changes.push('Replaced footer with standardized version');
    }
    
    // 4. Update cart links to point to canonical cart page
    const cartLinkUpdates = [
      { from: /href=["'].*?cart\.html["']/gi, to: 'href="/pages/cart/index.html"' },
      { from: /href=["'].*?cart\/.*?["']/gi, to: 'href="/pages/cart/index.html"' },
      { from: /onclick=["'].*?cart.*?["']/gi, to: 'onclick="window.location.href=\'/pages/cart/index.html\'"' },
      { from: /window\.location\.href\s*=\s*["'].*?cart.*?["']/gi, to: 'window.location.href = \'/pages/cart/index.html\'' }
    ];
    
    cartLinkUpdates.forEach(update => {
      if (update.from.test(content)) {
        content = content.replace(update.from, update.to);
        changes.push('Updated cart links');
      }
    });
    
    // 5. Add standard scripts before closing body tag
    if (!content.includes('shared/script.js')) {
      content = content.replace(/<\/body>/i, `${STANDARD_SCRIPTS}</body>`);
      changes.push('Added standard JavaScript');
    }
    
    // 6. Remove any old Font Awesome kit references
    const fontAwesomeKitRegex = /<script[^>]*src=["']https:\/\/kit\.fontawesome\.com\/[^"']*["'][^>]*><\/script>/gi;
    if (fontAwesomeKitRegex.test(content)) {
      content = content.replace(fontAwesomeKitRegex, '');
      changes.push('Removed old Font Awesome kit');
    }
    
    // 7. Update logo links to point to root index.html
    content = content.replace(/href=["']\.\.\/\.\.\/index\.html["']/gi, 'href="/index.html"');
    content = content.replace(/href=["']\.\.\/index\.html["']/gi, 'href="/index.html"');
    changes.push('Updated logo links');
    
    // Only write if changes were made
    if (changes.length > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated ${filePath}:`);
      changes.forEach(change => console.log(`  - ${change}`));
      console.log('');
    } else {
      console.log(`- No changes needed for ${filePath}`);
    }
    
    return true;
    
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔄 Starting Reweave page standardization...\n');
  
  const baseDir = path.join(__dirname, '..');
  let successCount = 0;
  let errorCount = 0;
  
  PAGES_TO_UPDATE.forEach(pagePath => {
    const fullPath = path.join(baseDir, pagePath);
    
    if (fs.existsSync(fullPath)) {
      if (updatePage(fullPath)) {
        successCount++;
      } else {
        errorCount++;
      }
    } else {
      console.log(`⚠ File not found: ${fullPath}`);
      errorCount++;
    }
  });
  
  console.log('\n📊 Standardization complete!');
  console.log(`✓ Successfully updated: ${successCount} pages`);
  console.log(`✗ Errors: ${errorCount} pages`);
  
  if (errorCount > 0) {
    console.log('\n⚠ Some pages could not be updated. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ All pages have been successfully standardized!');
  }
}

// Run the script
if (require.main === module) {
  main();
}