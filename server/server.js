const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/CategoryRoutes');
const seriesRoutes = require('./routes/serieRoutes')
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/series', seriesRoutes);

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in server/.env');
    process.exit(1);
}

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
        console.log('Connected to MongoDB');
    })
    .catch((err) => console.error('MongoDB Connection Error:', err));