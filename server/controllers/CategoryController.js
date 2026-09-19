const Category = require('../models/Category');
const Product = require('../models/Product');

// Get all categories with populated book titles & images
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('books', 'name image price');
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create Category
exports.createCategory = async (req, res) => {
    try {
        const { name, description, color, books } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

        let parsedBooks = [];
        if (books) {
            parsedBooks = typeof books === 'string' ? JSON.parse(books) : books;
        }

        const category = new Category({
            name,
            description,
            color: color || '#0F4000',
            image: imagePath,
            books: parsedBooks,
        });

        const savedCategory = await category.save();

        // Optionally update associated Products with this category reference
        if (parsedBooks.length > 0) {
            await Product.updateMany(
                { _id: { $in: parsedBooks } },
                { category: savedCategory._id }
            );
        }

        res.status(201).json({ success: true, data: savedCategory });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update Category
exports.updateCategory = async (req, res) => {
    try {
        const { name, description, color, books } = req.body;
        const updateData = { name, description, color };

        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        if (books) {
            updateData.books = typeof books === 'string' ? JSON.parse(books) : books;
        }

        const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('books', 'name image price');

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Add single book to category
exports.addBookToCategory = async (req, res) => {
    try {
        const { bookId } = req.body;
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        if (!category.books.includes(bookId)) {
            category.books.push(bookId);
            await category.save();
            await Product.findByIdAndUpdate(bookId, { category: category._id });
        }

        const updated = await Category.findById(category._id).populate('books', 'name image price');
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Remove single book from category
exports.removeBookFromCategory = async (req, res) => {
    try {
        const { bookId } = req.params;
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        category.books = category.books.filter((b) => b.toString() !== bookId);
        await category.save();

        const updated = await Category.findById(category._id).populate('books', 'name image price');
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};