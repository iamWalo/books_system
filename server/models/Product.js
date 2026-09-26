const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        image: { type: String, default: '' },
        // HTML string input stored as raw string
        description: { type: String, default: '' },
        descriptionImages: [{ type: String }],
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
        serie: { type: mongoose.Schema.Types.ObjectId, ref: 'Serie', default: null },
        status: {
            type: String,
            enum: ['In Stock', 'Out of Stock', 'Pre-order', 'Draft'],
            default: 'In Stock'
        },
        size: { type: String, default: '' },
        pagesNumber: { type: Number, min: 0, default: 0 },
        ageRange: { type: String, default: '' },
        bookChapters: [{ type: String }],
        productImages: [{ type: String }],
        chapters: [
            {
                type: String,
                trim: true
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);