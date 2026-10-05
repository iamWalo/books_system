const Category = require('../models/Category');

const normalizeImagePath = (imagePath) => {
    if (!imagePath) return imagePath;
    const normalizedPath = String(imagePath).replace(/\\/g, '/').replace(/^\/+/, '');
    return normalizedPath.startsWith('uploads/')
        ? `/${normalizedPath}`
        : `/uploads/${normalizedPath}`;
};

// 1. Get Categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('books');
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Create Category
// Example storing local uploads in categoryController.js
exports.createCategory = async (req, res) => {
    try {
        const { name, description, color } = req.body;

        // Handle image path if file uploaded via multer
        let imageUrl = normalizeImagePath(req.body.image || '');
        if (req.file) {
            imageUrl = `/uploads/categories/${req.file.filename}`;
        }

        let books = [];
        if (req.body.books) {
            try {
                books = typeof req.body.books === 'string' ? JSON.parse(req.body.books) : req.body.books;
            } catch (e) {
                books = [];
            }
        }

        const newCategory = new Category({
            name: name.trim(),
            description: description || '',
            color: color || '#0F4000',
            image: imageUrl,
            books: Array.isArray(books) ? books : []
        });

        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Update Category
exports.updateCategory = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: 'Request body is missing.' });
        }

        const { name, description, color } = req.body;
        let books;

        if (req.body.books) {
            try {
                books = typeof req.body.books === 'string' ? JSON.parse(req.body.books) : req.body.books;
            } catch (e) {
                books = [];
            }
        }

        const updateData = {
            ...(name && { name: name.trim() }),
            ...(description !== undefined && { description }),
            ...(color && { color }),
            ...(req.body.image !== undefined && { image: normalizeImagePath(req.body.image) }),
            ...(req.file && { image: `/uploads/categories/${req.file.filename}` }),
            ...(books !== undefined && { books })
        };

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { returnDocument: 'after' }
        );

        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Delete Category
exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        await Category.findByIdAndDelete(categoryId);
        res.status(200).json({ message: 'Category deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Add Book to Category
exports.addBookToCategory = async (req, res) => {
    try {
        const { id: categoryId } = req.params;
        const { bookId } = req.body;
        await Category.findByIdAndUpdate(categoryId, { $addToSet: { books: bookId } });
        res.status(200).json({ message: 'Book added to category successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. Remove Book from Category
exports.removeBookFromCategory = async (req, res) => {
    try {
        const { id: categoryId, bookId } = req.params;
        await Category.findByIdAndUpdate(categoryId, { $pull: { books: bookId } });
        res.status(200).json({ message: 'Book removed from category successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};