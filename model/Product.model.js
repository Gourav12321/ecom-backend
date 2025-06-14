const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  reviewerName: {
    type: String,
    required: true,
  },
  reviewerEmail: {
    type: String,
    required: true,
    match: [
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      "Please fill a valid email address",
    ],
  },
});

const dimensionsSchema = new Schema({
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  depth: {
    type: Number,
  },
});

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercentage: {
      type: Number,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: {
      type: [String],
      index: true,
    },
    brand: {
      type: String,
    },
    sku: {
      type: String,
      unique: true,
      required: true,
    },
    weight: {
      type: Number,
    },
    dimensions: dimensionsSchema,
    warrantyInformation: {
      type: String,
    },
    shippingInformation: {
      type: String,
    },
    availabilityStatus: {
      type: String,
      default: "In stock",
    },
    reviews: [reviewSchema],
    returnPolicy: {
      type: String,
    },
    minimumOrderQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    thumbnail: {
      type: String,
    },
    images: [String],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
