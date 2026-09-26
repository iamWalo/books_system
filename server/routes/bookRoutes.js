// routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const { createBook, updateBookChapters } = require('../controllers/bookController.js');

router.post('/api/products', createBook);
router.patch('/api/products/:id/chapters', updateBookChapters);

module.exports = router;