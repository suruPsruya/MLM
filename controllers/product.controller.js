import ProductModel from '../models/product.model.js';
import { validateCreateProduct, validateUpdateProduct } from '../validators/product.validator.js';

function generateItemId(count) {
  // Assuming count is a number like 1, 2, 3, ...
  const formattedCount = count.toString().padStart(2, '0');
  return `ITM-${formattedCount}`;
}

// Insert New product
export async function insertProduct(req, res) {
  try {
    const productData = req.body;

    // Validate product data before insertion
    const { error } = validateCreateProduct(productData);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Generate itemId
    const count = (await ProductModel.countDocuments()) + 1; // Get the count of existing documents
    const itemId = generateItemId(count);


    // Insert Product with itemId
    const newProduct = new ProductModel(productData);

    newProduct.itemId = itemId;
    const savedProduct = await newProduct.save();

    // Send Response
    res.status(200).json({ message: "Product data inserted", data: savedProduct });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Something went wrong",
      });
  }
};

// Display List
export async function  ListProducts(req, res, next){
  try {
    let product = await ProductModel.find({ disabled: "false" });
    if (!product || product.length === 0) {
      console.log('productr not found');
      return res.status(404).json({ message: 'product not found' });
    }
    res.status(200).json({ message: "success", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Display Single product
export async function  showProduct(req, res, next){
  try {
    let productId = req.params.itemId; // Assuming the parameter is productId
    let product = await ProductModel.findOne({itemId: productId});

    if (!product) {
      console.log('Product not found');
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving product' });
  }
};

// Update product
export async function updateProduct(req, res, next) {
  try {
    const productId = req.params.itemId;
    const productDataToUpdate = req.body;

    // Validate the update data
    const { error } = validateUpdateProduct(productDataToUpdate);
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get the existing product by ID using Mongoose
    const existingProduct = await ProductModel.findOne({ itemId: productId });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update only the fields that are present in the request body
    Object.assign(existingProduct, productDataToUpdate);

    // Save the updated product
    const updatedProduct = await existingProduct.save();

    // Send the updated product as JSON response
    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    // Send Error Response
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};


// Delete product
export async function  deleteProduct(req, res, next){
  try {
    let itemId = req.params.itemId;
    console.log(itemId);

    const updatedProduct = await ProductModel.findOneAndUpdate(
      { itemId: itemId },
      { disabled: "true" },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};