const multer = require('multer');
const path = require('path');
const csvProcessor = require('../utils/csvProcessor');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv') {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 50 // 50MB limit
    }
});

const uploadController = {
    async uploadFile(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            // Process the CSV file
            await csvProcessor.processFile(req.file.path);

            // Notify connected clients about new data
            global.wss.broadcastUpdate({
                type: 'dataUpdate',
                message: 'New data available'
            });

            res.json({ message: 'File processed successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = { uploadController, upload };