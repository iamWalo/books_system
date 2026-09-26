const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

const getUploadedFiles = (req) => req.files || (req.file ? [req.file] : []);

const getImagePaths = (req) => getUploadedFiles(req)
    .map((file) => `/uploads/products/${file.filename}`);

const getArrayValue = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.length > 0) return [value];
    return [];
};

const deleteUploadedFiles = (req) => {
    getImagePaths(req).forEach(deleteImageFile);
};

const deleteImageFile = (imagePath) => {
    if (!imagePath) return;
    const fullPath = path.join(__dirname, '..', imagePath);
    if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (err) => {
            if (err) console.error('Failed to delete image file:', err);
        });
    }
};

// GET /api/products
exports.getProducts = async (req, res) => {
    try {
        const { search, category, status } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (category) {
            query.category = category;
        }
        if (status) {
            query.status = status;
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/products
exports.createProduct = async (req, res) => {
    try {
        const productData = { ...req.body };
        const imagePaths = getImagePaths(req);
        if (imagePaths.length > 0) {
            productData.image = imagePaths[0];
            productData.productImages = [
                ...getArrayValue(productData.productImages),
                ...imagePaths.slice(1),
            ];
        }

        const product = new Product(productData);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        deleteUploadedFiles(req);
        res.status(400).json({ message: error.message });
    }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const updateData = { ...req.body };
        const imagePaths = getImagePaths(req);

        if (imagePaths.length > 0) {
            if (product.image) deleteImageFile(product.image);
            updateData.image = imagePaths[0];
            updateData.productImages = [
                ...getArrayValue(updateData.productImages),
                ...imagePaths.slice(1),
            ];
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedProduct);
    } catch (error) {
        deleteUploadedFiles(req);
        res.status(400).json({ message: error.message });
    }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (product.image) deleteImageFile(product.image);
        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};