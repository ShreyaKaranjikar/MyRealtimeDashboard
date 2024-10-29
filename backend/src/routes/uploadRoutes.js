const express = require('express');
const router = express.Router();
const { uploadController, upload } = require('../controllers/uploadController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Only allow admin and manager roles to upload files
router.post('/upload', 
    authMiddleware, 
    checkRole(['admin', 'manager']), 
    upload.single('file'), 
    uploadController.uploadFile
);

module.exports = router;