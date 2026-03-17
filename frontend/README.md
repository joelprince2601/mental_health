# Mental Health Sentiment Analysis - Frontend

React.js frontend application for the Mental Health Sentiment Trajectory Analysis System.

## Features

- **Dashboard**: Overview statistics and key metrics
- **Configuration**: Adjust extraction parameters (no API credentials in UI)
- **Analytics**: Interactive visualizations including sentiment distribution, temporal trends, category heatmaps, and user trajectories
- **Reports**: Generate and download comprehensive PDF reports
- **Processing**: Real-time monitoring of data processing pipeline

## Tech Stack

- **React 18.2** - UI library
- **Material-UI (MUI) 5** - Component library and styling
- **Recharts** - Charting library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Vite** - Build tool and dev server

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your API URL:
```
VITE_API_URL=http://localhost:5000/api
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build

Build for production:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Preview Production Build

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── charts/      # Chart components
│   │   ├── Layout.jsx   # Main layout component
│   │   └── StatCard.jsx # Statistics card component
│   ├── pages/           # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Configuration.jsx
│   │   ├── Analytics.jsx
│   │   ├── Reports.jsx
│   │   └── Processing.jsx
│   ├── services/        # API services
│   │   └── api.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── theme.js         # MUI theme configuration
├── index.html
├── package.json
└── vite.config.js
```

## API Integration

The frontend communicates with the backend API through the service layer in `src/services/api.js`. 

The backend should implement the following endpoints:
- `GET /api/config` - Get configuration
- `POST /api/config` - Update configuration
- `POST /api/pipeline/start` - Start processing pipeline
- `GET /api/pipeline/status/:jobId` - Get processing status
- `GET /api/analytics/sentiment-distribution` - Get sentiment distribution
- `GET /api/analytics/category-distribution` - Get category distribution
- `GET /api/reports` - List reports
- `POST /api/reports/generate` - Generate report
- And more...

## Features Overview

### Dashboard
- Overview statistics (total posts, users, sentiments)
- Sentiment distribution chart
- Category distribution chart

### Configuration
- Quick Start with secure server-side credentials
- Extraction parameters (subreddits, threads, date range)
- Processing settings (batch size, GPU, preprocessing)
- Output options (visualizations, reports)

### Analytics
- Sentiment analysis with interactive charts
- Temporal trend analysis over time
- Category-sentiment heatmaps
- Individual user sentiment trajectories

### Reports
- View generated reports
- Generate new comprehensive reports
- Download PDF reports
- Report status tracking

### Processing
- Real-time processing status
- Step-by-step progress indicator
- Statistics (posts processed, time remaining)
- Stop processing capability

## License

Same license as the main project.

