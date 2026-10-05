const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// 2. Import Controller
const categoryController = require('../controllers/CategoryController');

// Helper to prevent "argument handler must be a function" crashes
const safeHandler = (fn, name) => {
    if (typeof fn === 'function') return fn;
    return (req, res) => res.status(500).json({
        message: `Controller error: Function '${name}' is undefined.`
    });
};

// 3. Define Routes
// GET all categories
router.get('/', safeHandler(categoryController.getCategories, 'getCategories'));

// POST create category (with required image upload support)
router.post('/', upload.single('image'), safeHandler(categoryController.createCategory, 'createCategory'));

// PUT update category
router.put('/:id', upload.single('image'), safeHandler(categoryController.updateCategory, 'updateCategory'));

// DELETE category
router.delete('/:id', safeHandler(categoryController.deleteCategory, 'deleteCategory'));

// POST add book to category
router.post('/:id/books', safeHandler(categoryController.addBookToCategory, 'addBookToCategory'));

// DELETE remove book from category
router.delete('/:id/books/:bookId', safeHandler(categoryController.removeBookFromCategory, 'removeBookFromCategory'));

module.exports = router;