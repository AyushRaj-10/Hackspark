// validation.js - Request validation middleware

/**
 * Validate crowding report request body
 */
function validateCrowdingReport(req, res, next) {
  const { bus_id, route_id, crowd_level, source } = req.body;
  
  const errors = [];
  
  if (!bus_id || typeof bus_id !== 'string' || bus_id.trim().length === 0) {
    errors.push('bus_id is required and must be a non-empty string');
  }
  
  if (!route_id || typeof route_id !== 'string' || route_id.trim().length === 0) {
    errors.push('route_id is required and must be a non-empty string');
  }
  
  if (crowd_level === undefined || crowd_level === null) {
    errors.push('crowd_level is required');
  } else if (![1, 2, 3].includes(Number(crowd_level))) {
    errors.push('crowd_level must be 1 (low), 2 (medium), or 3 (high)');
  }
  
  if (!source || !['user', 'driver', 'auto'].includes(source)) {
    errors.push('source must be one of: user, driver, auto');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }
  
  next();
}

/**
 * Validate crowd score query parameters
 */
function validateCrowdScoreQuery(req, res, next) {
  const { bus_id, route_id } = req.query;
  
  if (!bus_id || typeof bus_id !== 'string' || bus_id.trim().length === 0) {
    return res.status(400).json({ 
      error: 'bus_id query parameter is required' 
    });
  }
  
  if (!route_id || typeof route_id !== 'string' || route_id.trim().length === 0) {
    return res.status(400).json({ 
      error: 'route_id query parameter is required' 
    });
  }
  
  next();
}

module.exports = {
  validateCrowdingReport,
  validateCrowdScoreQuery
};

