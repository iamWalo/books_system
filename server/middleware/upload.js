const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure base uploads directory exists
const baseUploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Dynamically route destination based on endpoint path or fallback to default
        let subFolder = 'general';
        if (req.baseUrl.includes('series')) subFolder = 'series';
        else if (req.baseUrl.includes('categories')) subFolder = 'categories';
        else if (req.baseUrl.includes('products')) subFolder = 'products';
        else if (req.baseUrl.includes('blogs')) subFolder = 'blogs';

        const destDir = path.join(baseUploadDir, subFolder);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        cb(null, destDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

module.exports = upload;