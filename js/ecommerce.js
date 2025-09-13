// E-commerce functionality
class EcommerceApp {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('cart')) || [];
    this.products = [];
    this.init();
  }

  async init() {
    await this.loadProducts();
    this.updateCartUI();
    this.bindEvents();
  }

  async loadProducts() {
    try {
      // Load from API when available, fallback to mock data
      this.products = this.getMockProducts();
      this.renderProducts();
    } catch (error) {
      console.error('Error loading products:', error);
      this.products = this.getMockProducts();
      this.renderProducts();
    }
  }

  getMockProducts() {
    return [
      {
        id: '1',
        name: 'Apple iPad Mini G2356',
        description: 'Latest iPad Mini with advanced features',
        price: 1050.00,
        originalPrice: 1250.00,
        category: 'SmartPhone',
        imageUrl: 'img/product-3.png',
        inStock: true,
        featured: true,
        isNew: true,
        onSale: false,
        rating: 4.5
      },
      {
        id: '2',
        name: 'Smart Camera Pro',
        description: 'Professional camera with smart features',
        price: 899.99,
        originalPrice: 1199.99,
        category: 'Camera',
        imageUrl: 'img/product-4.png',
        inStock: true,
        featured: false,
        isNew: false,
        onSale: true,
        rating: 4.8
      }
    ];
  }

  renderProducts() {
    // Update product displays with real data
    const productElements = document.querySelectorAll('.product-item');
    productElements.forEach((element, index) => {
      if (this.products[index]) {
        const product = this.products[index];
        const nameEl = element.querySelector('h4 a');
        const priceEl = element.querySelector('.text-primary.fs-5');
        const originalPriceEl = element.querySelector('del');
        const addToCartBtn = element.querySelector('.btn-primary');
        
        if (nameEl) nameEl.textContent = product.name;
        if (priceEl) priceEl.textContent = `$${product.price.toFixed(2)}`;
        if (originalPriceEl) originalPriceEl.textContent = `$${product.originalPrice.toFixed(2)}`;
        if (addToCartBtn) {
          addToCartBtn.onclick = (e) => {
            e.preventDefault();
            this.addToCart(product);
          };
        }
      }
    });
  }

  addToCart(product, quantity = 1) {
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: quantity
      });
    }
    
    this.saveCart();
    this.updateCartUI();
    this.showNotification(`${product.name} added to cart!`);
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartUI();
  }

  updateCartQuantity(productId, quantity) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        this.saveCart();
        this.updateCartUI();
      }
    }
  }

  getCartTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getCartItemCount() {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  updateCartUI() {
    // Update cart count and total in header
    const cartTotal = document.querySelector('.text-dark.ms-2');
    const cartCount = document.querySelector('.cart-count');
    
    if (cartTotal) {
      cartTotal.textContent = `$${this.getCartTotal().toFixed(2)}`;
    }
    
    if (cartCount) {
      cartCount.textContent = this.getCartItemCount();
    }
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  bindEvents() {
    // Search functionality
    const searchBtn = document.querySelector('.btn-primary[type="button"]');
    const searchInput = document.querySelector('input[placeholder="Search Looking For?"]');
    
    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', () => {
        this.searchProducts(searchInput.value);
      });
      
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.searchProducts(searchInput.value);
        }
      });
    }

    // Category filter
    const categoryLinks = document.querySelectorAll('.categories-bars a');
    categoryLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = link.textContent.trim();
        this.filterByCategory(category);
      });
    });
  }

  searchProducts(query) {
    if (!query.trim()) return;
    
    const filteredProducts = this.products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );
    
    console.log('Search results:', filteredProducts);
    // Update UI with filtered products
  }

  filterByCategory(category) {
    const filteredProducts = this.products.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
    
    console.log('Category filter results:', filteredProducts);
    // Update UI with filtered products
  }

  async checkout() {
    if (this.cart.length === 0) {
      this.showNotification('Your cart is empty!', 'error');
      return;
    }

    const orderData = {
      customerEmail: 'customer@example.com', // Get from form
      customerName: 'Customer Name', // Get from form
      items: this.cart.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: this.getCartTotal(),
      status: 'PENDING',
      shippingAddress: 'Customer Address' // Get from form
    };

    try {
      // Create order via API
      console.log('Creating order:', orderData);
      this.cart = [];
      this.saveCart();
      this.updateCartUI();
      this.showNotification('Order placed successfully!', 'success');
    } catch (error) {
      console.error('Error creating order:', error);
      this.showNotification('Error placing order. Please try again.', 'error');
    }
  }

  showNotification(message, type = 'success') {
    // Create and show notification
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize the e-commerce app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.ecommerceApp = new EcommerceApp();
});