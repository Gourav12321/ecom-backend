  const express = require('express');
  const { getOrdersByUser, addOrder, removeOrderItem, getOrderSummary, clearCart } = require('../controller/Cart.controller');
  const { Cart } = require('../model/Cart.model');
  const { User } = require('../model/User.model');
  const router = express.Router();

  router.post('/add', addOrder);
  router.get('/user/:email', getOrdersByUser);
  router.post('/remove-item', removeOrderItem);
  router.get('/summary/:email' , getOrderSummary);
  router.post('/clear' , clearCart);

  router.post('/update-item', async (req, res) => {
      const { email, productId, quantity } = req.body;
    
      try {
        const user = await User.findOne({ email });
        
        if (!user) {
          return res.status(404).send({ message: 'User not found' });
        }
    
        const userOrder = await Cart.findOne({ user: user._id });
    
        if (!userOrder) {
          return res.status(404).send({ message: 'Order not found' });
        }
    
        const product = userOrder.products.find(item => item.product.toString() === productId);
        
        if (!product) {
          return res.status(404).send({ message: 'Product not found in order' });
        }
    
        product.quantity = quantity;
        
        await userOrder.save();
    
        res.status(200).send({ message: 'Item quantity updated successfully' });
      } catch (error) {
        console.error('Error updating item quantity:', error);
        res.status(500).send({ message: 'Failed to update item quantity' });
      }
    });
  module.exports = router;
