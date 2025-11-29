// Popular locations in Delhi
export const delhiLocations = [
    // Major Areas
    { name: 'Rohini', lat: 28.7175, lng: 77.1003 },
    { name: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
    { name: 'Dwarka', lat: 28.5844, lng: 77.0489 },
    { name: 'Karol Bagh', lat: 28.6505, lng: 77.1926 },
    { name: 'Rajouri Garden', lat: 28.6388, lng: 77.1209 },
    { name: 'Punjabi Bagh', lat: 28.6546, lng: 77.1306 },
    { name: 'Rajendra Place', lat: 28.6394, lng: 77.1824 },
    { name: 'Patel Nagar', lat: 28.6384, lng: 77.1787 },
    { name: 'Central Secretariat', lat: 28.6139, lng: 77.2090 },
    { name: 'New Delhi Railway Station', lat: 28.6415, lng: 77.2204 },
    { name: 'Old Delhi Railway Station', lat: 28.6626, lng: 77.2274 },
    { name: 'Delhi Airport', lat: 28.5562, lng: 77.1000 },
    { name: 'Janakpuri', lat: 28.6221, lng: 77.0841 },
    { name: 'Pitampura', lat: 28.6969, lng: 77.1315 },
    { name: 'Rohini Sector 7', lat: 28.7123, lng: 77.1012 },
    { name: 'Rohini Sector 8', lat: 28.7145, lng: 77.1056 },
    { name: 'Rohini Sector 9', lat: 28.7167, lng: 77.1100 },
    { name: 'Rohini Sector 18', lat: 28.7256, lng: 77.1189 },
    { name: 'Rohini Sector 21', lat: 28.7334, lng: 77.1278 },
    { name: 'Rohini Sector 22', lat: 28.7356, lng: 77.1322 },
    { name: 'Rohini Sector 24', lat: 28.7400, lng: 77.1411 },
    { name: 'Rithala', lat: 28.7250, lng: 77.1000 },
    { name: 'Kohat Enclave', lat: 28.7000, lng: 77.1200 },
    { name: 'Rohini West', lat: 28.7100, lng: 77.0900 },
    { name: 'Rohini East', lat: 28.7200, lng: 77.1100 },
    { name: 'Paschim Vihar', lat: 28.6775, lng: 77.0900 },
    { name: 'Peera Garhi', lat: 28.6800, lng: 77.1000 },
    { name: 'Uttam Nagar', lat: 28.6219, lng: 77.0653 },
    { name: 'Subhash Nagar', lat: 28.6364, lng: 77.1158 },
    { name: 'Kirti Nagar', lat: 28.6517, lng: 77.1378 },
    { name: 'Shadipur', lat: 28.6556, lng: 77.1528 },
    { name: 'Patel Chowk', lat: 28.6325, lng: 77.2147 },
    { name: 'Mandi House', lat: 28.6314, lng: 77.2289 },
    { name: 'Barakhamba Road', lat: 28.6300, lng: 77.2264 },
    { name: 'R K Ashram Marg', lat: 28.6400, lng: 77.2000 },
    { name: 'Jhandewalan', lat: 28.6450, lng: 77.1989 },
    { name: 'Ramesh Nagar', lat: 28.6469, lng: 77.1328 },
    { name: 'Moti Nagar', lat: 28.6556, lng: 77.1458 },
    { name: 'Kirti Nagar', lat: 28.6517, lng: 77.1378 },
    { name: 'Shadipur Depot', lat: 28.6556, lng: 77.1528 },
    { name: 'Hauz Khas', lat: 28.5478, lng: 77.2044 },
    { name: 'Green Park', lat: 28.5542, lng: 77.2039 },
    { name: 'AIIMS', lat: 28.5665, lng: 77.2078 },
    { name: 'South Extension', lat: 28.5708, lng: 77.2147 },
    { name: 'Lajpat Nagar', lat: 28.5656, lng: 77.2414 },
    { name: 'Nehru Place', lat: 28.5500, lng: 77.2542 },
    { name: 'Kalkaji Mandir', lat: 28.5400, lng: 77.2600 },
    { name: 'Govind Puri', lat: 28.5350, lng: 77.2639 },
    { name: 'Okhla', lat: 28.5300, lng: 77.2700 },
    { name: 'Jasola', lat: 28.5200, lng: 77.2800 },
    { name: 'Sarita Vihar', lat: 28.5150, lng: 77.2850 },
    { name: 'Mayur Vihar', lat: 28.6100, lng: 77.3000 },
    { name: 'Anand Vihar', lat: 28.6500, lng: 77.3100 },
    { name: 'Kaushambi', lat: 28.6389, lng: 77.3244 },
    { name: 'Vaishali', lat: 28.6333, lng: 77.3389 },
    { name: 'Dilshad Garden', lat: 28.6800, lng: 77.3100 },
    { name: 'Shahdara', lat: 28.6739, lng: 77.2950 },
    { name: 'Vishwavidyalaya', lat: 28.6900, lng: 77.2122 },
    { name: 'Civil Lines', lat: 28.6828, lng: 77.2200 },
    { name: 'Kashmere Gate', lat: 28.6669, lng: 77.2294 },
    { name: 'Chandni Chowk', lat: 28.6581, lng: 77.2306 },
    { name: 'Chawri Bazar', lat: 28.6489, lng: 77.2261 },
    { name: 'New Delhi Metro Station', lat: 28.6415, lng: 77.2204 },
  ]
  
  // Calculate distance between two coordinates using Haversine formula
  export const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLng = (lng2 - lng1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in km
    return distance
  }
  
  // Calculate fare based on distance
  // Base fare: ₹10 for first 2km, then ₹5 per km
  export const calculateFare = (distance) => {
    if (distance <= 2) {
      return 10
    }
    const baseFare = 10
    const additionalKm = distance - 2
    const fare = baseFare + Math.ceil(additionalKm * 5)
    return fare
  }
  
  // Search locations by query string
  export const searchLocations = (query) => {
    if (!query || query.trim().length === 0) {
      return []
    }
    const lowerQuery = query.toLowerCase().trim()
    return delhiLocations.filter((location) =>
      location.name.toLowerCase().includes(lowerQuery)
    )
  }
  
  