// src/data/mockRoutes.js

const POINTS = {
  start: [12.9716, 77.5946], // Majestic
  mid_fast: [12.9600, 77.6000],
  mid_scenic: [12.9800, 77.6400], 
  end: [12.9121, 77.6446] // HSR Layout
};

export const MOCK_RESULTS = [
  {
    id: "r1",
    type: "fastest",
    label: "Public Transport",
    mode: "BUS", 
    duration: "45 min",
    price: 35, // Base price (Bus)
    arrivalTime: "10:15 AM",
    crowdLevel: "High", 
    isScenic: false,
    safetyRating: 4.2, 
    color: "#2563EB", 
    coordinates: [POINTS.start, POINTS.mid_fast, POINTS.end],
    
    // NEW: Specific Buses available for this route
    availableBuses: [
      { number: "335-E", eta: "2 mins", crowd: "High", seats: false },
      { number: "V-500CA", eta: "15 mins", crowd: "Low", seats: true },
      { number: "365-J", eta: "22 mins", crowd: "Medium", seats: false }
    ],
    
    // NEW: Comparison of Modes for this same path
    fareBreakdown: [
      { mode: "Bus", provider: "BMTC Non-AC", price: 35, time: "45 min" },
      { mode: "Bus", provider: "Vajra (AC)", price: 75, time: "40 min" },
      { mode: "Auto", provider: "Ola Auto", price: 180, time: "30 min" },
      { mode: "Cab", provider: "Uber Go", price: 340, time: "25 min" }
    ]
  },
  {
    id: "r2",
    type: "scenic",
    label: "Scenic Cab Ride",
    mode: "CAB", 
    duration: "55 min",
    price: 340,
    arrivalTime: "10:25 AM",
    crowdLevel: "Low",
    isScenic: true,
    scenicScore: 95,
    safetyRating: 4.9,
    color: "#059669", 
    coordinates: [POINTS.start, POINTS.mid_scenic, POINTS.end],
    
    // No buses for a cab-specific scenic route
    availableBuses: [],
    
    // Detailed Cab Comparisons
    fareBreakdown: [
      { mode: "Cab", provider: "Uber Premier", price: 340, time: "55 min" },
      { mode: "Cab", provider: "Ola Prime", price: 355, time: "55 min" },
      { mode: "Bike", provider: "Rapido", price: 150, time: "45 min" }
    ],

    scenicImages: [
      { url: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1000&auto=format&fit=crop", name: "Cubbon Park Greenery" },
      { url: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1000&auto=format&fit=crop", name: "Ulsoor Lake View" },
      { url: "https://images.unsplash.com/photo-1629196911514-cfd8d628e96c?q=80&w=1000&auto=format&fit=crop", name: "Indiranagar Tree Arch" }
    ]
  }
];