# Electro E-commerce - MySQL Backend Deployment Guide

## Overview
This deployment guide integrates MySQL database with AWS Amplify for the Electro e-commerce application, providing:
- **Frontend**: Bootstrap 5 responsive e-commerce template
- **Backend**: Node.js API with MySQL database
- **Authentication**: AWS Cognito for user management
- **Database**: MySQL for products, orders, users, and cart data
- **Images**: S3 bucket for product images
- **Hosting**: AWS Amplify with environment variables

## Architecture
```
Frontend (Amplify) → API Gateway → Lambda Functions → MySQL Database
                  ↓
              S3 (Images) + Cognito (Auth)
```

## Prerequisites
- AWS Account with Amplify access
- MySQL database (AWS RDS, PlanetScale, or external)
- GitHub repository: `https://github.com/DalijayTechHub/electro-ecommerce`

## Step 1: MySQL Database Setup

### Option A: AWS RDS MySQL
1. Go to RDS Console: https://console.aws.amazon.com/rds/
2. Click **"Create database"**
3. Choose **MySQL**
4. Template: **Free tier** (for testing)
5. DB instance identifier: **electro-ecommerce-db**
6. Master username: **admin**
7. Master password: **[secure-password]**
8. DB instance class: **db.t3.micro**
9. Storage: **20 GB**
10. **Enable public access** (for development)
11. Create database

### Option B: PlanetScale (Recommended)
1. Go to https://planetscale.com/
2. Create account and new database
3. Database name: **electro-ecommerce**
4. Region: **us-east**
5. Get connection string

## Step 2: Database Schema

Create these tables in your MySQL database:

```sql
-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    cognito_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category_id INT,
    image_url VARCHAR(500),
    in_stock BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    on_sale BOOLEAN DEFAULT FALSE,
    rating DECIMAL(2,1) DEFAULT 0,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Orders table
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address JSON,
    billing_address JSON,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Cart table
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Wishlist table
CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_user_product (user_id, product_id)
);
```

## Step 3: Backend API Setup

Create API directory structure:
```
api/
├── package.json
├── index.js
├── config/
│   └── database.js
├── models/
│   ├── Product.js
│   ├── Order.js
│   ├── User.js
│   └── Cart.js
├── routes/
│   ├── products.js
│   ├── orders.js
│   ├── cart.js
│   └── auth.js
└── middleware/
    └── auth.js
```

### package.json
```json
{
  "name": "electro-ecommerce-api",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "uuid": "^9.0.0",
    "aws-jwt-verify": "^4.0.1"
  }
}
```

### api/index.js
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### api/config/database.js
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

module.exports = pool;
```

### api/routes/products.js
```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all products
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.in_stock = true
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get products by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.category_id = ? AND p.in_stock = true
      ORDER BY p.created_at DESC
    `, [req.params.categoryId]);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### api/routes/orders.js
```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');

// Create order
router.post('/', auth, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const orderId = uuidv4();
    const { items, totalAmount, shippingAddress, billingAddress } = req.body;
    
    // Create order
    await connection.execute(`
      INSERT INTO orders (id, user_id, customer_email, customer_name, total_amount, shipping_address, billing_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId,
      req.user.sub,
      req.user.email,
      req.user.name,
      totalAmount,
      JSON.stringify(shippingAddress),
      JSON.stringify(billingAddress)
    ]);
    
    // Add order items
    for (const item of items) {
      await connection.execute(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `, [orderId, item.productId, item.quantity, item.price]);
    }
    
    // Clear cart
    await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.sub]);
    
    await connection.commit();
    res.json({ orderId, status: 'success' });
    
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Get user orders
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT o.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'productId', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price,
            'productName', p.name
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.user.sub]);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## Step 4: AWS Amplify Deployment

### 1. Create amplify.yml
```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - cd api && npm install
frontend:
  phases:
    preBuild:
      commands:
        - echo "Installing dependencies..."
    build:
      commands:
        - echo "Building frontend..."
  artifacts:
    baseDirectory: /
    files:
      - '**/*'
  cache:
    paths:
      - api/node_modules/**/*
```

### 2. Environment Variables in Amplify
Go to Amplify Console → App Settings → Environment Variables:

```
DB_HOST=your-mysql-host
DB_USER=your-mysql-username  
DB_PASSWORD=your-mysql-password
DB_NAME=electro_ecommerce
DB_PORT=3306
DB_SSL=true
COGNITO_USER_POOL_ID=us-east-1_Phg4oT68F
COGNITO_REGION=us-east-1
```

### 3. Update Frontend Configuration

Create `js/mysql-config.js`:
```javascript
// MySQL API configuration
const API_BASE_URL = window.location.origin + '/api';

class MySQLAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  getAuthToken() {
    // Get token from Cognito session
    return localStorage.getItem('cognitoToken');
  }

  // Products
  async getProducts() {
    return this.request('/products');
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async getProductsByCategory(categoryId) {
    return this.request(`/products/category/${categoryId}`);
  }

  // Orders
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getOrders() {
    return this.request('/orders');
  }

  // Cart
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(productId, quantity) {
    return this.request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  }

  async updateCartItem(itemId, quantity) {
    return this.request(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }

  async removeFromCart(itemId) {
    return this.request(`/cart/${itemId}`, {
      method: 'DELETE'
    });
  }
}

// Global API instance
window.mysqlAPI = new MySQLAPI();
```

