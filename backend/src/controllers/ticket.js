// controllers/bookingController.js
import Ticket from '../models/ticket.js';
import { generateTicketHash } from '../utils/cryptoUtils.js';
import { generateQRCode } from '../utils/qrUtils.js';

/**
 * @desc Create a new ticket, generate hash and QR code
 * @route POST /api/booking/book
 * @access Public
 */
export const bookTicket = async (req, res) => {
    const { source, destination, fare } = req.body; // routeId removed
    
    // 1. Input Validation
    if (!source || !destination || fare === undefined || fare < 0) {
        return res.status(400).json({ message: 'Missing or invalid booking details: source, destination, and fare are required.' });
    }

    try {
        // 2. Generate the Cryptographic Hash (using only source/destination)
        const validationHash = await generateTicketHash(source, destination);

        // 3. Create and Save the Ticket
        const newTicket = new Ticket({
            source,
            destination,
            fare,
            validationHash
        });

        await newTicket.save();

        // 4. Generate the QR Code (encoding the validationHash)
        const qrCodeImage = await generateQRCode(validationHash);

        // 5. Success Response
        res.status(201).json({
            message: 'Ticket booked successfully. Your digital ticket is ready.',
            ticket: {
                // Descriptive Details
                source: newTicket.source,
                destination: newTicket.destination,
                fare: newTicket.fare,
                bookedAt: newTicket.bookedAt,
                
                // Verification Details
                ticketHash: newTicket.validationHash,
                qrCode: qrCodeImage // Base64 image data
            }
        });

    } catch (error) {
        console.error('Booking Error:', error);
        res.status(500).json({ message: 'Server error occurred during ticket processing.' });
    }
};