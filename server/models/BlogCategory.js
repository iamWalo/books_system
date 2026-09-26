const mongoose = require('mongoose');

const blogCategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
    },
    { timestamps: true }
);

module.exports = mongoose.model('BlogCategory', blogCategorySchema);