## Step 5: Sample Data

Insert sample data into your MySQL database:

```sql
-- Insert categories
INSERT INTO categories (name, description, image_url) VALUES
('Smartphones', 'Latest smartphones and tablets', 'img/category-smartphones.jpg'),
('Laptops', 'Laptops and desktop computers', 'img/category-laptops.jpg'),
('Accessories', 'Tech accessories and gadgets', 'img/category-accessories.jpg'),
('Electronics', 'Consumer electronics', 'img/category-electronics.jpg');

-- Insert products
INSERT INTO products (name, description, price, original_price, category_id, image_url, featured, is_new, on_sale, rating, stock_quantity) VALUES
('Apple iPad Mini G2356', 'Latest iPad Mini with advanced features', 1050.00, 1250.00, 1, 'img/product-3.png', true, true, true, 4.5, 50),
('Samsung Galaxy Tab S8', 'Premium Android tablet', 899.00, 999.00, 1, 'img/product-4.png', true, false, true, 4.3, 30),
('MacBook Pro 13"', 'Apple MacBook Pro with M2 chip', 1299.00, 1399.00, 2, 'img/product-5.png', true, true, false, 4.8, 25),
('Dell XPS 15', 'High-performance Windows laptop', 1199.00, 1299.00, 2, 'img/product-6.png', false, false, true, 4.4, 20),
('Wireless Headphones', 'Premium noise-canceling headphones', 199.00, 249.00, 3, 'img/product-7.png', true, false, true, 4.2, 100),
('Smart Watch Series 8', 'Latest smartwatch with health tracking', 299.00, 349.00, 3, 'img/product-8.png', true, true, false, 4.6, 75);
```

## Step 6: Integration with Frontend

Update your existing JavaScript files to use MySQL API:

### Update `js/shop.js`:
```javascript
// Load products from MySQL
async function loadProducts(category = 'all') {
    try {
        let products;
        if (category === 'all') {
            products = await window.mysqlAPI.getProducts();
        } else {
            products = await window.mysqlAPI.getProductsByCategory(category);
        }
        
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products');
    }
}

function displayProducts(products) {
    const container = document.getElementById('products');
    container.innerHTML = products.map(product => `
        <div class="col-md-4 mb-4">
            <div class="card product-item">
                <img src="${product.image_url}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="text-muted">${product.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-primary fs-5">$${product.price}</span>
                        ${product.original_price ? `<small class="text-muted"><del>$${product.original_price}</del></small>` : ''}
                    </div>
                    <button class="btn btn-primary w-100 mt-2" onclick="addToCartMySQL(${product.id})">
                        <i class="fas fa-shopping-cart me-2"></i>Add To Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function addToCartMySQL(productId) {
    try {
        await window.mysqlAPI.addToCart(productId, 1);
        showToast('Product added to cart!');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Failed to add product to cart', 'error');
    }
}
```

## Step 7: Deployment Steps

1. **Push code to GitHub**:
```bash
git add .
git commit -m "Add MySQL backend integration"
git push origin main
```

2. **Deploy to Amplify**:
   - Go to Amplify Console
   - Select your app
   - Go to Environment Variables
   - Add all MySQL connection variables
   - Trigger new deployment

3. **Verify deployment**:
   - Check `/api/health` endpoint
   - Test product loading
   - Verify database connections

## Step 8: Security & Best Practices

### Database Security
- Use SSL connections
- Implement connection pooling
- Set up read replicas for scaling
- Regular backups

### API Security
- JWT token validation
- Rate limiting
- Input sanitization
- CORS configuration

### Environment Variables
```
# Production settings
NODE_ENV=production
DB_SSL=true
CORS_ORIGIN=https://your-domain.amplifyapp.com
JWT_SECRET=your-jwt-secret
```

## Monitoring & Maintenance

### CloudWatch Integration
- API Gateway logs
- Lambda function metrics
- Database connection monitoring
- Error tracking

### Performance Optimization
- Database indexing
- Query optimization
- Caching strategies
- CDN for static assets

## Troubleshooting

### Common Issues
1. **Database connection timeout**: Check security groups and network settings
2. **CORS errors**: Verify CORS configuration in API
3. **Authentication failures**: Check Cognito token validation
4. **Environment variables**: Ensure all variables are set in Amplify

### Debug Commands
```bash
# Test database connection
curl https://your-app.amplifyapp.com/api/health

# Check products endpoint
curl https://your-app.amplifyapp.com/api/products

# Verify authentication
curl -H "Authorization: Bearer YOUR_TOKEN" https://your-app.amplifyapp.com/api/orders
```

## Cost Optimization

### MySQL Options
- **AWS RDS**: $15-50/month (t3.micro)
- **PlanetScale**: Free tier available, $29/month for production
- **Digital Ocean**: $15/month managed MySQL

### Amplify Costs
- **Build minutes**: 1000 free/month
- **Hosting**: $0.15/GB served
- **Functions**: Pay per request

## Support & Resources

- **AWS Amplify Docs**: https://docs.amplify.aws/
- **MySQL Documentation**: https://dev.mysql.com/doc/
- **Node.js MySQL2**: https://github.com/sidorares/node-mysql2
- **Express.js Guide**: https://expressjs.com/

This deployment provides a robust, scalable MySQL backend for your e-commerce application with proper authentication, security, and monitoring capabilities.