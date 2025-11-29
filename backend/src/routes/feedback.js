// routes/feedback.js
import express from 'express';
import { submitFeedback } from '../controllers/feedback.js'; // Import the controller

const router = express.Router();

/**
 * @route POST /api/feedback/submit
 * @desc Submit commuter feedback for digital awareness and route health
 * @access Public
 */
router.post('/submit', submitFeedback);

export default router;