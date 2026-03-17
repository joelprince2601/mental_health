# Frontend Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file in the `frontend` directory:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:3000`

## Building for Production

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Preview the production build:**
   ```bash
   npm run preview
   ```

## Features

### Dashboard
- Overview statistics (total posts, users, sentiments)
- Sentiment distribution charts
- Category distribution charts

### Configuration
- Reddit API credentials configuration
- Extraction parameters setup
- Processing configuration
- Output options

### Analytics
- Sentiment analysis visualizations
- Temporal trend analysis
- Category-sentiment heatmaps
- User sentiment trajectories

### Reports
- Generate comprehensive PDF reports
- View and download reports
- Report status tracking

### Processing
- Real-time processing status monitoring
- Step-by-step progress tracking
- Statistics and time estimates

## Backend API Requirements

The frontend expects the backend to implement the following API endpoints:

### Configuration
- `GET /api/config` - Get configuration
- `POST /api/config` - Update configuration

### Pipeline
- `POST /api/pipeline/start` - Start processing
- `GET /api/pipeline/status/:jobId` - Get processing status
- `POST /api/pipeline/stop/:jobId` - Stop processing

### Analytics
- `GET /api/analytics/sentiment-distribution` - Get sentiment distribution
- `GET /api/analytics/category-distribution` - Get category distribution
- `POST /api/analytics/temporal-trends` - Get temporal trends
- `GET /api/analytics/user-trajectories/:userId` - Get user trajectory
- `GET /api/analytics/heatmap` - Get heatmap data

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports/generate` - Generate report
- `GET /api/reports/:reportId` - Get report details
- `GET /api/reports/:reportId/download` - Download report

### Statistics
- `GET /api/statistics` - Get general statistics
- `GET /api/statistics/dashboard` - Get dashboard statistics

## Development Notes

- The frontend uses mock data when the backend API is unavailable
- All API calls are handled through the `apiService` in `src/services/api.js`
- Charts are built using Recharts
- UI components use Material-UI (MUI)
- Toast notifications use react-hot-toast for user feedback

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, Vite will automatically use the next available port.

### API Connection Issues
- Verify the backend server is running on the correct port
- Check the `.env` file has the correct API URL
- Check browser console for CORS errors

### Build Errors
- Make sure all dependencies are installed: `npm install`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Next Steps

1. Ensure the backend API is implemented and running
2. Update the `.env` file with the correct API URL
3. Configure Reddit API credentials in the Configuration page
4. Start processing data from the Configuration page
5. View analytics and generate reports
