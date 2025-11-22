// Utility script to standardize Reweave pages with consistent header, footer, and cart links

// Standardized header HTML
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

// Standardized footer HTML
const STANDARD_FOOTER = `<!-- Standardized Footer Component for Reweave -->
<footer class="footer">
  <div class="container">
    <div class="footer-brand">REWEAVE</div>
    <div class="footer-text">
      Sustainable fashion, reimagined. Crafting heritage into modern essentials.
    </div>
    <div class="footer-trust">
      <span class="trust-badge">FPX Available</span>
      <span class="trust-badge">Visa</span>
      <span class="trust-badge">Mastercard</span>
      <span class="trust-badge">30-day Returns</span>
    </div>
  </div>
</footer>`;

// Standard CSS and JS links
const STANDARD_HEAD_LINKS = `
  <link rel="stylesheet" href="/shared/styles.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
`;

const STANDARD_SCRIPTS = `
  <script src="/shared/script.js"></script>
`;

// Function to update cart links in HTML content
function updateCartLinks(htmlContent) {
  // Update cart button links to point to canonical cart page
  return htmlContent
    .replace(/href=["'].*?cart.*?["']/gi, 'href="/pages/cart/index.html"')
    .replace(/onclick=["'].*?cart.*?["']/gi, 'onclick="window.location.href=\'/pages/cart/index.html\'"')
    .replace(/window\.location\.href\s*=\s*["'].*?cart.*?["']/gi, 'window.location.href = \'/pages/cart/index.html\'');
}

// Function to standardize header and footer
function standardizePage(htmlContent, pagePath) {
  let updatedContent = htmlContent;
  
  // Add standard CSS links if not present
  if (!updatedContent.includes('shared/styles.css')) {
    // Find the head section and add CSS links
    updatedContent = updatedContent.replace(
      /<head>([\s\S]*?)<\/head>/i,
      `<head>$1${STANDARD_HEAD_LINKS}</head>`
    );
  }
  
  // Replace existing header with standardized header
  const headerRegex = /<header[\s\S]*?<\/header>/i;
  updatedContent = updatedContent.replace(headerRegex, STANDARD_HEADER);
  
  // Replace existing footer with standardized footer
  const footerRegex = /<footer[\s\S]*?<\/footer>/i;
  updatedContent = updatedContent.replace(footerRegex, STANDARD_FOOTER);
  
  // Update cart links
  updatedContent = updateCartLinks(updatedContent);
  
  // Add standard scripts before closing body tag if not present
  if (!updatedContent.includes('shared/script.js')) {
    updatedContent = updatedContent.replace(
      /<\/body>/i,
      `${STANDARD_SCRIPTS}</body>`
    );
  }
  
  return updatedContent;
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    standardizePage,
    updateCartLinks,
    STANDARD_HEADER,
    STANDARD_FOOTER,
    STANDARD_HEAD_LINKS,
    STANDARD_SCRIPTS
  };
}

// If running in browser, make functions available globally
if (typeof window !== 'undefined') {
  window.ReweaveStandardizer = {
    standardizePage,
    updateCartLinks,
    STANDARD_HEADER,
    STANDARD_FOOTER,
    STANDARD_HEAD_LINKS,
    STANDARD_SCRIPTS
  };
}