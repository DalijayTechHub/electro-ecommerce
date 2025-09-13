// Make all buttons and links functional
document.addEventListener('DOMContentLoaded', function() {
    
    // Search functionality
    const searchButton = document.querySelector('button[type="button"]:has(i.fas.fa-search)');
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
            }
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });
    }

    // Newsletter signup
    const newsletterButton = document.querySelector('button:contains("SignUp")');
    const newsletterInput = document.querySelector('input[placeholder*="email"]');
    
    if (newsletterButton && newsletterInput) {
        newsletterButton.addEventListener('click', function() {
            const email = newsletterInput.value.trim();
            if (email && email.includes('@')) {
                alert('Thank you for subscribing to our newsletter!');
                newsletterInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }

    // Product view buttons (eye icons)
    document.querySelectorAll('a:has(i.fa-eye)').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-item, .products-mini-item');
            if (productCard) {
                const product = extractProductInfo(productCard);
                showProductModal(product);
            }
        });
    });

    // Wishlist buttons (heart icons)
    document.querySelectorAll('a:has(i.fa-heart)').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-item, .products-mini-item');
            if (productCard) {
                const product = extractProductInfo(productCard);
                addToWishlist(product);
                this.querySelector('i').style.color = '#dc3545';
                showToast(`${product.name} added to wishlist!`);
            }
        });
    });

    // Compare buttons (random icons)
    document.querySelectorAll('a:has(i.fa-random)').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-item, .products-mini-item');
            if (productCard) {
                const product = extractProductInfo(productCard);
                addToCompare(product);
                showToast(`${product.name} added to compare!`);
            }
        });
    });

    // Shop Now buttons
    document.querySelectorAll('a:contains("Shop Now")').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'shop.html';
        });
    });

    // Category filter buttons
    document.querySelectorAll('.nav-pills a[data-bs-toggle="pill"]').forEach(button => {
        button.addEventListener('click', function() {
            const category = this.textContent.trim();
            filterProductsByCategory(category);
        });
    });

    // Back to top button
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });
        
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

// Helper functions
function extractProductInfo(productCard) {
    const nameElement = productCard.querySelector('a[class*="h4"], .h4, h4');
    const priceElement = productCard.querySelector('.text-primary.fs-5, .text-primary');
    const imageElement = productCard.querySelector('img');
    
    const name = nameElement ? nameElement.textContent.trim() : 'Product';
    const priceText = priceElement ? priceElement.textContent.trim() : '$0.00';
    const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
    const image = imageElement ? imageElement.src : '';
    
    return {
        id: Date.now() + Math.random(),
        name: name,
        price: price,
        image: image
    };
}

function showProductModal(product) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${product.name}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <img src="${product.image}" class="img-fluid" alt="${product.name}">
                        </div>
                        <div class="col-md-6">
                            <h4>$${product.price.toFixed(2)}</h4>
                            <p>High-quality product with excellent features and performance.</p>
                            <button class="btn btn-primary" onclick="window.cart.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                                <i class="fas fa-shopping-cart me-2"></i>Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    modal.addEventListener('hidden.bs.modal', function() {
        modal.remove();
    });
}

function addToWishlist(product) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const exists = wishlist.find(item => item.id === product.id);
    
    if (!exists) {
        wishlist.push(product);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
}

function addToCompare(product) {
    let compareList = JSON.parse(localStorage.getItem('compare')) || [];
    const exists = compareList.find(item => item.id === product.id);
    
    if (!exists && compareList.length < 4) {
        compareList.push(product);
        localStorage.setItem('compare', JSON.stringify(compareList));
    } else if (compareList.length >= 4) {
        showToast('You can only compare up to 4 products!');
    }
}

function filterProductsByCategory(category) {
    const products = document.querySelectorAll('.product-item');
    
    products.forEach(product => {
        if (category === 'All Products') {
            product.style.display = 'block';
        } else {
            const productCategory = product.querySelector('a').textContent.trim();
            product.style.display = productCategory.includes(category) ? 'block' : 'none';
        }
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show position-fixed" style="top: 20px; right: 20px; z-index: 9999;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}

// Fix jQuery selector for text content
jQuery.expr[':'].contains = function(a, i, m) {
    return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};