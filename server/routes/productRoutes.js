const express = require('express');
const upload = require('../middleware/upload');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/ProductController');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', upload.any(), createProduct);
router.put('/:id', upload.any(), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
