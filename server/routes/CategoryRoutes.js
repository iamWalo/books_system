const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
    getCategories,
    createCategory,
    updateCategory,
    addBookToCategory,
    removeBookFromCategory,
} = require('../controllers/CategoryController');

router.get('/', getCategories);
router.post('/', upload.single('image'), createCategory);
router.put('/:id', upload.single('image'), updateCategory);
router.post('/:id/books', addBookToCategory);
router.delete('/:id/books/:bookId', removeBookFromCategory);

module.exports = router;