const express = require('express');
const router = express.Router();
const { createCategory, getCategories, updateCategory, deleteCategory } = require('../controller/Category.controller');
const { createSubCategory, getSubCategories, updateSubCategory, deleteSubCategory } = require('../controller/Category.controller');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/categories',adminMiddleware, createCategory);
router.get('/categories', getCategories);
router.put('/categories/:id',adminMiddleware, updateCategory);
router.delete('/categories/:id',adminMiddleware, deleteCategory);



router.post('/subcategories',adminMiddleware, createSubCategory);
router.get('/subcategories', getSubCategories);
router.put('/subcategories/:id',adminMiddleware, updateSubCategory);
router.delete('/subcategories/:id',adminMiddleware, deleteSubCategory);

module.exports = router;