// Simple cart functionality
class SimpleCart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('cart')) || [];
    this.updateCartDisplay();
  }

  addToCart(product) {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
    
    this.saveCart();
    this.updateCartDisplay();
    this.showAddedMessage(product.name);
  }

  removeFromCart(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartDisplay();
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        this.saveCart();
        this.updateCartDisplay();
      }
    }
  }

  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  updateCartDisplay() {
    const cartTotal = document.querySelector('.text-dark.ms-2');
    const cartCount = document.querySelector('.cart-count');
    
    if (cartTotal) {
      cartTotal.textContent = `$${this.getTotal().toFixed(2)}`;
    }
    
    if (cartCount) {
      cartCount.textContent = this.getItemCount();
    }
  }

  showAddedMessage(productName) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <div class="alert alert-success alert-dismissible fade show position-fixed" style="top: 20px; right: 20px; z-index: 9999;">
        <strong>${productName}</strong> added to cart!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 3000);
  }
}

// Initialize cart
window.cart = new SimpleCart();

// Add event listeners to all "Add to Cart" buttons
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    attachCartListeners();
  }, 500);
});

function attachCartListeners() {
  const buttons = document.querySelectorAll('a, button');
  buttons.forEach(button => {
    if (button.textContent.includes('Add To Cart') || button.innerHTML.includes('Add To Cart')) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        
        const productCard = this.closest('.product-item, .products-mini-item, .product-item-inner');
        if (productCard) {
          const product = extractProductInfo(productCard);
          window.cart.addToCart(product);
        }
      });
    }
  });
}

function extractProductInfo(productCard) {
  const nameElement = productCard.querySelector('.h4, h4, .d-block.h4');
  const priceElement = productCard.querySelector('.text-primary.fs-5, .text-primary');
  const imageElement = productCard.querySelector('img');
  
  let name = 'Product';
  if (nameElement) {
    name = nameElement.textContent.trim();
  } else {
    const linkElement = productCard.querySelector('a[href="#"]');
    if (linkElement && linkElement.textContent.includes('Apple')) {
      name = linkElement.textContent.trim();
    }
  }
  
  const priceText = priceElement ? priceElement.textContent.trim() : '$1050.00';
  const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 1050;
  const image = imageElement ? imageElement.src : '';
  
  return {
    id: Date.now() + Math.random(),
    name: name,
    price: price,
    image: image
  };
}