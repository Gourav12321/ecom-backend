const { User } = require('../model/User.model');
const { Cart } = require('../model/Cart.model');
const Product = require('../model/Product.model');

exports.addOrder = async (req, res) => {
  try {
    const { email, cart, discountPercentage = 0 } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let order = await Cart.findOne({ user: user._id });
    if (!order) {
      order = new Cart({ user: user._id, products: [], totalAmount: 0 });
    }

    order.totalAmount = 0;

    for (let item of cart) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const existingProductIndex = order.products.findIndex(p => p.product.toString() === item.productId);
      if (existingProductIndex !== -1) {
        order.products[existingProductIndex].quantity += item.quantity;
      } else {
        order.products.push({ product: item.productId, quantity: item.quantity });
      }

      order.totalAmount += product.price * item.quantity;
    }

    if (discountPercentage > 0) {
      const discountAmount = (order.totalAmount * discountPercentage) / 100;
      order.totalAmount -= discountAmount;
    }

    await order.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




exports.getOrdersByUser = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = await Cart.find({ user: user._id })
      .populate( { path: 'products.product' ,populate: {
        path: 'category',
        model: 'Category'
      }})
      .exec();
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.removeOrderItem = async (req, res) => {
  const { email, productId } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const order = await Cart.findOne({ user: user._id, 'products.product': productId });
    if (!order) {
      return res.status(404).json({ message: 'Order or Product not found' });
    }

    const productIndex = order.products.findIndex(item => item.product.toString() === productId);
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in the order' });
    }

    if (order.products[productIndex].quantity > 1) {
      order.products[productIndex].quantity -= 1;
    } else {
      order.products.splice(productIndex, 1);
    }

    if (order.products.length === 0) {
      await Cart.deleteOne({ _id: order._id });
    } else {
      await order.save();
    }

    res.status(200).json({ message: 'Item removed successfully' });
  } catch (error) {
    console.error('Error removing item from order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getOrderSummary = async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const order = await Cart.findOne({ user: user._id })
      .populate('products.product')
      .exec();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderSummary = {
      products: order.products.map(p => ({
        product: p.product,
        quantity: p.quantity,
        price: p.product.price * (1 - (p.product.discountPercentage || 0) / 100) * p.quantity, 
      })),
      totalAmount: order.products.reduce((sum, p) => sum + (p.product.price * (1 - (p.product.discountPercentage || 0) / 100) * p.quantity), 0), 
    };

    res.status(200).json(orderSummary);
  } catch (error) {
    console.error('Error fetching order summary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




exports.clearCart = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Find the user's cart
    const cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Clear the cart by setting products to an empty array and resetting the total amount
    cart.products = [];
    cart.totalAmount = 0;

    // Save the cleared cart
    await cart.save();

    res.status(200).json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};