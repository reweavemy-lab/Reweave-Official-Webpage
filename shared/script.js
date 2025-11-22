// Standardized Reweave JavaScript - Common functionality across all pages

// Global variables
let cart = JSON.parse(localStorage.getItem('reweave-cart')) || [];
let cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeHeader();
    updateCartCount();
    // initializeMobileMenu(); // Removed - menus no longer used
    initializeSearch();
    initializeCart();
    initializeAnalytics();
    registerServiceWorker();
    initializePerformanceObserver();
    initializeResourceHints();
    optimizeImages();
});

// Header functionality
function initializeHeader() {
    // Update cart count in header
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
    
    // Environment-aware navigation targets
    const isLocal = (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
    const HOME_URL = isLocal ? '/' : '/';
    const TRYON_URL = isLocal ? '/pages/tryon/index.html' : '/tryon';
    const CART_URL = isLocal ? '/pages/cart/index.html' : '/cart';

    const logoLink = document.querySelector('a.logo');
    if (logoLink) logoLink.setAttribute('href', HOME_URL);

    const tryonBtn = document.querySelector('button[title="AI Try-On"]');
    if (tryonBtn) {
        // Remove any existing onclick and set new one
        tryonBtn.removeAttribute('onclick');
        tryonBtn.onclick = function(e){ 
            e.preventDefault();
            window.location.href = TRYON_URL; 
        };
    }

    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        // Remove any existing onclick and set new one
        cartBtn.removeAttribute('onclick');
        cartBtn.onclick = function(e){ 
            e.preventDefault();
            window.location.href = CART_URL; 
        };
    }

    // Add scroll behavior
    window.addEventListener('scroll', handleHeaderScroll);
}

let _scrollScheduled = false;
function handleHeaderScroll() {
    if (_scrollScheduled) return;
    _scrollScheduled = true;
    requestAnimationFrame(() => {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 50) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = 'none';
            }
        }
        _scrollScheduled = false;
    });
}

// Mobile menu functionality
function initializeMobileMenu() {
    const menuBtn = document.querySelector('.menu-btn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeBtn = mobileMenu?.querySelector('.fa-times')?.parentElement;
    
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', toggleMenu);
    }
    
    if (closeBtn && mobileMenu) {
        closeBtn.addEventListener('click', toggleMenu);
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        const mobileMenu = document.getElementById('mobileMenu');
        const menuBtn = document.querySelector('.menu-btn');
        
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            const clickedInsideMenu = mobileMenu.contains(e.target);
            const clickedMenuBtn = menuBtn && menuBtn.contains(e.target);
            
            if (!clickedInsideMenu && !clickedMenuBtn) {
                toggleMenu(false);
            }
        }
    });
    
    // Close menu when clicking on menu links
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });
}

function toggleMenu(forceClose) {
    const mobileMenu = document.getElementById('mobileMenu');
    const body = document.body;
    
    if (!mobileMenu) return;
    
    const shouldOpen = forceClose === false ? false : !mobileMenu.classList.contains('active');
    
    if (shouldOpen) {
        mobileMenu.classList.add('active');
        body.classList.add('nav-open');
        body.style.overflow = 'hidden';
    } else {
        mobileMenu.classList.remove('active');
        body.classList.remove('nav-open');
        body.style.overflow = '';
    }
}

// Search functionality
function initializeSearch() {
    const searchBtn = document.querySelector('.search-btn');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchCloseBtn = document.querySelector('.search-close');
    const searchInput = document.querySelector('.search-input');
    
    if (searchBtn && searchOverlay) {
        searchBtn.addEventListener('click', () => toggleSearch(true));
    }
    
    if (searchCloseBtn && searchOverlay) {
        searchCloseBtn.addEventListener('click', () => toggleSearch(false));
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
        const _onType = debounce(function(value){
            if (String(value).trim().length >= 2) {
                trackEvent('search_typing', { query: String(value).trim() });
            }
        }, 250);
        searchInput.addEventListener('input', function(){ _onType(this.value); });
    }
    
    // Close search when clicking outside
    document.addEventListener('click', function(e) {
        const searchOverlay = document.querySelector('.search-overlay');
        const searchBtn = document.querySelector('.search-btn');
        
        if (searchOverlay && searchOverlay.classList.contains('active')) {
            const clickedInsideSearch = searchOverlay.contains(e.target);
            const clickedSearchBtn = searchBtn && searchBtn.contains(e.target);
            
            if (!clickedInsideSearch && !clickedSearchBtn) {
                toggleSearch(false);
            }
        }
    });
}

