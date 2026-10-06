const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Initialize App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // For development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: true, limit: '150mb' }));

// Static route for serving uploaded files (if needed)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quiz-generator';
mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB database connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB database connection error:', err);
    console.log('Ensure MongoDB service is running locally, or configure MONGO_URI in .env');
  });

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Standard Root Check
app.get('/', (req, res) => {
  res.json({ message: 'AI-Powered Smart Quiz Generator and Learning Analytics System API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err.stack);
  res.status(500).json({ 
    message: 'An internal server error occurred', 
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
