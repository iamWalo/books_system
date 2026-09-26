const express = require('express');
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

// Blog Routes
router.route('/').get(getBlogs).post(createBlog);
// Blog Category Routes
router.route('/categories').get(getBlogCategories).post(createBlogCategory);
router.route('/:id').get(getBlogById).put(updateBlog).delete(deleteBlog);

module.exports = router;