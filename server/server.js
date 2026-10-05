const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/CategoryRoutes');
const seriesRoutes = require('./routes/serieRoutes');
const blogRoutes = require('./routes/blogRoutes');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directory exists
const uploadsPath = path.join(__dirname, 'uploads');
const productsUploadPath = path.join(__dirname, 'uploads/products');

if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}
if (!fs.existsSync(productsUploadPath)) {
    fs.mkdirSync(productsUploadPath, { recursive: true });
}

// Serve root /uploads folder statically
app.use('/uploads', express.static(uploadsPath));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/blogs', blogRoutes);

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in server/.env');
    process.exit(1);
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => console.error('MongoDB Connection Error:', err));