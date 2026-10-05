const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const seriesController = require('../controllers/serieController');

// Helper to prevent "argument handler must be a function" crashes
const safeHandler = (fn, name) => {
    if (typeof fn === 'function') return fn;
    return (req, res) => res.status(500).json({
        message: `Controller error: Function '${name}' is undefined.`
    });
};

// GET all series
router.get('/', safeHandler(seriesController.getSeries, 'getSeries'));

// POST create series (with image upload)
router.post('/', upload.single('image'), safeHandler(seriesController.createSerie || seriesController.createSeries, 'createSerie'));

// PUT update series (with image upload)
router.put('/:id', upload.single('image'), safeHandler(seriesController.updateSerie || seriesController.updateSeries, 'updateSerie'));

// DELETE series
router.delete('/:id', safeHandler(seriesController.deleteSerie || seriesController.deleteSeries, 'deleteSerie'));

// POST add book to series
router.post('/:id/books', safeHandler(seriesController.addBookToSerie || seriesController.addBookToSeries, 'addBookToSerie'));

// DELETE remove book from series
router.delete('/:id/books/:bookId', safeHandler(seriesController.removeBookFromSerie || seriesController.removeBookFromSeries, 'removeBookFromSerie'));

module.exports = router;