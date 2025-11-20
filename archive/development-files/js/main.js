// Reweave Website - Main JavaScript
// One‑page interactions scoped to #onepage

document.addEventListener('DOMContentLoaded', function() {
  const onepageRoot = document.getElementById('onepage');
  if (!onepageRoot) return; // Only run on one-page

  // Helper: format to RM currency
  const formatMYR = (n) => `RM ${Number(n).toFixed(2)}`;

  // Cart count sync
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    const badge = document.querySelector('.cart-count');
    if (badge) badge.textContent = String(count);
  }
  updateCartCount();

  // Product data aligned to onepage cards
  const products = {
    'pickle-tote': {
      id: 'pickle-tote',
      name: 'Reweave Pickleball Tote',
      basePrice: 149,
      images: {
        'Deep Plum': 'images/Batik Front (WIP).png',
        'Indigo': 'images/Batik Front (WIP) (1).png',
        'Matte Black': 'images/Gemini_Generated_Image_mwmxxemwmxxemwmx.png'
      },
      defaultColor: 'Deep Plum'
    },
    'luxe-mini': {
      id: 'luxe-mini',
      name: 'Reweave Luxe Mini',
      prices: { Songket: 129, 'Batik/Cotton': 119 },
      images: {
        'Deep Plum': 'images/Gemini_Generated_Image_mwmxxemwmxxemwmx.png',
        'Olive': 'images/Gemini_Generated_Image_j8e9c1j8e9c1j8e9.png',
        'Matte Black': 'images/Batik Front (WIP).png'
      },
      defaultColor: 'Deep Plum',
      defaultMaterial: 'Songket'
    },
    'luxe-petite': {
      id: 'luxe-petite',
      name: 'Reweave Luxe Petite',
      prices: { Songket: 129, 'Batik/Cotton': 119 },
      images: {
        'Deep Plum': 'images/Gemini_Generated_Image_j8e9c1j8e9c1j8e9.png',
        'Indigo': 'images/Gemini_Generated_Image_mwmxxemwmxxemwmx.png',
        'Matte Black': 'images/Batik Front (WIP).png'
      },
      defaultColor: 'Deep Plum',
      defaultMaterial: 'Songket'
    }
  };

  function setSelectedSwatch(card, color) {
    card.querySelectorAll('.swatch').forEach(s => s.setAttribute('aria-selected', 'false'));
    const active = card.querySelector(`.swatch[data-color="${CSS.escape(color)}"]`);
    if (active) active.setAttribute('aria-selected', 'true');
  }

  function updateImage(card, sku, color) {
    const imgEl = card.querySelector('.main-image');
    const prod = products[sku];
    const src = prod?.images[color] || Object.values(prod.images)[0];
    if (imgEl && src) imgEl.src = src;
  }

  function getSelectedColor(card) {
    const selected = card.querySelector('.swatch[aria-selected="true"]');
    return selected ? selected.getAttribute('data-color') : null;
  }

  function addToCart(item) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.id === item.id && i.options === item.options);
    if (existing) existing.qty += item.qty; else cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    trackEvent('add_to_cart', { id: item.id, name: item.name, price: item.price, options: item.options });
  }

  // Sticky buy bar state
  const sticky = {
    el: document.getElementById('stickyBuy'),
    titleEl: document.getElementById('stickyTitle'),
    variantEl: document.getElementById('stickyVariant'),
    priceEl: document.getElementById('stickyPrice'),
    buyBtn: document.getElementById('stickyBuyNow'),
    fpxBtn: document.getElementById('stickyFPX'),
    current: null
  };

  // Lead modal helpers (scoped to onepage)
  const leadModal = document.getElementById('leadModal');
  const leadNameEl = document.getElementById('leadName');
  const leadPhoneEl = document.getElementById('leadPhone');
  const leadInterestEl = document.getElementById('leadInterest');
  const leadCancelBtn = document.getElementById('leadCancel');
  const leadJoinBtn = document.getElementById('leadJoin');

  function openLeadModal(prefill = {}) {
    if (!leadModal) return;
    if (prefill.interest && leadInterestEl) leadInterestEl.value = prefill.interest;
    leadModal.style.display = 'block';
    leadModal.setAttribute('aria-hidden', 'false');
  }
  function closeLeadModal() {
    if (!leadModal) return;
    leadModal.style.display = 'none';
    leadModal.setAttribute('aria-hidden', 'true');
  }
  function saveLead(lead) {
    // Try backend first; fallback to localStorage on failure
    const apiUrl = window.location.origin.includes('localhost') ? 'http://localhost:3001' : window.location.origin;
    fetch(`${apiUrl}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...lead, source: 'onepage' })
    })
    .then(r => r.json())
    .then(data => {
      if (!data.ok) throw new Error('backend_reject');
    })
    .catch(() => {
      const leads = JSON.parse(localStorage.getItem('leads') || '[]');
      leads.push({ ...lead, ts: Date.now() });
      localStorage.setItem('leads', JSON.stringify(leads));
    })
    .finally(() => {
      localStorage.setItem('leadSubscribed', '1');
      sessionStorage.setItem('assistDismissed', 'true');
    });
  }
  if (leadCancelBtn) leadCancelBtn.addEventListener('click', closeLeadModal);
  if (leadJoinBtn) leadJoinBtn.addEventListener('click', () => {
    const name = leadNameEl?.value?.trim() || '';
    const phone = leadPhoneEl?.value?.trim() || '';
    const interest = leadInterestEl?.value || 'All';
    if (!phone) {
      alert('Please enter your WhatsApp number.');
      return;
    }
    saveLead({ name, phone, interest });
    trackEvent('lead_submit', { name: name ? 'yes' : 'no', phone: 'provided', interest });
    closeLeadModal();
    alert('Thanks! We will message you on WhatsApp for updates.');
  });

  function syncSticky(card, prod) {
    if (!sticky.el) return;
    const name = card.querySelector('.product-title').textContent.trim();
    const color = (card.querySelector('.swatch[aria-selected="true"]')?.getAttribute('data-color')) || prod.defaultColor || '';
    const materialBtn = card.querySelector('.material-btn[aria-pressed="true"]');
    const material = materialBtn ? materialBtn.getAttribute('data-material') : null;
    // compute price from DOM datasets or product config
    const priceEl = card.querySelector('.product-price');
    let price = 0;
    if (material && prod.prices) {
      price = prod.prices[material] || 0;
    } else if (priceEl?.dataset.priceSongket || priceEl?.dataset.priceBatik) {
      const key = material === 'Songket' ? 'priceSongket' : 'priceBatik';
      price = Number(priceEl.dataset[key]) || 0;
    } else if (priceEl?.dataset.price) {
      price = Number(priceEl.dataset.price) || 0;
    } else {
      price = prod.basePrice || prod.price || 0;
    }

    const variantText = material ? `${material} • ${color}` : `${color}`;
    sticky.titleEl.textContent = name;
    sticky.variantEl.textContent = variantText;
    sticky.priceEl.textContent = formatMYR(price);
    sticky.current = { id: prod.id, name, price, color, material, image: card.querySelector('.main-image')?.src };
    sticky.el.style.display = 'block';
    trackEvent('sticky_show', { id: prod.id, name, variant: variantText, price });

    // Wire sticky actions
    if (sticky.buyBtn) {
      sticky.buyBtn.onclick = () => {
        const item = {
          id: prod.id,
          name,
          price,
          qty: 1,
          image: sticky.current.image,
          options: material ? `Material: ${material} • Color: ${color}` : `Color: ${color}`,
          addon: false
        };
        addToCart(item);
        trackEvent('checkout_initiate', { id: prod.id, name, price, variant: variantText });
        window.location.href = 'pages/cart/index.html';
      };
    }
    if (sticky.fpxBtn) {
      sticky.fpxBtn.onclick = () => {
        const params = new URLSearchParams({
          id: prod.id,
          name,
          price: String(price),
          variant: variantText,
        });
        trackEvent('fpx_initiate', { id: prod.id, name, price, variant: variantText });
        window.location.href = `pages/checkout/fpx.html?${params.toString()}`;
      };
    }
  }

  onepageRoot.querySelectorAll('.product-card').forEach((card) => {
    const sku = card.getAttribute('data-sku');
    const prod = products[sku];
    if (!prod) return;

    // Initialize default selection
    setSelectedSwatch(card, prod.defaultColor);
    updateImage(card, sku, prod.defaultColor);
    // Initialize material
    const defaultMaterialBtn = card.querySelector(`.material-btn[data-material="${prod.defaultMaterial || ''}"]`);
    if (defaultMaterialBtn) defaultMaterialBtn.setAttribute('aria-pressed', 'true');

    // Swatch interactions
    card.querySelectorAll('.swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        const color = swatch.getAttribute('data-color');
        setSelectedSwatch(card, color);
        updateImage(card, sku, color);
        syncSticky(card, prod);
        trackEvent('swatch_change', { id: prod.id, color });
      });
    });

    // Material interactions
    card.querySelectorAll('.material-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        card.querySelectorAll('.material-btn').forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        const priceEl = card.querySelector('.product-price');
        const material = btn.getAttribute('data-material');
        let price = 0;
        if (priceEl?.dataset.priceSongket || priceEl?.dataset.priceBatik) {
          const key = material === 'Songket' ? 'priceSongket' : 'priceBatik';
          price = Number(priceEl.dataset[key]) || 0;
        } else if (prod.prices) {
          price = prod.prices[material] || 0;
        }
        priceEl.textContent = formatMYR(price);
        syncSticky(card, prod);
        trackEvent('material_change', { id: prod.id, material, price });
      });
    });

    // Add to Cart
    const addBtn = card.querySelector('.add-to-cart');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const color = getSelectedColor(card) || prod.defaultColor;
        const imgEl = card.querySelector('.main-image');
        const image = imgEl ? imgEl.src : Object.values(prod.images)[0];
        const material = card.querySelector('.material-btn[aria-pressed="true"]')?.getAttribute('data-material');
        const priceEl = card.querySelector('.product-price');
        const price = material && prod.prices ? prod.prices[material] : (Number(priceEl?.dataset.price) || prod.basePrice || prod.price || 0);
        const item = {
          id: prod.id,
          name: prod.name,
          price: price,
          qty: 1,
          image: image,
          options: material ? `Material: ${material} • Color: ${color}` : `Color: ${color}`,
          addon: false
        };
        addToCart(item);
        syncSticky(card, prod);
        trackEvent('add_to_cart_click', { id: prod.id });
      });
    }

    // Buy Now -> add then go to cart
    const buyBtn = card.querySelector('.buy-now');
    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        const color = getSelectedColor(card) || prod.defaultColor;
        const imgEl = card.querySelector('.main-image');
        const image = imgEl ? imgEl.src : Object.values(prod.images)[0];
        const material = card.querySelector('.material-btn[aria-pressed="true"]')?.getAttribute('data-material');
        const priceEl = card.querySelector('.product-price');
        const price = material && prod.prices ? prod.prices[material] : (Number(priceEl?.dataset.price) || prod.basePrice || prod.price || 0);
        const item = {
          id: prod.id,
          name: prod.name,
          price: price,
          qty: 1,
          image: image,
          options: material ? `Material: ${material} • Color: ${color}` : `Color: ${color}`,
          addon: false
        };
        addToCart(item);
        trackEvent('buy_now_click', { id: prod.id });
        window.location.href = 'pages/cart/index.html';
      });
    }

    // Removed WhatsApp CTA: lead capture is handled via contextual triggers below.

    // Show sticky when user interacts within card
    card.addEventListener('click', (e) => {
      const interactors = ['SWATCH', 'BUTTON'];
      if (interactors.includes(e.target.tagName) || e.target.closest('.swatch') || e.target.closest('.material-btn')) {
        syncSticky(card, prod);
      }
    });
  });

  // Cookie consent banner
  const cookieBanner = document.getElementById('cookieConsent');
  const consentStatus = localStorage.getItem('cookieConsent');
  if (cookieBanner && (consentStatus !== 'accepted')) {
    cookieBanner.style.display = 'block';
    const acceptBtn = document.getElementById('cookieAccept');
    const dismissBtn = document.getElementById('cookieDismiss');
    if (acceptBtn) acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'accepted');
      trackEvent('cookie_accept');
      cookieBanner.style.display = 'none';
    });
    if (dismissBtn) dismissBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'dismissed');
      trackEvent('cookie_dismiss');
      cookieBanner.style.display = 'none';
    });
  }

  // Assist bubble removed on homepage; no visual lead prompts.

  // Smarter lead capture triggers (rate-limited)
  const LEAD_FLAG = 'leadSubscribed';
  const LEAD_SHOWN_SESSION = 'leadModalShownSession';
  const SITE_VISITS = 'siteVisits';
  const hasLead = !!localStorage.getItem(LEAD_FLAG);
  const alreadyShown = !!sessionStorage.getItem(LEAD_SHOWN_SESSION);

  function safeOpenLeadModal(meta = {}) {
    if (hasLead || sessionStorage.getItem(LEAD_SHOWN_SESSION)) return;
    openLeadModal(meta);
    sessionStorage.setItem(LEAD_SHOWN_SESSION, '1');
    trackEvent('lead_modal_open', { source: meta.source || 'trigger', ...meta });
  }

  // Exit intent (desktop): show when mouse nears top, only once
  function enableExitIntent() {
    let armed = true;
    function handler(e) {
      if (!armed) return;
      if (e.clientY <= 8) {
        armed = false;
        window.removeEventListener('mousemove', handler);
        safeOpenLeadModal({ source: 'exit_intent' });
      }
    }
    window.addEventListener('mousemove', handler);
  }

  // Time + scroll depth (mobile-friendly): after 30s and 50% scroll
  function enableTimeScrollTrigger() {
    let timeOk = false;
    let scrollOk = false;
    function maybeFire() {
      if (timeOk && scrollOk) {
        window.removeEventListener('scroll', onScroll);
        safeOpenLeadModal({ source: 'time_scroll' });
      }
    }
    function onScroll() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      if (h > 0 && y / h >= 0.5) {
        scrollOk = true;
        maybeFire();
      }
    }
    window.addEventListener('scroll', onScroll);
    setTimeout(() => { timeOk = true; maybeFire(); }, 30000);
  }

  // Return visitor gentle nudge: second visit, show after 20s
  (function recordAndMaybeNudge() {
    const v = parseInt(localStorage.getItem(SITE_VISITS) || '0', 10) + 1;
    localStorage.setItem(SITE_VISITS, String(v));
    if (v >= 2) {
      setTimeout(() => safeOpenLeadModal({ source: 'return_visitor' }), 20000);
    }
  })();

  // Add-to-cart trigger: after successful add, open once
  const originalAddToCart = window.addToCart;
  if (typeof originalAddToCart === 'function') {
    window.addToCart = function (...args) {
      const res = originalAddToCart.apply(this, args);
      try { safeOpenLeadModal({ source: 'post_add_to_cart' }); } catch (_) {}
      return res;
    };
  }

  if (!hasLead && !alreadyShown) {
    enableExitIntent();
    enableTimeScrollTrigger();
  }
});

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    }
    
    // Set active navigation state
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage || 
            (currentPage.includes(link.getAttribute('href')) && link.getAttribute('href') !== '../../index.html')) {
            link.classList.add('active');
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Lazy loading images
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Add animation class to elements when they come into view
    const animateElements = document.querySelectorAll('.animate');
    
    if (animateElements.length > 0 && 'IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    animationObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        animateElements.forEach(element => {
            animationObserver.observe(element);
        });
    }
});

// Product filtering functionality for shop page
function filterProducts() {
    const filterForm = document.getElementById('filter-form');
    if (!filterForm) return;
    
    const products = document.querySelectorAll('.product-card');
    
    filterForm.addEventListener('change', function() {
        const collection = document.querySelector('input[name="collection"]:checked')?.value || 'all';
        const material = document.querySelector('input[name="material"]:checked')?.value || 'all';
        const color = document.querySelector('input[name="color"]:checked')?.value || 'all';
        const useCase = document.querySelector('input[name="use-case"]:checked')?.value || 'all';
        
        products.forEach(product => {
            const productCollection = product.dataset.collection;
            const productMaterial = product.dataset.material;
            const productColor = product.dataset.color;
            const productUseCase = product.dataset.useCase;
            
            const collectionMatch = collection === 'all' || productCollection === collection;
            const materialMatch = material === 'all' || productMaterial === material;
            const colorMatch = color === 'all' || productColor === color;
            const useCaseMatch = useCase === 'all' || productUseCase === useCase;
            
            if (collectionMatch && materialMatch && colorMatch && useCaseMatch) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    });
}

// Try-on feature basic functionality
function initTryOn() {
    const tryOnContainer = document.getElementById('try-on-container');
    if (!tryOnContainer) return;
    
    const fileInput = document.getElementById('image-upload');
    const cameraBtn = document.getElementById('camera-btn');
    const previewContainer = document.getElementById('preview-container');
    const productOverlay = document.getElementById('product-overlay');
    
    // Handle file upload
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                previewContainer.innerHTML = `<img src="${event.target.result}" alt="User uploaded image">`;
                
                // In a real implementation, we would now detect pose and overlay the product
                setTimeout(() => {
                    if (productOverlay) {
                        productOverlay.style.display = 'block';
                    }
                }, 1000);
            };
            reader.readAsDataURL(file);
        });
    }
    
    // Handle camera access
    if (cameraBtn) {
        cameraBtn.addEventListener('click', function() {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert('Camera access is not supported by your browser');
                return;
            }
            
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    const videoElement = document.createElement('video');
                    videoElement.srcObject = stream;
                    videoElement.autoplay = true;
                    previewContainer.innerHTML = '';
                    previewContainer.appendChild(videoElement);
                    
                    // Add capture button
                    const captureBtn = document.createElement('button');
                    captureBtn.textContent = 'Capture';
                    captureBtn.className = 'btn';
                    previewContainer.appendChild(captureBtn);
                    
                    captureBtn.addEventListener('click', function() {
                        const canvas = document.createElement('canvas');
                        canvas.width = videoElement.videoWidth;
                        canvas.height = videoElement.videoHeight;
                        canvas.getContext('2d').drawImage(videoElement, 0, 0);
                        
                        // Stop camera stream
                        stream.getTracks().forEach(track => track.stop());
                        
                        // Display captured image
                        previewContainer.innerHTML = '';
                        previewContainer.appendChild(canvas);
                        
                        // In a real implementation, we would now detect pose and overlay the product
                        setTimeout(() => {
                            if (productOverlay) {
                                productOverlay.style.display = 'block';
                            }
                        }, 1000);
                    });
                })
                .catch(error => {
                    console.error('Error accessing camera:', error);
                    alert('Could not access camera: ' + error.message);
                });
        });
    }
}

// Community gallery functionality
function initCommunityGallery() {
    const galleryContainer = document.getElementById('community-gallery');
    if (!galleryContainer) return;
    
    // Like functionality
    galleryContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('like-btn')) {
            e.preventDefault();
            const likeCount = e.target.querySelector('.like-count');
            if (likeCount) {
                let count = parseInt(likeCount.textContent);
                likeCount.textContent = count + 1;
                e.target.classList.add('liked');
            }
        }
    });
    
    // Filter posts by tag
    const tagFilters = document.querySelectorAll('.tag-filter');
    const posts = document.querySelectorAll('.community-post');
    
    tagFilters.forEach(filter => {
        filter.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all filters
            tagFilters.forEach(f => f.classList.remove('active'));
            
            // Add active class to clicked filter
            this.classList.add('active');
            
            const tag = this.dataset.tag;
            
            // Show/hide posts based on tag
            posts.forEach(post => {
                if (tag === 'all' || post.dataset.tags.includes(tag)) {
                    post.style.display = 'block';
                } else {
                    post.style.display = 'none';
                }
            });
        });
    });
}

// Initialize all functions
window.addEventListener('load', function() {
    filterProducts();
    initTryOn();
    initCommunityGallery();
});
  // Tracking helper
  function trackEvent(type, payload = {}) {
    const apiUrl = window.location.origin.includes('localhost') ? 'http://localhost:3001' : window.location.origin;
    fetch(`${apiUrl}/api/events`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload })
    }).catch(() => {
      const events = JSON.parse(localStorage.getItem('events') || '[]');
      events.push({ type, payload, ts: Date.now() });
      localStorage.setItem('events', JSON.stringify(events));
    });
  }

  // Page view
  trackEvent('page_view', { page: 'onepage' });