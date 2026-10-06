const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure upload limits & file support
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 150MB limit
});

router.post('/', protect, upload.single('file'), uploadController.uploadFile);
router.get('/files', protect, uploadController.getUserFiles);
router.get('/text/:fileId', protect, uploadController.getExtractedTextByFile);

module.exports = router;