function toggleSearch(open) {
    const searchOverlay = document.querySelector('.search-overlay');
    const body = document.body;
    
    if (!searchOverlay) return;
    
    const shouldOpen = open !== undefined ? open : !searchOverlay.classList.contains('active');
    
    if (shouldOpen) {
        searchOverlay.classList.add('active');
        body.classList.add('search-open');
        body.style.overflow = 'hidden';
        
        // Focus search input
        setTimeout(() => {
            const searchInput = document.querySelector('.search-input');
            if (searchInput) searchInput.focus();
        }, 100);
    } else {
        searchOverlay.classList.remove('active');
        body.classList.remove('search-open');
        body.style.overflow = '';
    }
}

function performSearch(query) {
    if (!query.trim()) return;
    
    // Track search event
    trackEvent('search', { query: query.trim() });
    
    // Redirect to search results or shop page with search parameter
    window.location.href = `/pages/shop/index.html?search=${encodeURIComponent(query.trim())}`;
}

// Cart functionality
function initializeCart() {
    // Load cart from localStorage
    updateCartCount();
    
    // Add to cart functionality
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-add-to-cart]') || e.target.closest('[data-add-to-cart]')) {
            e.preventDefault();
            const button = e.target.matches('[data-add-to-cart]') ? e.target : e.target.closest('[data-add-to-cart]');
            addToCart(button);
        }
        
        if (e.target.matches('[data-buy-now]') || e.target.closest('[data-buy-now]')) {
            e.preventDefault();
            const button = e.target.matches('[data-buy-now]') ? e.target : e.target.closest('[data-buy-now]');
            buyNow(button);
        }
    });
}

