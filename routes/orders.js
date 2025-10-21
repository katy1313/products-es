const express = require('express');
const router = express.Router();
const { getAllOrders, getOrder, createOrder, updateOrder, deleteOrder,getAllProducts } = require('../controllers/orders');

router.get('/', getAllOrders);
router.get("/:id", getOrder);
router.post('/', createOrder);
router.post("/update/:id", updateOrder);
router.post('/delete/:id', deleteOrder);
router.get('/', getAllProducts);

module.exports = router;