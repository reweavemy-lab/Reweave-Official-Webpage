// Reweave Website - Main JavaScript

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