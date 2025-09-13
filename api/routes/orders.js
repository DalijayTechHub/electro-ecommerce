const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Create order
router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const orderId = uuidv4();
    const { items, totalAmount, customerEmail, customerName } = req.body;
    
    // Create order
    await connection.execute(`
      INSERT INTO orders (id, user_id, customer_email, customer_name, total_amount)
      VALUES (?, ?, ?, ?, ?)
    `, [orderId, 'guest', customerEmail, customerName, totalAmount]);
    
    // Add order items
    for (const item of items) {
      await connection.execute(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `, [orderId, item.productId, item.quantity, item.price]);
    }
    
    await connection.commit();
    res.json({ orderId, status: 'success' });
    
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Get orders by email
router.get('/email/:email', async (req, res) => {
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
      WHERE o.customer_email = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.params.email]);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;