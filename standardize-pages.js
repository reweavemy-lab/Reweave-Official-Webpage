const fs = require('fs');
const path = require('path');

// Shared header and footer HTML
const sharedHeader = `  <!-- Standardized Header Component for Reweave -->
  <header class="header">
    <div class="header-container">
      <div class="nav-left">
        <button class="nav-btn" onclick="toggleMenu()">
          <i class="fas fa-bars"></i> Menu
        </button>
        <button class="nav-btn" title="AI Try-On">AI Try-On</button>
      </div>
      
      <a href="/" class="logo">REWEAVE</a>
      
      <div class="nav-right">
        <button class="nav-btn cart-btn">
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
      <div class="menu-title">Navigate</div>
      <a href="/" class="menu-link">Home</a>
      <a href="/tryon" class="menu-link">AI Try-On</a>
      <a href="/cart" class="menu-link">Cart</a>
    </div>
  </div>`;

const sharedFooter = `  <!-- Standardized Footer Component for Reweave -->
  <footer class="footer">
    <div class="container">
      <div class="footer-brand">REWEAVE</div>
      <div class="footer-text">
        Sustainable fashion, reimagined. Crafting heritage into modern essentials.
      </div>
      <div class="footer-links">
        <a href="../story/index.html" class="footer-link">Our Story</a>
        <a href="../impact/index.html" class="footer-link">Sustainability</a>
        <a href="../community/index.html" class="footer-link">Community</a>
        <a href="../team/index.html" class="footer-link">Contact</a>
      </div>
      <div class="footer-trust">
        <span class="trust-badge">FPX Available</span>
        <span class="trust-badge">Visa</span>
        <span class="trust-badge">Mastercard</span>
        <span class="trust-badge">30-day Returns</span>
      </div>
    </div>
  </footer>

  <!-- Shared Scripts -->
  <script src="../../vercel-deployment/shared/script.js"></script>`;

// Pages to update (excluding already updated ones)
const pagesToUpdate = [
  'pages/story/index.html',
  'pages/artisan/index.html',
  'pages/culture/index.html',
  'pages/impact/index.html',
  'pages/community/index.html',
  'pages/journal/index.html',
  'pages/team/index.html',
  'pages/customize/index.html',
  'pages/account/index.html',
  'pages/checkout/guest.html',
  'pages/checkout/fpx.html',
  'pages/shop/product-detail.html',
  'pages/shop/configure.html',
  'pages/admin/dashboard.html',
  'pages/admin/analytics.html',
  'pages/admin/events.html',
  'pages/admin/leads.html',
  'pages/admin/orders.html'
];

function updatePage(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} - file not found`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Update CSS link to use shared styles
  if (content.includes('../../css/styles.css') || content.includes('../css/styles.css')) {
    content = content.replace(/href=["']\.\.\/\.\.\/css\/styles\.css["']/g, 'href="../../vercel-deployment/shared/styles.css"');
    content = content.replace(/href=["']\.\.\/css\/styles\.css["']/g, 'href="../../vercel-deployment/shared/styles.css"');
    modified = true;
  }

  // Update Font Awesome to latest version
  if (content.includes('font-awesome/6.0.0')) {
    content = content.replace(/font-awesome\/6\.0\.0[^"']*/g, 'font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer"');
    modified = true;
  }

  // Replace header (look for common header patterns)
  const headerPatterns = [
    /<header[^>]*>[\s\S]*?<\/header>/gi,
    /<!-- Header -->[\s\S]*?<\/header>/gi,
    /<!-- Luxury header[\s\S]*?<\/header>/gi
  ];

  for (const pattern of headerPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, sharedHeader);
      modified = true;
      break;
    }
  }

  // Replace footer (look for common footer patterns)
  const footerPatterns = [
    /<footer[^>]*>[\s\S]*?<\/footer>/gi,
    /<!-- Footer -->[\s\S]*?<\/footer>/gi,
    /<!-- Luxury footer[\s\S]*?<\/footer>/gi
  ];

  for (const pattern of footerPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, sharedFooter);
      modified = true;
      break;
    }
  }

  // Update script references
  if (content.includes('../../js/main.js') || content.includes('../../script.js')) {
    content = content.replace(/<script[^>]*src=["']\.\.\/\.\.\/js\/main\.js["'][^>]*><\/script>/gi, '');
    content = content.replace(/<script[^>]*src=["']\.\.\/\.\.\/script\.js["'][^>]*><\/script>/gi, '');
    // Add shared script before closing body if not already there
    if (!content.includes('vercel-deployment/shared/script.js')) {
      content = content.replace(/<\/body>/i, '  <!-- Shared Scripts -->\n  <script src="../../vercel-deployment/shared/script.js"></script>\n</body>');
    }
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Updated ${filePath}`);
  } else {
    console.log(`- Skipped ${filePath} (no changes needed)`);
  }
}

// Update all pages
console.log('Standardizing pages with shared header and footer...\n');
pagesToUpdate.forEach(updatePage);
console.log('\nDone!');

