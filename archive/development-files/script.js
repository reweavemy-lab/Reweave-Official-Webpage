// Luxury Navigation & Interactions
// Aligns with actual classes in index.html

document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const hiddenNav = document.querySelector('.hidden-nav');
    const closeNavBtn = document.querySelector('.close-nav');
    const searchBtn = document.querySelector('.search-btn');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchCloseBtn = document.querySelector('.search-close');
    const callUsBtn = document.querySelector('.utility-btn[aria-label="Call Us"]');
    const header = document.querySelector('.luxury-header') || document.querySelector('.header');
    const body = document.body;

    // Toggle navigation menu
    function toggleNav(open) {
        const isOpen = open !== undefined ? open : !hiddenNav.classList.contains('active');
        hiddenNav.classList.toggle('active', isOpen);
        body.classList.toggle('nav-open', isOpen);
    }

    // Open/Close navigation
    if (menuBtn && hiddenNav) {
        menuBtn.addEventListener('click', () => toggleNav(true));
    }
    if (closeNavBtn) {
        closeNavBtn.addEventListener('click', () => toggleNav(false));
    }
    // Close nav when clicking outside
    document.addEventListener('click', function(e) {
        if (hiddenNav && hiddenNav.classList.contains('active')) {
            const clickedInsideNav = hiddenNav.contains(e.target);
            const clickedMenuBtn = menuBtn && menuBtn.contains(e.target);
            if (!clickedInsideNav && !clickedMenuBtn) {
                toggleNav(false);
            }
        }
    });

    // Search overlay
    function toggleSearch(open) {
        if (!searchOverlay) return;
        const isOpen = open !== undefined ? open : !searchOverlay.classList.contains('active');
        searchOverlay.classList.toggle('active', isOpen);
        body.classList.toggle('search-open', isOpen);
    }
    if (searchBtn) {
        searchBtn.addEventListener('click', () => toggleSearch(true));
    }
    if (searchCloseBtn) {
        searchCloseBtn.addEventListener('click', () => toggleSearch(false));
    }
    // Escape key closes overlays
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleNav(false);
            toggleSearch(false);
        }
    });

    // Call Us button (opens dialer)
    if (callUsBtn) {
        callUsBtn.addEventListener('click', () => {
            window.location.href = 'tel:+6561234567';
        });
    }

    // Header scroll state
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (header) {
            if (scrollTop > 100) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Chat button placeholder
    const chatBtn = document.querySelector('.chat-btn');
    if (chatBtn) {
        chatBtn.addEventListener('click', function() {
            alert('Chat coming soon. Reach us at +65 6123 4567.');
        });
    }

    const getCart = () => {
        try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
    };
    const setBadge = () => {
        const count = getCart().reduce((s,i)=>s + Number(i.qty||1), 0);
        const els = document.querySelectorAll('.cart-count');
        els.forEach(el => el.textContent = String(count));
        const headerCount = document.getElementById('cartCount');
        if (headerCount) headerCount.textContent = String(count);
    };
    setBadge();
    window.addEventListener('storage', function(e){ if (e.key === 'cart') setBadge(); });
});

// AI Shopper UI intent layer
window.AIShop = (function(){
  const getCart = () => { try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; } };
  const setCart = (c) => localStorage.setItem('cart', JSON.stringify(c));
  const number = (v) => Number(v || 0);
  function searchProducts(term = '', filters = {}) {
    try {
      const input = document.getElementById('search-input');
      if (input) { input.value = term; input.dispatchEvent(new Event('input')); return true; }
      window.location.href = '/vercel-deployment/pages/shop/index.html';
      return false;
    } catch { return false; }
  }
  function viewProduct(sku) {
    if (!sku) return false;
    try { window.location.href = `/vercel-deployment/pages/shop/product-detail.html?sku=${encodeURIComponent(sku)}`; return true; } catch { return false; }
  }
  function addToCart(item) {
    if (!item || !item.id) return false;
    const cart = getCart();
    const normalized = {
      id: item.id,
      name: item.name || 'Item',
      price: number(item.price),
      qty: number(item.qty || 1),
      image: item.image || '',
      options: item.options || '',
      addon: !!item.addon
    };
    const existing = cart.find(i => i.id === normalized.id && i.options === normalized.options);
    if (existing) existing.qty += normalized.qty; else cart.push(normalized);
    setCart(cart);
    try {
      const badgeEls = document.querySelectorAll('.cart-count');
      const count = cart.reduce((s,i)=>s + number(i.qty), 0);
      badgeEls.forEach(el => el.textContent = String(count));
    } catch {}
    return true;
  }
  function buyNow(item) { const ok = addToCart(item); if (ok) window.location.href = '/vercel-deployment/pages/cart/index.html'; return ok; }
  function openTryOn(product) {
    const name = product?.name || product || '';
    window.location.href = `/vercel-deployment/pages/tryon/index.html?product=${encodeURIComponent(name)}`;
    return true;
  }
  function checkout() { window.location.href = '/vercel-deployment/pages/checkout/guest.html'; return true; }
  return { searchProducts, viewProduct, addToCart, buyNow, openTryOn, checkout };
})();

function toggleMenu() {
  const menu = document.querySelector('.mobile-menu');
  if (!menu) return;
  const isActive = menu.classList.contains('active');
  if (isActive) menu.classList.remove('active'); else menu.classList.add('active');
}