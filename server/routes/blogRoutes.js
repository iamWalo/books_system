const express = require('express');
const upload = require('../middleware/upload');
const {
    getBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    createBlogCategory,
    getBlogCategories,
} = require('../controllers/blogController');

const router = express.Router();
const uploadBannerImage = (req, res, next) => {
    upload.single('bannerImage')(req, res, (error) => {
        if (error) {
            const statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
            return res.status(statusCode).json({ success: false, message: error.message });
        }

        next();
    });
};

// Blog Routes
router.route('/').get(getBlogs).post(uploadBannerImage, createBlog);
// Blog Category Routes
router.route('/categories').get(getBlogCategories).post(createBlogCategory);
router.route('/:id').get(getBlogById).put(uploadBannerImage, updateBlog).delete(deleteBlog);

module.exports = router;