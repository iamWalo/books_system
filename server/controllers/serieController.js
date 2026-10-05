const Serie = require('../models/Serie');
const Product = require('../models/Product');

const normalizeImagePath = (imagePath) => {
    if (!imagePath) return imagePath;
    const normalizedPath = String(imagePath).replace(/\\/g, '/').replace(/^\/+/, '');
    return normalizedPath.startsWith('uploads/')
        ? `/${normalizedPath}`
        : `/uploads/${normalizedPath}`;
};

// 1. Get all series
exports.getSeries = async (req, res) => {
    try {
        const series = await Serie.find().populate('books');
        res.status(200).json(series);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Create series
// Create Serie
exports.createSerie = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: 'Request body is missing.' });
        }

        const { name, description, color } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Series name is required.' });
        }

        // 1. Process Image Path if file was uploaded via upload.js
        let imageUrl = '';
        if (req.file) {
            // Determines subfolder dynamically from file path or defaults to series
            const folder = req.baseUrl.includes('categories') ? 'categories' : 'series';
            imageUrl = normalizeImagePath(`${folder}/${req.file.filename}`);
        }

        // 2. Parse Books Array sent via FormData
        let books = [];
        if (req.body.books) {
            try {
                books = typeof req.body.books === 'string' ? JSON.parse(req.body.books) : req.body.books;
            } catch (e) {
                books = [];
            }
        }

        // 3. Create and save the series
        const newSerie = new Serie({
            name: name.trim(),
            description: description || '',
            color: color || '#0F4000',
            image: imageUrl,
            books: Array.isArray(books) ? books : []
        });

        const savedSerie = await newSerie.save();
        return res.status(201).json(savedSerie);
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Error creating series.' });
    }
};
// Alias for naming consistency
exports.createSeries = exports.createSerie;

// 3. Update series
exports.updateSerie = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: 'Request body is missing.' });
        }

        const { name, description, color } = req.body;
        let books;

        if (req.body.books) {
            try {
                books = typeof req.body.books === 'string' ? JSON.parse(req.body.books) : req.body.books;
            } catch (e) {
                books = [];
            }
        }

        const updateData = {
            ...(name && { name: name.trim() }),
            ...(description !== undefined && { description }),
            ...(color && { color }),
            ...(req.body.image !== undefined && { image: normalizeImagePath(req.body.image) }),
            ...(req.file && { image: normalizeImagePath(`series/${req.file.filename}`) }),
            ...(books !== undefined && { books })
        };

        const updatedSerie = await Serie.findByIdAndUpdate(
            req.params.id,
            updateData,
            { returnDocument: 'after' }
        );

        res.status(200).json(updatedSerie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSeries = exports.updateSerie;

// 4. Delete series
exports.deleteSerie = async (req, res) => {
    try {
        const serieId = req.params.id;

        const activeProductsCount = await Product.countDocuments({ serie: serieId });
        if (activeProductsCount > 0) {
            return res.status(400).json({
                message: `Cannot delete series. There are ${activeProductsCount} book(s) assigned to this series.`
            });
        }

        await Serie.findByIdAndDelete(serieId);
        res.status(200).json({ message: 'Series deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteSeries = exports.deleteSerie;

// 5. Add book to series
exports.addBookToSerie = async (req, res) => {
    try {
        const { id: serieId } = req.params;
        const { bookId } = req.body;

        await Serie.findByIdAndUpdate(serieId, { $addToSet: { books: bookId } });
        await Product.findByIdAndUpdate(bookId, { serie: serieId });

        res.status(200).json({ message: 'Book added to series successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addBookToSeries = exports.addBookToSerie;

// 6. Remove book from series
exports.removeBookFromSerie = async (req, res) => {
    try {
        const { id: serieId, bookId } = req.params;

        await Serie.findByIdAndUpdate(serieId, { $pull: { books: bookId } });
        await Product.findByIdAndUpdate(bookId, { $unset: { serie: "" } });

        res.status(200).json({ message: 'Book removed from series successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeBookFromSeries = exports.removeBookFromSerie;