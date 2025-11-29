// models/Ticket.js
import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
    // routeId removed
    source: { type: String, required: true },
    destination: { type: String, required: true },
    fare: { type: Number, required: true },
    // Cryptographic hash for verification and integrity
    validationHash: { type: String, required: true, unique: true },
    bookedAt: { type: Date, default: Date.now },
});

// Use default export for ES Modules
export default mongoose.model('Ticket', TicketSchema);