// Make addToCart available globally for inline onclick handlers
window.addToCart = function addToCart(button) {
    // Handle both button element and string ID
    if (typeof button === 'string') {
        // If it's a string ID, find the button element
        button = document.getElementById(`cart-${button}`) || document.querySelector(`[data-product-id="${button}"]`);
        if (!button) {
            console.error('Button not found for ID:', button);
            showToast('Product button not found', 'error');
            return;
        }
    }
    
    // Ensure button is an element
    if (!button || !button.dataset) {
        console.error('Invalid button element:', button);
        showToast('Invalid product button', 'error');
        return;
    }
    
    const productId = button.dataset.productId;
    const productName = button.dataset.productName;
    // Try multiple ways to get the price
    let productPrice = button.dataset.productPrice;
    if (!productPrice) {
        // Try camelCase version
        productPrice = button.dataset.productprice;
    }
    if (!productPrice) {
        // Try getting attribute directly
        productPrice = button.getAttribute('data-product-price');
    }
    
    // Clean price - remove "RM " prefix if present and parse
    if (typeof productPrice === 'string') {
        productPrice = productPrice.replace(/RM\s*/gi, '').trim();
    }
    productPrice = parseFloat(productPrice);
    
    // Validate parsed price - ensure it's never NaN
    if (isNaN(productPrice) || productPrice <= 0) {
        const rawPrice = button.dataset.productPrice || button.getAttribute('data-product-price');
        console.error('Invalid price after parsing:', {
            raw: rawPrice,
            rawType: typeof rawPrice,
            parsed: productPrice,
            button: button,
            allAttributes: Array.from(button.attributes).map(attr => `${attr.name}="${attr.value}"`)
        });
        // Don't add item with invalid price - show error instead
        showToast('Product price is invalid. Please refresh the page.', 'error');
        return;
    }
    const productImage = button.dataset.productImage;
    const variant = button.dataset.variant || 'default';
    
    console.log('addToCart - Product data:', {
        productId,
        productName,
        rawPrice: button.dataset.productPrice || button.getAttribute('data-product-price'),
        parsedPrice: productPrice,
        productImage,
        variant,
        allDataset: Object.keys(button.dataset)
    });
    
    if (!productId || !productName) {
        console.error('Missing product data:', { productId, productName, productPrice });
        showToast('Product information missing', 'error');
        return;
    }
    
    if (productPrice === 0 || isNaN(productPrice)) {
        console.error('Invalid price - Raw:', button.dataset.productPrice, 'Attribute:', button.getAttribute('data-product-price'), 'Parsed:', productPrice);
        console.error('Button element:', button);
        console.error('All data attributes:', button.dataset);
        // Don't block adding to cart, but log the issue
        console.warn('Adding item with price 0 - this may be a data attribute issue');
    }
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.id === productId && item.variant === variant);
    
    if (existingItem) {
        // Update both quantity fields for compatibility
        existingItem.quantity = (existingItem.quantity || existingItem.qty || 0) + 1;
        existingItem.qty = existingItem.quantity;
    } else {
        const cartItem = {
            id: productId,
            name: productName,
            price: productPrice,  // Ensure this is a number, not string
            image: productImage,
            variant: variant,
            quantity: 1,
            qty: 1  // Store both for compatibility with cart page
        };
        console.log('Adding item to cart:', cartItem);
        console.log('Price being stored:', productPrice, 'Type:', typeof productPrice);
        
        // Warn if price is invalid, but still add the item
        if (!productPrice || productPrice === 0 || isNaN(productPrice)) {
            console.error('WARNING: Adding item with invalid price:', productPrice);
            console.error('Button data:', {
                dataset: button.dataset,
                attributes: Array.from(button.attributes).map(attr => ({ name: attr.name, value: attr.value }))
            });
            showToast('Warning: Item price may be missing', 'warning');
        }
        
        cart.push(cartItem);
    }
    
    // Save to localStorage
    localStorage.setItem('reweave-cart', JSON.stringify(cart));
    const savedCart = JSON.parse(localStorage.getItem('reweave-cart'));
    console.log('Cart saved to localStorage. Items:', savedCart.length);
    savedCart.forEach((item, i) => {
        console.log(`  Saved item ${i}:`, { name: item.name, price: item.price, priceType: typeof item.price });
    });
    
    // Update cart count
    cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    updateCartCount();
    
    // Dispatch custom event to notify cart page to refresh
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: cart } }));
    
    // Show success message
    showToast(`${productName} added to cart`, 'success');
    
    // Track event
    trackEvent('add_to_cart', {
        product_id: productId,
        product_name: productName,
        price: productPrice,
        variant: variant
    });
    
    // Add animation to cart button
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            cartBtn.style.transform = 'scale(1)';
        }, 200);
    }
}

function buyNow(button) {
    addToCart(button);
    
    // Track buy now event
    trackEvent('buy_now', {
        product_id: button.dataset.productId,
        product_name: button.dataset.productName,
        price: parseFloat(button.dataset.productPrice)
    });
    
    // Redirect to checkout after a short delay
    setTimeout(() => {
        window.location.href = '/pages/cart/index.html?checkout=true';
    }, 500);
}

function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        cartCountElement.style.display = cartCount > 0 ? 'flex' : 'none';
    }
}

// Toast notifications
function showToast(message, type = 'info', duration = 3000) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.classList.add('show'); });
    
    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

// Analytics and tracking
function initializeAnalytics() {
    // Track page view
    trackEvent('page_view', {
        page: window.location.pathname,
        title: document.title,
        referrer: document.referrer
    });
    
    // Track outbound links
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href^="http"]');
        if (link && !link.href.includes(window.location.hostname)) {
            trackEvent('outbound_click', {
                url: link.href,
                text: link.textContent.trim()
            });
        }
    });
}

function trackEvent(eventName, properties = {}) {
    // Add common properties
    const eventData = {
        event: eventName,
        timestamp: new Date().toISOString(),
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        ...properties
    };
    
    // Store in localStorage for batch sending
    let events = JSON.parse(localStorage.getItem('reweave-events') || '[]');
    events.push(eventData);
    
    // Keep only last 100 events
    if (events.length > 100) {
        events = events.slice(-100);
    }
    
    localStorage.setItem('reweave-events', JSON.stringify(events));
    
    // Try to send to analytics endpoint (if available)
    if (navigator.onLine) {
        sendAnalytics();
    }
}

function getSessionId() {
    let sessionId = sessionStorage.getItem('reweave-session-id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('reweave-session-id', sessionId);
    }
    return sessionId;
}

