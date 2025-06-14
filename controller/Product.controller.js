const { default: mongoose } = require("mongoose");
const { Category } = require("../model/Category.model");
const Product = require("../model/Product.model");

const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      price,
      discountPercentage,
      rating,
      stock,
      tags, 
      brand,
      sku,
      weight,
      dimensions,
      warrantyInformation,
      shippingInformation,
      availabilityStatus,
      returnPolicy,
      minimumOrderQuantity,
      thumbnail,
      images
    } = req.body;

    const processedTags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    const newProduct = new Product({
      title,
      description,
      category,
      subcategory,
      price,
      discountPercentage,
      rating,
      stock,
      tags: processedTags,
      brand,
      sku,
      weight,
      dimensions,
      warrantyInformation,
      shippingInformation,
      availabilityStatus,
      returnPolicy,
      minimumOrderQuantity,
      thumbnail,
      images
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product', error });
  }
};


const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate({
        path: 'category',
        populate: {
          path: 'subcategories',
          model: 'SubCategory'
        }
      });
    res.status(200).json(products );
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to retrieve products', error: error.message });
  }
};

const getProductbyCategory = async (req, res) => {
  const { categoryName } = req.params;

  try {
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const products = await Product.find({ category: category._id })
      .populate({
        path: 'category',
        populate: {
          path: 'subcategories',
          model: 'SubCategory'
        }
      });

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to retrieve products', error: error.message });
  }
};


const ObjectId = mongoose.Types.ObjectId;

const getProductsByCategory = async (req, res) => {
    try {
        const categoryParam = req.params.category;
        if (!categoryParam) {
            return res.status(400).json({ error: 'Category parameter is required' });
        }


        const categoryIds = categoryParam.split(',').map(id => {
          
          return id.trim();
      });

        const products = await Product.find({ category: { $in: categoryIds } }) .populate({
          path: 'category',
          populate: {
            path: 'subcategories',
            model: 'SubCategory'
          }
        });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ error: 'Error fetching products by category' });
    }
};





const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id)
      .populate({
        path: 'category',
        populate: {
          path: 'subcategories',
          model: 'SubCategory'
        }
      });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to retrieve product', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true })
      .populate({
        path: 'category',
        populate: {
          path: 'subcategories',
          model: 'SubCategory'
        }
      });
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update product', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete product', error: error.message });
  }
};
const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    const products = await Product.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'category.name': { $regex: query, $options: 'i' } },
        { 'subcategory.name': { $regex: query, $options: 'i' } },
        { tags: { $in: [query] } }
      ]
    }).populate('category');

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to search products', error: error.message });
  }
};
const addReview = async (req, res) => {
  const { id } = req.params; 
  const { rating, comment, reviewerName, reviewerEmail } = req.body;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const newReview = {
      rating,
      comment,
      reviewerName,
      reviewerEmail,
    };

    
    product.reviews.push(newReview);
    await product.save();

    res.status(200).json({ success: true, message: 'Review added successfully', product });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Failed to add review', error });
  }
};



module.exports = {
  addReview,
  searchProducts,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductbyCategory,
  getProductsByCategory 
};
