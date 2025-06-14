const express = require('express');
const { getAllOrders,updateOrderDeliveryStatus,deleteOrder, getOrdersByUser, addOrder, updateOrderStatus, createPaymentIntent, generatePdfReceipt } = require('../controller/Orders.controller');
const adminMiddleware = require('../middleware/adminMiddleware');
const router = express.Router();

router.post('/add', addOrder);
router.get('/user/:email', getOrdersByUser);
router.post('/payment', createPaymentIntent);
router.post('/update-status', updateOrderStatus);
router.get('/admin/orders',adminMiddleware, getAllOrders);
router.post('/admin/orders/update-status',adminMiddleware, updateOrderDeliveryStatus);
router.delete('/admin/orders/delete',adminMiddleware, deleteOrder);
router.post('/generate-pdf', generatePdfReceipt);

module.exports = router;
