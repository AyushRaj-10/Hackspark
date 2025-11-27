// api.js - API client for backend
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Submit a crowding report
 * @param {Object} payload - Report data
 * @param {string} payload.bus_id - Bus identifier
 * @param {string} payload.route_id - Route identifier
 * @param {string|null} payload.stop_id - Stop identifier (optional)
 * @param {number} payload.crowd_level - Crowd level (1-3)
 * @param {string} payload.source - Source ('user', 'driver', 'auto')
 * @returns {Promise<Object>} Response data
 */
export const postCrowdingReport = async (payload) => {
  const response = await api.post('/crowding-report', payload);
  return response.data;
};

/**
 * Get crowd score for a bus
 * @param {Object} params - Query parameters
 * @param {string} params.bus_id - Bus identifier
 * @param {string} params.route_id - Route identifier
 * @param {string|null} params.time - ISO date string (optional)
 * @returns {Promise<Object>} Crowd score data
 */
export const getCrowdScore = async ({ bus_id, route_id, time = null }) => {
  const params = { bus_id, route_id };
  if (time) params.time = time;
  const response = await api.get('/crowd-score', { params });
  return response.data;
};

/**
 * Get recent reports for a bus
 * @param {string} bus_id - Bus identifier
 * @param {number} limit - Maximum number of reports
 * @returns {Promise<Object>} Reports data
 */
export const getBusReports = async (bus_id, limit = 50) => {
  const response = await api.get(`/crowd-score/${bus_id}/reports`, {
    params: { limit },
  });
  return response.data;
};

export default api;

