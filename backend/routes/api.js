const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// GET /products
router.get('/products', apiController.getProducts);

// POST /users
router.post('/users', apiController.saveUser);

// POST /orders
router.post('/orders', apiController.createOrder);


// GET /orders/:id
router.get('/orders/:id', apiController.getOrderStatus);
// PATCH /orders/:id/cancel
router.patch('/orders/:id/cancel', apiController.cancelOrder);


module.exports = router;