function sendAnalytics() {
    const events = JSON.parse(localStorage.getItem('reweave-events') || '[]');
    if (events.length === 0) return;
    
    const send = () => {
        fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events })
        })
        .then(response => {
            if (response.ok) {
                localStorage.setItem('reweave-events', '[]');
            }
        })
        .catch(() => {});
    };
    if ('requestIdleCallback' in window) {
        requestIdleCallback(send, { timeout: 1000 });
    } else {
        setTimeout(send, 0);
    }
}

// Utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('en-MY', {
        style: 'currency',
        currency: 'MYR'
    }).format(price);
}

function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    if (el.dataset && el.dataset.src) el.src = el.dataset.src;
                    io.unobserve(el);
                }
            });
        });
        images.forEach(img => io.observe(img));
        document.querySelectorAll('iframe[loading="lazy"]').forEach(f => io.observe(f));
    } else {
        images.forEach(img => { if (img.dataset && img.dataset.src) img.src = img.dataset.src; });
    }
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
}

function initializePerformanceObserver() {
    try {
        if ('PerformanceObserver' in window) {
            const po = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.entryType === 'largest-contentful-paint') {
                        trackEvent('perf_lcp', { value: entry.renderTime || entry.loadTime });
                    } else if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                        trackEvent('perf_cls', { value: entry.value });
                    }
                });
            });
            po.observe({ type: 'largest-contentful-paint', buffered: true });
            po.observe({ type: 'layout-shift', buffered: true });
        }
    } catch {}
}

function initializeResourceHints() {
    const addHint = (rel, href, crossOrigin = false) => {
        if (![...document.querySelectorAll(`link[rel="${rel}"][href="${href}"]`)].length) {
            const l = document.createElement('link');
            l.rel = rel;
            l.href = href;
            if (crossOrigin) l.crossOrigin = '';
            document.head.appendChild(l);
        }
    };
    addHint('preconnect', 'https://images.unsplash.com');
    addHint('dns-prefetch', '//images.unsplash.com');
    addHint('preconnect', 'https://cdnjs.cloudflare.com', true);
    addHint('dns-prefetch', '//cdnjs.cloudflare.com');
    addHint('preconnect', 'https://fonts.googleapis.com');
    addHint('dns-prefetch', '//fonts.googleapis.com');
    addHint('preconnect', 'https://fonts.gstatic.com', true);
    addHint('dns-prefetch', '//fonts.gstatic.com');
}

function optimizeImages() {
    const imgs = document.querySelectorAll('img');
    imgs.forEach((img, idx) => {
        if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
        const isLCP = img.classList.contains('main-image') || img.id === 'detail-image' || (idx === 0 && img.offsetTop < 600);
        if (!isLCP && !img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
        if (isLCP && !img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'high');
        const src = img.getAttribute('src') || '';
        if (src.includes('images.unsplash.com') && src.includes('w=')) {
            try {
                const parts = src.split('?');
                const base = parts[0];
                const qs = new URLSearchParams(parts[1] || '');
                const q = qs.get('q') || '80';
                const fmt = qs.get('auto') || 'format';
                const fit = qs.get('fit') || 'crop';
                const build = (w) => `${base}?ixlib=rb-1.2.1&auto=${fmt}&fit=${fit}&w=${w}&q=${q}`;
                const set = [300, 600, 900].map(w => `${build(w)} ${w}w`).join(', ');
                img.setAttribute('srcset', set);
                if (!img.hasAttribute('sizes')) img.setAttribute('sizes', '(max-width: 768px) 100vw, 600px');
            } catch {}
        }
    });
    document.querySelectorAll('iframe').forEach(f => {
        if (!f.hasAttribute('loading')) f.setAttribute('loading', 'lazy');
    });
}

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', initializeLazyLoading);

// Handle offline/online events
window.addEventListener('online', () => {
    showToast('Connection restored', 'success', 2000);
    sendAnalytics(); // Try to send any pending analytics
});

window.addEventListener('offline', () => {
    showToast('You are offline', 'warning', 2000);
});

// Export functions for use in other scripts
window.Reweave = {
    addToCart,
    buyNow,
    showToast,
    trackEvent,
    formatPrice,
    debounce,
    throttle
};