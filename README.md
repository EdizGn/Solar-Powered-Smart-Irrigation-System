# Solar Smart Irrigation Dashboard

Frontend web dashboard for a **Solar-Powered Smart Irrigation System** with weather integration and AI-assisted decision making.

Developed as part of **CENG318 Microprocessors** course project (2025-2026 Spring Semester).

## Features

- **Real-time sensor monitoring** - Soil moisture, temperature, humidity, rain detection, battery level, Wi-Fi status
- **AI-based irrigation decisions** - Automatic recommendations based on sensor data and weather conditions
- **Manual pump control** - Override automatic mode with ON/OFF buttons and session timer
- **Water consumption reports** - Daily, weekly, and monthly charts with summary statistics
- **Irrigation history** - Filterable and sortable log of past irrigation events
- **Notification system** - Color-coded alerts with severity levels (info, success, warning, danger)
- **System settings** - Configurable thresholds, timing, and notification preferences
- **System health monitoring** - Component status overview, fault log, and safe mode detection

## Tech Stack

- **React** (Vite) - UI framework with functional components and hooks
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Charts and data visualization
- **React Router** - Client-side routing
- **Lucide React** - Icon library

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Default login credentials: `admin` / `admin123`

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── common/       # Card, StatusBadge
│   ├── dashboard/    # Sensor cards, moisture chart
│   ├── layout/       # Navbar, Sidebar, Layout
│   ├── notifications/# NotificationBell
│   └── reports/      # ConsumptionChart, ReportSummary
├── context/          # AuthContext, SystemContext (global state)
├── data/             # Mock data generators
├── hooks/            # useSimulatedData, useAuth
├── pages/            # All 8 page components
└── utils/            # Helper functions
```

## Backend Integration

This dashboard currently uses **mock data** with simulated real-time updates. All API touchpoints are marked with `// TODO: Replace with API call` comments for easy backend integration.

Key integration points:
- `src/context/SystemContext.jsx` - Central state management (swap mock state with API calls)
- `src/hooks/useSimulatedData.js` - Remove and replace with WebSocket/SSE connections
- `src/data/` - Mock data files to be replaced with API responses

## Team

- **UI/UX Dashboard** - Frontend development
- **Backend/API** - Hardware integration and API development (Ediz)
