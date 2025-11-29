// models/Feedback.js
import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
    // routeId removed
    
    // Linking/Identification Fields
    commuterName: { 
        type: String, 
        required: false, 
        default: 'Anonymous Commuter' 
    },
    ticketValidationHash: {
        type: String,
        required: false, 
        index: true
    },

    // Digital Awareness & Feedback Loop Data
    digitalLiteracyScore: { 
        type: Number, 
        min: 1, 
        max: 5, 
        required: true,
        default: 3 
    }, 
    crowdLevel: { 
        type: String, 
        enum: ['Low', 'Medium', 'High', 'Severe'], 
        required: true 
    },
    delayReported: { 
        type: Number, 
        default: 0, 
        min: 0 
    },
    serviceIssue: { 
        type: String, 
        enum: ['None', 'Cleanliness', 'Driver Behavior', 'Technical Issue'], 
        default: 'None' 
    },
    notes: { type: String, required: false },
    submittedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Feedback', FeedbackSchema);