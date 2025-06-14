const mongoose = require('mongoose');
const { Schema } = mongoose;

const subCategorySchema = new Schema({
  name: {
    type: String,
    required: true
  }
});

const categorySchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  photo: {
    type: String,
    default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmiqR_gB1aE6SmGpJvgdi6j6MZYtLpcSittA&s'
  },
  bannerPhoto:{
    type: String,
    default: 'https://rukminim2.flixcart.com/fk-p-flap/1600/270/image/614c92ccb25152fe.jpg?q=20'
  },
  subcategories: [{
    type: Schema.Types.ObjectId,
    ref: 'SubCategory'
  }]
});

const Category = mongoose.model('Category', categorySchema);
const SubCategory = mongoose.model('SubCategory', subCategorySchema);

module.exports = { Category, SubCategory };
