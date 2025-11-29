// utils/cryptoUtils.js
import bcrypt from 'bcrypt';

/**
 * Generates a unique, cryptographically secure hash for the ticket.
 * The hash relies on the specific trip (Source/Destination) plus high entropy.
 * @param {string} source 
 * @param {string} destination 
 * @returns {Promise<string>} The generated hash.
 */
export const generateTicketHash = async (source, destination) => {
    // Concatenate core booking details with high-entropy timestamp and random number
    const dataString = `${source}:${destination}:${Date.now()}:${Math.random()}`;
    
    // Hash the string using bcrypt 
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(dataString, salt);
    
    // Return a hash slice for storage
    return hash.substring(0, 60); 
};