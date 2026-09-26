// controllers/bookController.js

// CREATE new Book/Product with chapters
exports.createBook = async (req, res) => {
    try {
        const { name, price, stock, category, serie, description, chapters } = req.body;

        // Parse chapters if received as JSON string (common with FormData uploads)
        let parsedChapters = [];
        if (typeof chapters === 'string') {
            try {
                parsedChapters = JSON.parse(chapters);
            } catch (e) {
                parsedChapters = [];
            }
        } else if (Array.isArray(chapters)) {
            parsedChapters = chapters;
        }

        const newBook = await Book.create({
            name,
            price,
            stock,
            category,
            serie,
            description,
            chapters: parsedChapters
        });

        res.status(201).json({ success: true, data: newBook });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE Book chapters directly or whole Book
exports.updateBookChapters = async (req, res) => {
    try {
        const { id } = req.params;
        const { chapters } = req.body;

        const updatedBook = await Book.findByIdAndUpdate(
            id,
            { chapters },
            { new: true, runValidators: true }
        );

        if (!updatedBook) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        res.status(200).json({ success: true, data: updatedBook });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};