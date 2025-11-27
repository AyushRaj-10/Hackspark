# Delhi Bus Crowding Frontend

Modern React frontend for the Delhi Bus Crowding Estimation System. Built with Vite for fast development and optimized builds.

## Features

- Real-time crowd score display
- Interactive crowd reporting
- Auto-refreshing data (every 15 seconds)
- Responsive design
- Modern, intuitive UI

## Prerequisites

- Node.js >= 16.0.0
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API endpoint (optional):**
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_BASE=http://localhost:4000/api
   ```
   If not set, defaults to `http://localhost:4000/api`

3. **Run development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```
   Output will be in the `dist/` directory

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   │   ├── BusCard.jsx
│   │   └── CrowdButton.jsx
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   ├── api.js          # API client
│   └── index.css       # Global styles
├── index.html
├── vite.config.js      # Vite configuration
└── package.json
```

## Components

### BusCard
Displays crowd information for a specific bus:
- Current crowd score
- Category (Low/Medium/High)
- Score components breakdown
- Auto-refresh functionality

### CrowdButton
Allows users to report crowding levels:
- Three levels: Low (🟢), Medium (🟡), High (🔴)
- Visual feedback on submission
- Automatic score refresh after reporting

## Development

- Hot module replacement (HMR) enabled
- Fast refresh for React components
- Proxy configured for API requests during development

## License

MIT

