// src/data/mockCarpools.js

export const MOCK_CARPOOLS = [
  {
    id: "c1",
    driverName: "Priya S.",
    role: "Software Engineer",
    rating: 4.9,
    seats: 2,
    price: 80,
    time: "Leaving in 10 min",
    route: "Indiranagar -> HSR Layout",
    femaleDriver: true, // Safety feature
    carModel: "Swift Dzire (Red)",
    coordinates: [[12.9716, 77.5946], [12.9121, 77.6446]] // Same path for demo
  },
  {
    id: "c2",
    driverName: "Rahul K.",
    role: "Student",
    rating: 4.5,
    seats: 1,
    price: 60,
    time: "Leaving in 5 min",
    route: "Majestic -> Koramangala",
    femaleDriver: false,
    carModel: "Hyundai i20",
    coordinates: [[12.9716, 77.5946], [12.9352, 77.6245]]
  }
];