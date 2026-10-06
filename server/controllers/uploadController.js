const File = require('../models/File');
const ExtractedText = require('../models/ExtractedText');
const extractorService = require('../services/extractorService');
const aiService = require('../services/aiService');
const fs = require('fs').promises;

/**
 * Handle File Upload and Text Extraction
 * @route POST /api/upload
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please upload a file.' });
    }

    const { originalname, filename, mimetype, path: filePath, size } = req.file;

    // 1. Save File record in database
    const fileRecord = await File.create({
      user: req.user._id,
      originalName: originalname,
      filename,
      mimeType: mimetype,
      path: filePath,
      size,
    });

    // 2. Extract Text
    let extractedText = '';
    try {
      extractedText = await extractorService.extractText(filePath, mimetype, originalname);
    } catch (extractError) {
      // Clean up uploaded file if extraction fails
      await fs.unlink(filePath).catch(() => {});
      await File.findByIdAndDelete(fileRecord._id);
      return res.status(500).json({ 
        message: `Text extraction failed: ${extractError.message}` 
      });
    }

    if (!extractedText || extractedText.trim() === '') {
      // Clean up empty file read
      await fs.unlink(filePath).catch(() => {});
      await File.findByIdAndDelete(fileRecord._id);
      return res.status(400).json({ 
        message: 'Could not extract any readable text from this file. Please make sure the file contains valid text content.' 
      });
    }

    // 3. Identify Topics using AI
    let topics = [];
    try {
      topics = await aiService.identifyTopics(extractedText);
    } catch (aiError) {
      console.error('Topic identification error:', aiError);
      // Fallback topic if AI fails completely
      topics = [originalname.split('.')[0] || 'General Studies'];
    }

    // 4. Save Extracted Text & Topics
    const extractedTextRecord = await ExtractedText.create({
      user: req.user._id,
      file: fileRecord._id,
      text: extractedText,
      topics,
    });

    res.status(201).json({
      message: 'File uploaded and text extracted successfully',
      fileId: fileRecord._id,
      extractedTextId: extractedTextRecord._id,
      fileName: originalname,
      topics,
      textPreview: extractedText.substring(0, 500) + '...'
    });
  } catch (error) {
    console.error('Upload controller error:', error);
    res.status(500).json({ message: 'Server error during file upload', error: error.message });
  }
};

/**
 * Get User's Uploaded Files
 * @route GET /api/upload/files
 */
exports.getUserFiles = async (req, res) => {
  try {
    const files = await File.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user files', error: error.message });
  }
};

/**
 * Get Extracted Text Details
 * @route GET /api/upload/text/:fileId
 */
exports.getExtractedTextByFile = async (req, res) => {
  try {
    const textRecord = await ExtractedText.findOne({ 
      user: req.user._id, 
      file: req.params.fileId 
    });

    if (!textRecord) {
      return res.status(404).json({ message: 'Extracted text not found for this file' });
    }

    res.json(textRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching text record', error: error.message });
  }
};
