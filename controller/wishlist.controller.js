const { Wishlist } = require('../model/Wishlist.model');
const { User } = require('../model/User.model');
const Product = require('../model/Product.model');

exports.addToWishlist = async (req, res) => {
    try {
        const { email, productId } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let wishlist = await Wishlist.findOne({ email });
        if (!wishlist) {
            wishlist = new Wishlist({ email, products: [] });
        }

        if (!wishlist.products.includes(productId)) {
            wishlist.products.push(productId);
            await wishlist.save();
        }

        res.status(200).json({ message: 'Product added to wishlist', wishlist });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getWishlist = async (req, res) => {
    try {
        const { email } = req.params;
        const wishlist = await Wishlist.findOne({ email }).populate('products');
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }
        res.status(200).json({ wishlist });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const { email, productId } = req.body;

        const wishlist = await Wishlist.findOne({ email });
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
        await wishlist.save();

        res.status(200).json({ message: 'Product removed from wishlist', wishlist });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
