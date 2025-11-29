import React, { useState } from 'react';
import axios from 'axios';
import { User, Hash, Star, Zap, Clock, ShieldCheck, MessageSquare, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Use for navigating back

// Define the Backend URL explicitly for API calls
const BACKEND_URL = 'http://localhost:4000'; // Ensure this matches your running Express server port

const Feedback = () => {
  const navigate = useNavigate();
    
  const [formData, setFormData] = useState({
    commuterName: '',
    digitalLiteracyScore: 3,
    crowdLevel: 'Medium',
    delayReported: 0,
    serviceIssue: 'None',
    notes: '',
    ticketValidationHash: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      // Ensure numerical inputs are correctly parsed and defaulted
      [name]: name === 'digitalLiteracyScore' || name === 'delayReported' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!formData.crowdLevel || !formData.digitalLiteracyScore) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.digitalLiteracyScore < 1 || formData.digitalLiteracyScore > 5) {
      setError('Digital literacy score must be between 1 and 5');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        // Ensure empty strings are treated as undefined for optional backend fields
        ticketValidationHash: formData.ticketValidationHash || undefined,
        commuterName: formData.commuterName || undefined 
      };

      // 🚨 CONNECTION LOGIC: Using the explicit BACKEND_URL for the API call
      const response = await axios.post(`${BACKEND_URL}/api/feedback/submit`, payload);
      
      // Update result state with feedback details and calculated link status
      setResult({
        ...response.data,
        feedback: {
            ...response.data.feedback,
            isLinkedToTrip: !!payload.ticketValidationHash 
        }
      });
      
      // Reset form
      setFormData({
        commuterName: '',
        digitalLiteracyScore: 3,
        crowdLevel: 'Medium',
        delayReported: 0,
        serviceIssue: 'None',
        notes: '',
        ticketValidationHash: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
      console.error('Feedback error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // Function to determine slider background style (Tailwind visual helper)
  const getSliderBackground = (score) => {
    const percentage = ((score - 1) / 4) * 100;
    return {
      background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${percentage}%, #4B5563 ${percentage}%, #4B5563 100%)`
    }; 
  };
  
  // Standard Tailwind classes reused for inputs/labels
  const formInputClasses = `w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 transition-all`;
  const formLabelClasses = `form-label block font-semibold mb-1 text-gray-300 text-sm`;

  return (
    // Outer container: Dark background for consistency
    <div className="min-h-screen bg-[#1E1E2E] flex items-center justify-center p-4 sm:p-6 text-gray-200 font-sans relative">
      
      {/* Navigation Back Button */}
      <button 
          onClick={() => navigate('/')} 
          className="absolute top-4 left-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
      >
          <ArrowLeft className="w-5 h-5" /> Back to Home
      </button>

      <div className="w-full max-w-xl feedback-container relative z-10">
        
        {/* Feedback Card - Glassmorphic / Dark Contrast */}
        <div className="bg-gray-900/90 backdrop-blur-md feedback-card p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-800">
          
          <div className="text-center mb-6 border-b border-gray-700 pb-4">
            <h2 className="text-3xl font-extrabold text-white page-title flex items-center justify-center gap-2">
              <MessageSquare className="w-7 h-7 text-cyan-400" />
              Submit Feedback
            </h2>
            <p className="text-gray-400 page-subtitle mt-1">
              Help us improve predictions by sharing your recent experience.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 feedback-form">
            
            {/* Input: Name (Optional) */}
            <div className="form-group">
              <label htmlFor="commuterName" className={formLabelClasses}>
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" /> Name (Optional)
                </div>
              </label>
              <input
                id="commuterName"
                type="text"
                placeholder="Enter your name or leave blank for anonymous"
                name="commuterName"
                value={formData.commuterName}
                onChange={handleChange}
                className={formInputClasses}
                disabled={loading}
              />
            </div>

            {/* Input: Ticket Hash (Optional) */}
            <div className="form-group">
              <label htmlFor="ticketValidationHash" className={formLabelClasses}>
                <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-500" /> Ticket Validation Hash (Optional)
                </div>
              </label>
              <input
                id="ticketValidationHash"
                type="text"
                placeholder="Link feedback to a specific trip"
                name="ticketValidationHash"
                value={formData.ticketValidationHash}
                onChange={handleChange}
                className={`${formInputClasses} font-mono text-xs tracking-wider`}
                disabled={loading}
              />
            </div>
            
            {/* Input: Digital Literacy Score (Range) */}
            <div className="form-group bg-gray-800 p-4 rounded-lg border border-indigo-700 shadow-inner">
              <label htmlFor="digitalLiteracyScore" className="form-label text-indigo-400 font-semibold flex items-center gap-2">
                <Star className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                Digital Literacy Score (1-5) <span className="required text-red-500">*</span>
              </label>
              <div className="score-input flex items-center gap-4 mt-2">
                <input
                  id="digitalLiteracyScore"
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  name="digitalLiteracyScore"
                  value={formData.digitalLiteracyScore}
                  onChange={handleChange}
                  className="score-slider flex-grow h-2 rounded-lg appearance-none cursor-pointer"
                  style={getSliderBackground(formData.digitalLiteracyScore)}
                  disabled={loading}
                />
                <span className="score-value text-xl font-bold text-indigo-400 w-12 text-right">
                  {formData.digitalLiteracyScore.toFixed(1)}
                </span>
              </div>
              <div className="score-labels text-xs text-gray-500 flex justify-between mt-1 px-1">
                <span>1 (Poor)</span>
                <span>5 (Excellent)</span>
              </div>
            </div>

            {/* Input: Crowd Level (Select) */}
            <div className="form-group">
              <label htmlFor="crowdLevel" className={formLabelClasses}>
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gray-500" /> Crowd Level <span className="required text-red-500">*</span>
                </div>
              </label>
              <select
                id="crowdLevel"
                name="crowdLevel"
                value={formData.crowdLevel}
                onChange={handleChange}
                className={formInputClasses}
                disabled={loading}
              >
                <option value="Low">Low (Seats available)</option>
                <option value="Medium">Medium (Standing room)</option>
                <option value="High">High (Packed)</option>
                <option value="Severe">Severe (Can't move)</option>
              </select>
            </div>

            {/* Input: Delay Reported (Number) */}
            <div className="form-group">
              <label htmlFor="delayReported" className={formLabelClasses}>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" /> Delay Reported (minutes)
                </div>
              </label>
              <input
                id="delayReported"
                type="number"
                placeholder="Enter delay in minutes (e.g., 5)"
                name="delayReported"
                value={formData.delayReported}
                onChange={handleChange}
                className={formInputClasses}
                min="0"
                disabled={loading}
              />
            </div>

            {/* Input: Service Issue (Select) */}
            <div className="form-group">
              <label htmlFor="serviceIssue" className={formLabelClasses}>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gray-500" /> Service Issue
                </div>
              </label>
              <select
                id="serviceIssue"
                name="serviceIssue"
                value={formData.serviceIssue}
                onChange={handleChange}
                className={formInputClasses}
                disabled={loading}
              >
                <option value="None">None</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Driver Behavior">Driver Behavior</option>
                <option value="Technical Issue">Technical Issue</option>
              </select>
            </div>

            {/* Input: Notes (Textarea) */}
            <div className="form-group">
              <label htmlFor="notes" className={formLabelClasses}>
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-500" /> Additional Notes (Optional)
                </div>
              </label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Share any additional feedback..."
                value={formData.notes}
                onChange={handleChange}
                className={`${formInputClasses} min-h-[100px]`}
                rows="4"
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message bg-red-900/50 text-red-300 p-3 rounded-lg text-sm font-medium border border-red-700">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition duration-150 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/50"
              disabled={loading}
            >
              <span className="flex items-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </span>
            </button>
          </form>

          {/* Success/Result Display */}
          {result && (
            <div className="feedback-result mt-8 pt-6 border-t border-gray-700">
              <div className="success-header flex items-start gap-3 mb-4 bg-green-900/50 p-3 rounded-lg border border-green-700">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                    <h3 className="text-xl font-semibold text-green-300">{result.message}</h3>
                    <p className="text-sm text-green-600 mt-1">Your feedback is instantly fed into our AI models to update route health scores.</p>
                </div>
              </div>
              
              <div className="result-details bg-gray-800 p-4 rounded-lg space-y-2 text-sm border border-gray-700">
                <p><strong>Crowd Reported:</strong> {result.feedback.crowdLevel}</p>
                <p><strong>Delay Reported:</strong> {result.feedback.delayReported} minutes</p>
                <p><strong>Linked to Trip:</strong> <span className={result.feedback.isLinkedToTrip ? 'text-blue-400 font-semibold' : 'text-red-400'}>{result.feedback.isLinkedToTrip ? 'Yes' : 'No'}</span></p>
                <p className="text-xs text-gray-500 pt-2 border-t mt-2 border-gray-700">Submitted At: {new Date(result.feedback.submittedAt).toLocaleTimeString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;