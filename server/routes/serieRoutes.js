const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
    getSeries,
    createSerie,
    updateSerie,
    addBookToSerie,
    removeBookFromSerie,
} = require('../controllers/serieController');

router.get('/', getSeries);
router.post('/', upload.single('image'), createSerie);
router.put('/:id', upload.single('image'), updateSerie);
router.post('/:id/books', addBookToSerie);
router.delete('/:id/books/:bookId', removeBookFromSerie);

module.exports = router;