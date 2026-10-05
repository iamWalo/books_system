const Blog = require('../models/Blog');
const BlogCategory = require('../models/BlogCategory');
const mongoose = require('mongoose');

const getBlogData = (req) => ({
    ...req.body,
    ...(req.file && { bannerImage: `/uploads/blogs/${req.file.filename}` }),
});

const hasValidBlogId = (req, res) => {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) return true;

    res.status(400).json({ success: false, message: 'Invalid blog ID.' });
    return false;
};

const resolveBlogIds = async (posts = []) => {
    const values = Array.isArray(posts) ? posts : [posts];
    const ids = values.filter((value) => mongoose.Types.ObjectId.isValid(value));
    const titles = values.filter((value) => !mongoose.Types.ObjectId.isValid(value));

    if (titles.length === 0) return ids;

    const blogs = await Blog.find({ title: { $in: titles } }).select('_id title');
    const blogsByTitle = new Map(blogs.map((blog) => [blog.title, blog._id.toString()]));
    const unresolvedTitles = titles.filter((title) => !blogsByTitle.has(title));

    if (unresolvedTitles.length > 0) {
        const error = new Error(`Blog posts not found: ${unresolvedTitles.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }

    return values.map((value) => blogsByTitle.get(value) || value);
};

// GET /api/blogs - Fetch all blogs (with optional search filter)
const getBlogs = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const blogs = await Blog.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: blogs.length, data: blogs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/blogs/:id - Get a single blog by ID
const getBlogById = async (req, res) => {
    if (!hasValidBlogId(req, res)) return;

    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog post not found' });
        }
        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/blogs - Create a new blog post
const createBlog = async (req, res) => {
    try {
        const blog = await Blog.create(getBlogData(req));
        res.status(201).json({ success: true, data: blog });
    } catch (error) {
        res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
};

// PUT /api/blogs/:id - Update an existing blog post
const updateBlog = async (req, res) => {
    if (!hasValidBlogId(req, res)) return;

    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, getBlogData(req), {
            returnDocument: 'after',
            runValidators: true,
        });

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog post not found' });
        }

        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
};

// DELETE /api/blogs/:id - Delete a blog post
const deleteBlog = async (req, res) => {
    if (!hasValidBlogId(req, res)) return;

    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog post not found' });
        }
        res.status(200).json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/blogs/categories - Create a new Blog Category
const createBlogCategory = async (req, res) => {
    try {
        const { name, posts } = req.body;
        const resolvedPosts = await resolveBlogIds(posts);
        const categoryName = typeof name === 'string' ? name.trim() : '';

        if (!categoryName) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }

        const category = await BlogCategory.create({
            name: categoryName,
            posts: resolvedPosts,
        });

        if (resolvedPosts.length > 0) {
            await Blog.updateMany(
                { _id: { $in: resolvedPosts } },
                { $set: { category: categoryName } }
            );
        }

        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
};

// GET /api/blogs/categories - Get all Blog Categories
const getBlogCategories = async (req, res) => {
    try {
        const categories = await BlogCategory.find().populate('posts', 'title');
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    createBlogCategory,
    getBlogCategories,
};