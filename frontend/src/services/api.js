import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred'
    return Promise.reject(new Error(message))
  }
)

// API endpoints
export const apiService = {
  // Configuration
  getConfig: () => api.get('/config'),
  updateConfig: (config) => api.post('/config', config),

  // Pipeline execution
  startPipeline: (params) => api.post('/pipeline/start', params),
  getPipelineStatus: (jobId) => api.get(`/pipeline/status/${jobId}`),
  stopPipeline: (jobId) => api.post(`/pipeline/stop/${jobId}`),
  pausePipeline: (jobId) => api.post(`/pipeline/pause/${jobId}`),
  resumePipeline: (jobId) => api.post(`/pipeline/resume/${jobId}`),
  getPipelineLogs: (jobId) => api.get(`/pipeline/logs/${jobId}`),

  // Analytics
  getSentimentDistribution: () => api.get('/analytics/sentiment-distribution'),
  getCategoryDistribution: () => api.get('/analytics/category-distribution'),
  getTemporalTrends: (params) => api.post('/analytics/temporal-trends', params),
  getUserTrajectories: (userId, analysisId = null) => {
    const url = analysisId 
      ? `/analytics/user-trajectories/${userId}?analysisId=${analysisId}`
      : `/analytics/user-trajectories/${userId}`
    return api.get(url)
  },
  getHeatmapData: () => api.get('/analytics/heatmap'),

  // Reports
  getReports: () => api.get('/reports'),
  generateReport: (params) => api.post('/reports/generate', params),
  getReport: (reportId) => api.get(`/reports/${reportId}`),
  downloadReport: (reportId) => api.get(`/reports/${reportId}/download`, { responseType: 'blob' }),

  // Data
  getRecentData: (limit = 100) => api.get(`/data/recent?limit=${limit}`),
  getThreadData: (threadId) => api.get(`/data/threads/${threadId}`),
  getProcessedData: (params) => api.post('/data/processed', params),

  // Statistics
  getStatistics: () => api.get('/statistics'),
  getDashboardStats: () => api.get('/statistics/dashboard'),

  // Saved Analyses
  getSavedAnalyses: () => api.get('/analyses'),
  getSavedAnalysis: (analysisId) => api.get(`/analyses/${analysisId}`),
  getAnalysisByJob: (jobId) => api.get(`/analyses/job/${jobId}`),
}

export default api
