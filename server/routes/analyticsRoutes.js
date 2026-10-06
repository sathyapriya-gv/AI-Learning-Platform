const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Student endpoints
router.get('/dashboard', protect, analyticsController.getDashboardData);
router.get('/history', protect, analyticsController.getQuizHistory);
router.get('/charts', protect, analyticsController.getChartData);

// Admin-only dashboard monitor and controls
router.get('/admin/users', protect, adminOnly, analyticsController.adminGetUsers);
router.get('/admin/documents', protect, adminOnly, analyticsController.adminGetDocuments);
router.delete('/admin/users/:userId', protect, adminOnly, analyticsController.adminDeleteUser);
router.get('/admin/usage', protect, adminOnly, analyticsController.adminGetAIUsage);

module.exports = router;
