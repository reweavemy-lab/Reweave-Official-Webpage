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
    const header = document.querySelector('.luxury-header');
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
});