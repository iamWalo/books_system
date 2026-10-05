const Product = require('../models/Product');

const normalizeImagePath = (imagePath) => {
    if (!imagePath) return imagePath;
    const normalizedPath = String(imagePath).replace(/\\/g, '/').replace(/^\/+/, '');
    return normalizedPath.startsWith('uploads/')
        ? `/${normalizedPath}`
        : `/uploads/${normalizedPath}`;
};

const getRelativePath = (file) => normalizeImagePath(`products/${file.filename}`);

// Helper to handle single string or array values sent via FormData
const parseArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    return [field]; // Wrap single string input into array
};

// Get All Products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category')
            .populate('serie')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single Product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category')
            .populate('serie');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create Product
exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            subtitle,
            productLink,
            price,
            description,
            category,
            serie,
            status,
            size,
            pagesNumber,
            ageRange,
        } = req.body;

        const categories = parseArrayField(req.body.categories);
        const bookChapters = parseArrayField(req.body.bookChapters);

        // Process newly uploaded files with clean relative paths
        const filesList = Array.isArray(req.files) ? req.files : [];
        const productImages = filesList
            .filter((file) => file.fieldname === 'productImages')
            .map(getRelativePath);

        const descriptionImages = filesList
            .filter((file) => file.fieldname === 'descriptionImages')
            .map(getRelativePath);

        const product = new Product({
            name,
            subtitle,
            productLink,
            price,
            description,
            category: category || null,
            categories,
            serie: serie || null,
            status: status || 'Active',
            size,
            pagesNumber,
            ageRange,
            bookChapters,
            productImages,
            descriptionImages,
        });

        await product.save();
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update Product
exports.updateProduct = async (req, res) => {
    try {
        const {
            name,
            subtitle,
            productLink,
            price,
            description,
            category,
            serie,
            status,
            size,
            pagesNumber,
            ageRange,
        } = req.body;

        // Retain existing image paths sent back from the frontend
        const existingProductImages = parseArrayField(req.body.existingProductImages);
        const existingDescriptionImages = parseArrayField(req.body.existingDescriptionImages);

        // Process new uploaded files
        const filesList = Array.isArray(req.files) ? req.files : [];
        const newProductImages = filesList
            .filter((file) => file.fieldname === 'productImages')
            .map(getRelativePath);

        const newDescriptionImages = filesList
            .filter((file) => file.fieldname === 'descriptionImages')
            .map(getRelativePath);

        // Combine retained existing images with newly uploaded images
        const finalProductImages = [...existingProductImages, ...newProductImages];
        const finalDescriptionImages = [...existingDescriptionImages, ...newDescriptionImages];

        const updatedData = {
            name,
            subtitle,
            productLink,
            price,
            description,
            category: category || null,
            categories: parseArrayField(req.body.categories),
            serie: serie || null,
            status: status || 'Active',
            size,
            pagesNumber,
            ageRange,
            bookChapters: parseArrayField(req.body.bookChapters),
            productImages: finalProductImages.map(normalizeImagePath),
            descriptionImages: finalDescriptionImages.map(normalizeImagePath),
        };

        const product = await Product.findByIdAndUpdate(req.params.id, updatedData, {
            returnDocument: 'after',
            runValidators: true,
        })
            .populate('category')
            .populate('serie');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};