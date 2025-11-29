// controllers/feedbackController.js
import Feedback from '../models/feedback.js';

/**
 * @desc Submit commuter feedback for digital awareness and route health
 * @route POST /api/feedback/submit
 * @access Public
 */
export const submitFeedback = async (req, res) => {
    const { 
        digitalLiteracyScore, 
        crowdLevel, 
        delayReported, 
        serviceIssue, 
        notes,
        ticketValidationHash,
        commuterName
    } = req.body; // routeId removed
    
    // Note: We no longer require routeId, as context comes from the optional hash.
    if (!crowdLevel || digitalLiteracyScore === undefined) {
        return res.status(400).json({ 
            message: 'Missing required feedback fields: crowdLevel and digitalLiteracyScore.' 
        });
    }

    if (digitalLiteracyScore < 1 || digitalLiteracyScore > 5) {
        return res.status(400).json({ 
            message: 'digitalLiteracyScore must be between 1 and 5.' 
        });
    }

    try {
        // 2. Prepare Data for Saving
        const newFeedback = new Feedback({
            // Since routeId is removed, the trip context is primarily derived from ticketValidationHash
            digitalLiteracyScore,
            crowdLevel,
            delayReported: Number(delayReported) || 0,
            serviceIssue: serviceIssue || 'None',
            notes,
            
            ticketValidationHash: ticketValidationHash || undefined,
            commuterName: commuterName || 'Anonymous Commuter'
        });

        await newFeedback.save();
        
        res.status(201).json({ 
            message: `Feedback received successfully! ${commuterName || 'Your anonymous contribution'} instantly refined route predictions.`,
            feedback: {
                crowdLevel: newFeedback.crowdLevel,
                isLinkedToTicket: !!newFeedback.ticketValidationHash,
                submittedAt: newFeedback.submittedAt
            }
        });

    } catch (error) {
        console.error('Feedback Submission Error:', error);
        res.status(500).json({ message: 'Server error occurred during feedback submission.' });
    }
};