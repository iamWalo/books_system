const Serie = require('../models/Serie');
const Product = require('../models/Product');

// Get all series with populated books
exports.getSeries = async (req, res) => {
    try {
        const series = await Serie.find().populate('books', 'name image price');
        res.status(200).json({ success: true, data: series });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create Serie
exports.createSerie = async (req, res) => {
    try {
        const { name, description, books } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

        let parsedBooks = [];
        if (books) {
            parsedBooks = typeof books === 'string' ? JSON.parse(books) : books;
        }

        const serie = new Serie({
            name,
            description,
            image: imagePath,
            books: parsedBooks,
        });

        const savedSerie = await serie.save();

        if (parsedBooks.length > 0) {
            await Product.updateMany(
                { _id: { $in: parsedBooks } },
                { serie: savedSerie._id }
            );
        }

        res.status(201).json({ success: true, data: savedSerie });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update Serie
exports.updateSerie = async (req, res) => {
    try {
        const { name, description, books } = req.body;
        const updateData = { name, description };

        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        if (books) {
            updateData.books = typeof books === 'string' ? JSON.parse(books) : books;
        }

        const serie = await Serie.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('books', 'name image price');

        if (!serie) {
            return res.status(404).json({ success: false, message: 'Serie not found' });
        }

        res.status(200).json({ success: true, data: serie });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Add book to serie
exports.addBookToSerie = async (req, res) => {
    try {
        const { bookId } = req.body;
        const serie = await Serie.findById(req.params.id);

        if (!serie) {
            return res.status(404).json({ success: false, message: 'Serie not found' });
        }

        if (!serie.books.includes(bookId)) {
            serie.books.push(bookId);
            await serie.save();
            await Product.findByIdAndUpdate(bookId, { serie: serie._id });
        }

        const updated = await Serie.findById(serie._id).populate('books', 'name image price');
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Remove book from serie
exports.removeBookFromSerie = async (req, res) => {
    try {
        const { bookId } = req.params;
        const serie = await Serie.findById(req.params.id);

        if (!serie) {
            return res.status(404).json({ success: false, message: 'Serie not found' });
        }

        serie.books = serie.books.filter((b) => b.toString() !== bookId);
        await serie.save();

        const updated = await Serie.findById(serie._id).populate('books', 'name image price');
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};