const express = require('express');
const router = express.Router();
const { addToWishlist, getWishlist, removeFromWishlist } = require('../controller/wishlist.controller');

router.post('/wishlist', addToWishlist);

router.get('/wishlist/:email', getWishlist);

router.delete('/wishlist', removeFromWishlist);

module.exports = router;
