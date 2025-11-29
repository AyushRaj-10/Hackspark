# Hackspark

## ✨ Project Overview

City Stride is a comprehensive urban mobility platform designed to enhance the commuting experience. It offers real-time bus tracking, crowd estimation, secure ticketing, and intelligent route planning, all powered by AI. The platform integrates various technologies to provide users with safer, faster, and more efficient transit solutions.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📝 Table of Contents

1.  [Features](#-features)
2.  [Tech Stack](#-tech-stack)
3.  [Installation](#-installation)
    *   [Maps Frontend](#maps-frontend-installation)
    *   [Backend API](#backend-api-installation)
    *   [Frontend UI](#frontend-ui-installation)
4.  [Usage](#-usage)
    *   [Running the Maps Application](#running-the-maps-application)
    *   [Running the Backend API](#running-the-backend-api)
    *   [Running the Frontend UI](#running-the-frontend-ui)
5.  [Project Structure](#-project-structure)
    *   [Maps Application](#maps-application-structure)
    *   [Backend API](#backend-api-structure)
    *   [Frontend UI](#frontend-ui-structure)
6.  [API Reference](#-api-reference)
    *   [Maps API Endpoints](#maps-api-endpoints)
    *   [Backend API Endpoints](#backend-api-endpoints)
7.  [Contributing](#-contributing)
8.  [License](#-license)
9.  [Important Links](#-important-links)
10. [Footer](#-footer)

## 🚀 Features

*   🚌 **Real-time Vehicle Tracking:** Live location updates for Delhi public transport buses.
*   📊 **Crowd Estimation:** AI-powered crowd level prediction for buses.
*   🎫 **Secure Ticketing:** Cryptographically secure digital ticket booking.
*   🗺️ **Interactive Map:** Leaflet.js-based map with vehicle markers.
*   🚦 **Delay Calculation:** Automatic delay estimation based on vehicle movement.
*   📍 **Location Search:** Autocomplete location search using Nominatim OpenStreetMap API.
*   📱 **Responsive Design:** User interface adapts to desktop and mobile devices.
*   🛡️ **Female Safety Priority:** Route prioritization based on enhanced safety profiles
*   🌍 **Translation Support:**  Multi-language selection support.
*   🏅 **Gamification:** User profiles with points, badges, and levels to encourage transit use.

## 🛠️ Tech Stack

*   **Languages:** JavaScript, HTML, CSS, Markdown, JSON, Python
*   **Frameworks/Libraries:**
    *   Node.js
    *   Express
    *   React
    *   Leaflet.js
    *   Tailwind CSS
    *   Mongoose
    *   Vite
    *   gtfs-realtime-bindings
*   **Other Tools:**
    *   nodemon
    *   qrcode

## ⚙️ Installation

To set up the Hackspark project, follow the instructions for each component:

### Maps Frontend Installation

1.  Navigate to the `Maps` directory:

    ```bash
    cd Maps
    ```

2.  Install the dependencies:

    ```bash
    npm install
    ```

### Backend API Installation

1.  Navigate to the `backend` directory:

    ```bash
    cd backend
    ```

2.  Install the dependencies:

    ```bash
    npm install
    ```

3.  Set up environment variables by creating a `.env` file based on the `backend/env.template` template.
    Example `.env` configuration:
    ```env
MONGODB_URI=mongodb://localhost:27017/delhi_bus
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
AGGREGATION_ENABLED=true
AGGREGATION_CRON_SCHEDULE=0 2 * * 0
```

### Frontend UI Installation

1.  Navigate to the `frontend` directory:

    ```bash
    cd frontend
    ```

2.  Install the dependencies:

    ```bash
    npm install
    ```

3. Configure API endpoint (optional):
   Create a `.env` file in the `frontend` directory:
   ```env
VITE_API_BASE=http://localhost:4000/api
```
   If not set, defaults to `http://localhost:4000/api`

## 💻 Usage

### Running the Maps Application

1.  Navigate to the `Maps` directory:

    ```bash
    cd Maps
    ```

2.  Start the server:

    ```bash
    npm start
    ```

    Alternatively, for development with auto-reload:

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:8000`.

### Running the Backend API

1.  Navigate to the `backend` directory:

    ```bash
    cd backend
    ```

2.  Start the server:

    ```bash
    npm start
    ```

    Alternatively, for development with auto-reload:

    ```bash
    npm run dev
    ```
3. You can initialize the database and start weekly aggregation, but they are optional.
    ```bash
    npm run init-db
npm run aggregate
    ```

    The API will be available at `http://localhost:4000`.

### Running the Frontend UI

1.  Navigate to the `frontend` directory:

    ```bash
    cd frontend
    ```

2.  Start the development server:

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:5173`.

## 📂 Project Structure

### Maps Application Structure

```
Maps/
├── server.js          # Express backend server for live tracking
├── config.js          # Configuration (API key, URLs)
├── package.json       # Dependencies and scripts
├── public/            # Frontend files
│   ├── index.html     # Main HTML page
│   ├── style.css      # Styling
│   └── app.js         # Frontend JavaScript
└── README.md          # Documentation
```

### Backend API Structure

```
backend/
├── src/
│   ├── app.js          # Main Express app
│   ├── config/
│   │   └── db.js       # MongoDB connection
│   ├── models/         # Mongoose models
│   │   ├── CrowdingHistory.js
│   │   ├── CrowdingReport.js
│   │   ├── feedback.js
│   │   └── ticket.js
│   ├── routes/         # API routes
│   │   ├── crowding.js
│   │   ├── feedback.js
│   │   └── booking.js
│   ├── middleware/     # Validation middleware
│   │   └── validation.js
│   ├── utils/          # Utility functions
│   │   ├── cryptoUtils.js
│   │   ├── qrUtils.js
│   │   └── timeSlot.js
│   └── jobs/           # Background jobs
│   │   └── aggregateWeekly.js
├── package.json
└── README.md
```

### Frontend UI Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   │   ├── BusCard.jsx
│   │   └── CrowdButton.jsx
│   ├── pages/          # React Pages
│   │   ├── DashboardHome.jsx
│   │   └── Booking.jsx
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   ├── api.js          # API client
│   └── index.css       # Global styles
├── index.html
├── vite.config.js      # Vite configuration
└── package.json
```

## ⚙️ API Reference

### Maps API Endpoints

| Endpoint          | Method | Description                                                                 |
| :---------------- | :----- | :-------------------------------------------------------------------------- |
| `/api/vehicles`   | GET    | Returns JSON with all active vehicles and their positions.                  |
| `/api/health`     | GET    | Health check endpoint.                                                      |
| `/`               | GET    | Serves the main web interface.                                              |

### Backend API Endpoints

| Endpoint                       | Method | Description                                                            |
| :----------------------------- | :----- | :--------------------------------------------------------------------- |
| `/health`                     | GET    | Check server and database status                                     |
| `/api/crowding-report`        | POST   | Submit a new crowding report                                         |
| `/api/crowd-score`           | GET    | Get crowd score for a bus                                            |
| `/api/crowd-score/:bus_id/reports` | GET    | Get recent reports for a bus                                           |
| `/api/booking/book`            | POST   | Create a new ticket, generate hash, and QR code                        |
| `/api/feedback/submit`         | POST   | Submit commuter feedback for digital awareness and route health       |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive messages.
4.  Submit a pull request.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Important Links

*   **Live Demo:** No live demo link provided.
*   **AyushRaj-10 GitHub Profile:** [https://github.com/AyushRaj-10](https://github.com/AyushRaj-10)
*   **Repository:** [https://github.com/AyushRaj-10/Hackspark](https://github.com/AyushRaj-10/Hackspark)

## <footer> Footer

**Hackspark** - [https://github.com/AyushRaj-10/Hackspark](https://github.com/AyushRaj-10/Hackspark) by AyushRaj-10. Fork, like, star, report issues, and contribute! ✨


---
**<p align="center">Generated by [ReadmeCodeGen](https://www.readmecodegen.com/)</p>**