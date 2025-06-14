const express = require("express");
const router = express.Router();
const { Category } = require("../model/Category.model");
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  searchProducts,
  addReview,
  getProductbyCategory,
  getProductsByCategory,
} = require("../controller/Product.controller");
const adminMiddleware = require("../middleware/adminMiddleware");
router.post("/products",adminMiddleware, createProduct);
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.put("/products/:id",adminMiddleware, updateProduct);
router.delete("/products/:id",adminMiddleware, deleteProduct);
router.get("/search", searchProducts);
router.post("/products/:id/reviews", addReview);
router.get('/products/category/:categoryName', getProductbyCategory);
router.get('/product/category/:category', getProductsByCategory);
router.get("/categories/:categoryId/subcategories", async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findById(categoryId).populate(
      "subcategories"
    );
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res
      .status(200)
      .json({ success: true, subcategories: category.subcategories });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve subcategories" });
  }
});

module.exports = router;
