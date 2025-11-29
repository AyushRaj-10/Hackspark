// utils/qrUtils.js
import qrcode from 'qrcode';

/**
 * Generates a Base64 data URL string of a QR code image.
 * @param {string} data - The validation hash to encode.
 * @returns {Promise<string>} Base64 image data URL.
 */
export const generateQRCode = async (data) => {
    try {
        // Encode the validationHash into the QR code
        const qrCodeDataURL = await qrcode.toDataURL(data);
        return qrCodeDataURL; 
    } catch (err) {
        console.error('QR Code Generation Error:', err);
        throw new Error('Could not generate QR code.');
    }
};