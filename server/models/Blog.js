const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        bannerImage: {
            type: String,
            default: '',
        },
        author: {
            type: String,
            default: 'WhyQuest Team',
        },
        category: {
            type: String,
            trim: true,
        },
        tags: [
            {
                type: String,
            },
        ],
        publishDate: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['Draft', 'Published'],
            default: 'Published',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);