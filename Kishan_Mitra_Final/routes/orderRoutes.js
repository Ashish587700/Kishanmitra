const express = require('express');
const { placeOrder, getAllOrders } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, placeOrder);
router.get('/', authMiddleware, getAllOrders);


module.exports = router;
