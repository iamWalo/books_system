const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        subtitle: {
            type: String,
            default: '',
            trim: true,
        },
        productLink: {
            type: String,
            default: '',
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            min: 0,
        },
        description: {
            type: String,
            default: '',
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
        },
        categories: [
            {
                type: String,
                enum: ['story_book', 'best_selling'],
            },
        ],
        serie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Serie',
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
        size: {
            type: String,
            default: '',
        },
        pagesNumber: {
            type: Number,
            default: 0,
        },
        ageRange: {
            type: String,
            default: '',
        },
        bookChapters: [
            {
                type: String,
            },
        ],
        productImages: [
            {
                type: String,
            },
        ],
        descriptionImages: [
            {
                type: String,
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);