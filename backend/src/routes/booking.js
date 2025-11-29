// routes/booking.js
import express from 'express';
// Assuming your controller is named 'bookingController.js' and exports a function 'bookTicket'
import { bookTicket } from '../controllers/ticket.js'; 

const router = express.Router();

/**
 * @route POST /api/booking/book
 * @desc Create a new ticket, generate hash, and QR code (No User Auth)
 * @access Public
 */
router.post('/book', bookTicket);

// 🛑 FIX: Export the router as the module's default export
export default router;