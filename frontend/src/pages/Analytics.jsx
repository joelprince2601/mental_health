import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Button,
} from '@mui/material'
import toast from 'react-hot-toast'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import BarChartIcon from '@mui/icons-material/BarChart'
import PsychologyIcon from '@mui/icons-material/Psychology'
import AssessmentIcon from '@mui/icons-material/Assessment'
import HeatmapChart from '../components/charts/HeatmapChart'
import TemporalTrendChart from '../components/charts/TemporalTrendChart'
import UserTrajectoryChart from '../components/charts/UserTrajectoryChart'
import SentimentChart from '../components/charts/SentimentChart'
import CategoryPieChart from '../components/charts/CategoryPieChart'
import SentimentAreaChart from '../components/charts/SentimentAreaChart'
import PostVolumeChart from '../components/charts/PostVolumeChart'
import CategoryStackedChart from '../components/charts/CategoryStackedChart'
import StatCard from '../components/StatCard'
import { apiService } from '../services/api'

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

function Analytics() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    avgSentiment: 0,
    negativePosts: 0,
    positivePosts: 0,
    neutralPosts: 0,
  })
  const [sentimentData, setSentimentData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [temporalData, setTemporalData] = useState([])
  const [heatmapData, setHeatmapData] = useState([])
  const [userTrajectoryData, setUserTrajectoryData] = useState([])
  const [postVolumeData, setPostVolumeData] = useState([])
  const [userActivityData, setUserActivityData] = useState([])
  const [sentimentRatios, setSentimentRatios] = useState({})
  const [selectedUserId, setSelectedUserId] = useState('')
  const [availableUsers, setAvailableUsers] = useState([])
  const [savedAnalyses, setSavedAnalyses] = useState([])
  const [selectedAnalysis, setSelectedAnalysis] = useState(null)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  })

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load dashboard stats, analytics data, and saved analyses
      const [statsRes, sentimentRes, categoryRes, temporalRes, heatmapRes, analysesRes] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getSentimentDistribution(),
        apiService.getCategoryDistribution(),
        apiService.getTemporalTrends(dateRange),
        apiService.getHeatmapData(),
        apiService.getSavedAnalyses(),
      ])

      setStats(statsRes.data || {
        totalPosts: 0,
        totalUsers: 0,
        avgSentiment: 0,
        negativePosts: 0,
        positivePosts: 0,
        neutralPosts: 0,
      })
      setSentimentData(sentimentRes.data || [])
      setCategoryData(categoryRes.data || [])
      setTemporalData(temporalRes.data || [])
      setHeatmapData(heatmapRes.data || [])
      setSavedAnalyses(analysesRes.data || [])
      
      // Load post volume and user activity from most recent analysis if available
      if (analysesRes.data && analysesRes.data.length > 0) {
        const mostRecent = analysesRes.data[0]
        if (mostRecent.stats) {
          // Try to load full analysis to get analytics
          try {
            const fullAnalysisRes = await apiService.getSavedAnalysis(mostRecent.id)
            if (fullAnalysisRes.data && fullAnalysisRes.data.analytics) {
              const analytics = fullAnalysisRes.data.analytics
              if (analytics.postVolume) {
                setPostVolumeData(analytics.postVolume)
              }
              if (analytics.userActivity) {
                setUserActivityData(analytics.userActivity)
                // Extract unique users from userActivity
                const users = analytics.userActivity.map(item => item.name)
                setAvailableUsers(users)
              }
              if (analytics.sentimentRatios) {
                setSentimentRatios(analytics.sentimentRatios)
              }
            }
          } catch (err) {
            console.error('Error loading full analysis for analytics:', err)
          }
        }
      }
    } catch (err) {
      console.error('Error loading analytics:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Note: User trajectory is now loaded manually via the "Load Trajectory" button
  // This useEffect was removed to prevent auto-loading

  const handleLoadUserTrajectory = async () => {
    if (!selectedUserId) return

    try {
      setLoading(true)
      // If an analysis is selected, use that analysis ID
      const analysisId = selectedAnalysis?.id
      const response = await apiService.getUserTrajectories(selectedUserId, analysisId)
      setUserTrajectoryData(response.data || [])
      if (response.data && response.data.length > 0) {
        toast.success(`Loaded trajectory for user: ${selectedUserId}`)
      } else {
        toast.info(`No trajectory data found for user: ${selectedUserId}`)
      }
    } catch (error) {
      console.error('Error loading user trajectory:', error)
      setUserTrajectoryData([])
      toast.error(`Failed to load trajectory: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleLoadAnalysis = async (analysis) => {
    try {
      setLoading(true)
      // Load full analysis data by analysis ID
      const response = await apiService.getSavedAnalysis(analysis.id)
      const fullAnalysis = response.data

      if (fullAnalysis) {
        setSelectedAnalysis(fullAnalysis)
        
        // Update stats
        if (fullAnalysis.stats) {
          setStats(fullAnalysis.stats)
        }
        
        // Update analytics data
        if (fullAnalysis.analytics) {
          const analytics = fullAnalysis.analytics
          
          // Update sentiment distribution
          if (analytics.sentimentDistribution && analytics.sentimentDistribution.length > 0) {
            setSentimentData(analytics.sentimentDistribution)
          }
          
          // Update category distribution
          if (analytics.categoryDistribution && analytics.categoryDistribution.length > 0) {
            setCategoryData(analytics.categoryDistribution)
          }
          
          // Update temporal trends
          if (analytics.temporalTrends && analytics.temporalTrends.length > 0) {
            setTemporalData(analytics.temporalTrends)
          }
          
          // Update heatmap data
          if (analytics.heatmapData && analytics.heatmapData.length > 0) {
            setHeatmapData(analytics.heatmapData)
          }
          
          // Update post volume
          if (analytics.postVolume && analytics.postVolume.length > 0) {
            setPostVolumeData(analytics.postVolume)
          }
          
          // Update user activity
          if (analytics.userActivity && analytics.userActivity.length > 0) {
            setUserActivityData(analytics.userActivity)
            // Extract unique users from userActivity
            const users = analytics.userActivity.map(item => item.name)
            setAvailableUsers(users)
          }
          
          // Update sentiment ratios
          if (analytics.sentimentRatios) {
            setSentimentRatios(analytics.sentimentRatios)
          }
        }
        
        toast.success(`Loaded analysis from ${new Date(fullAnalysis.timestamp).toLocaleString()}`)
      }
    } catch (error) {
      console.error('Error loading analysis:', error)
      toast.error('Failed to load analysis: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClearAnalysis = () => {
    setSelectedAnalysis(null)
    setSelectedUserId('')
    setUserTrajectoryData([])
    // Reload default analytics
    loadAnalyticsData()
    toast.success('Cleared selected analysis')
  }

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true)
      
      // Use selected analysis if available, otherwise use most recent
      const analysisId = selectedAnalysis?.id || (savedAnalyses.length > 0 ? savedAnalyses[0].id : null)
      
      if (!analysisId) {
        toast.error('No analysis available. Please run an analysis first.')
        setGeneratingReport(false)
        return
      }
      
      const response = await apiService.generateReport({
        type: 'comprehensive',
        includeVisualizations: true,
        includeStatistics: true,
        analysisId: analysisId,
      })
      
      if (response.data) {
        toast.success('Report generated successfully! You can view it in the Reports page.')
      } else {
        toast.error('Failed to generate report')
      }
    } catch (error) {
      toast.error('Failed to generate report: ' + error.message)
    } finally {
      setGeneratingReport(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Analytics & Visualizations
        </Typography>
        <Button
          variant="contained"
          onClick={handleGenerateReport}
          disabled={generatingReport || (!selectedAnalysis && savedAnalyses.length === 0)}
          startIcon={<AssessmentIcon />}
        >
          {generatingReport ? 'Generating...' : 'Generate Report'}
        </Button>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {selectedAnalysis && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleClearAnalysis}>
              Clear
            </Button>
          }
        >
          <Box>
            <Typography variant="body2" fontWeight={600}>
              Viewing saved analysis from {new Date(selectedAnalysis.timestamp).toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Analysis ID: {selectedAnalysis.id.substring(0, 8)}... | 
              Posts: {selectedAnalysis.stats?.totalPosts?.toLocaleString() || '0'} | 
              Users: {selectedAnalysis.stats?.totalUsers?.toLocaleString() || '0'}
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Posts"
            value={stats.totalPosts.toLocaleString()}
            icon={<PsychologyIcon sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Positive Posts"
            value={stats.positivePosts.toLocaleString()}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Negative Posts"
            value={stats.negativePosts.toLocaleString()}
            icon={<TrendingDownIcon sx={{ fontSize: 40 }} />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Saved Analyses Section */}
      {savedAnalyses.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                Saved Analyses
              </Typography>
              {selectedAnalysis && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleClearAnalysis}
                  color="secondary"
                >
                  Clear Selection
                </Button>
              )}
            </Box>
            <Grid container spacing={2}>
              {savedAnalyses.map((analysis) => {
                const isSelected = selectedAnalysis && selectedAnalysis.id === analysis.id
                return (
                  <Grid item xs={12} md={6} key={analysis.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        border: isSelected ? '2px solid' : '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        backgroundColor: isSelected ? 'rgba(255, 69, 0, 0.08)' : 'transparent',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'rgba(255, 69, 0, 0.05)',
                        },
                      }}
                      onClick={() => handleLoadAnalysis(analysis)}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              Analysis #{analysis.id.substring(0, 8)}
                            </Typography>
                            {isSelected && (
                              <Chip
                                label="Active"
                                size="small"
                                color="primary"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                          <Chip
                            label={new Date(analysis.timestamp).toLocaleDateString()}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {new Date(analysis.timestamp).toLocaleString()}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Posts: {analysis.stats?.totalPosts?.toLocaleString() || '0'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Users: {analysis.stats?.totalUsers?.toLocaleString() || '0'}
                          </Typography>
                        </Box>
                        <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Positive: {analysis.stats?.positivePosts?.toLocaleString() || '0'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Negative: {analysis.stats?.negativePosts?.toLocaleString() || '0'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable">
            <Tab label="Sentiment Analysis" icon={<BarChartIcon />} iconPosition="start" />
            <Tab label="Temporal Trends" icon={<TrendingUpIcon />} iconPosition="start" />
            <Tab label="Area Chart" icon={<TrendingUpIcon />} iconPosition="start" />
            <Tab label="Category Heatmap" icon={<BarChartIcon />} iconPosition="start" />
            <Tab label="Post Volume" icon={<BarChartIcon />} iconPosition="start" />
            <Tab label="User Activity" icon={<BarChartIcon />} iconPosition="start" />
            <Tab label="User Trajectories" icon={<TrendingUpIcon />} iconPosition="start" />
          </Tabs>

          {/* Sentiment Analysis Tab */}
          <TabPanel value={tabValue} index={0}>
            {/* Sentiment Ratios Display */}
            {Object.keys(sentimentRatios).length > 0 && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Negative Ratio
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="error">
                        {sentimentRatios.negativeRatio?.toFixed(1) || '0.0'}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Positive Ratio
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {sentimentRatios.positiveRatio?.toFixed(1) || '0.0'}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ backgroundColor: 'rgba(100, 116, 139, 0.1)' }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Neutral Ratio
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="text.secondary">
                        {sentimentRatios.neutralRatio?.toFixed(1) || '0.0'}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      Sentiment Distribution (Donut Chart)
                    </Typography>
                    <SentimentChart data={sentimentData} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      Category Distribution (Bar Chart)
                    </Typography>
                    <CategoryPieChart data={categoryData} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Temporal Trends Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Start Date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="End Date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Temporal Sentiment Trends
                </Typography>
                <TemporalTrendChart data={temporalData} />
              </CardContent>
            </Card>
          </TabPanel>

          {/* Area Chart Tab */}
          <TabPanel value={tabValue} index={2}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Sentiment Distribution Over Time (Area Chart)
                </Typography>
                <SentimentAreaChart data={temporalData} />
              </CardContent>
            </Card>
          </TabPanel>

          {/* Category Heatmap Tab */}
          <TabPanel value={tabValue} index={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Sentiment-Category Heatmap
                </Typography>
                <HeatmapChart data={heatmapData} />
              </CardContent>
            </Card>
          </TabPanel>

          {/* Post Volume Tab */}
          <TabPanel value={tabValue} index={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Daily Post Volume
                </Typography>
                <PostVolumeChart data={postVolumeData} />
              </CardContent>
            </Card>
          </TabPanel>

          {/* User Activity Tab */}
          <TabPanel value={tabValue} index={5}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Top Active Users
                </Typography>
                <CategoryStackedChart data={userActivityData} />
              </CardContent>
            </Card>
          </TabPanel>

          {/* User Trajectories Tab */}
          <TabPanel value={tabValue} index={6}>
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={availableUsers.length > 0 ? 8 : 12}>
                  {availableUsers.length > 0 ? (
                    <FormControl fullWidth>
                      <InputLabel>Select User</InputLabel>
                      <Select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        label="Select User"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {availableUsers.map((user) => (
                          <MenuItem key={user} value={user}>
                            {user}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      fullWidth
                      label="User ID"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      placeholder="Enter user ID to analyze trajectory"
                      helperText="Enter the exact username from the analysis"
                    />
                  )}
                </Grid>
                {availableUsers.length > 0 && (
                  <Grid item xs={12} md={4}>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="contained"
                        onClick={handleLoadUserTrajectory}
                        disabled={!selectedUserId || loading}
                        fullWidth
                      >
                        Load Trajectory
                      </Button>
                      {selectedUserId && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setSelectedUserId('')
                            setUserTrajectoryData([])
                          }}
                        >
                          Clear
                        </Button>
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  User Sentiment Trajectory
                </Typography>
                {selectedUserId ? (
                  loading ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <CircularProgress />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Loading trajectory data...
                      </Typography>
                    </Box>
                  ) : userTrajectoryData.length > 0 ? (
                    <UserTrajectoryChart userId={selectedUserId} data={userTrajectoryData} />
                  ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Alert severity="info">
                        No trajectory data found for user "{selectedUserId}". 
                        Make sure the user exists in the selected analysis.
                      </Alert>
                    </Box>
                  )
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Alert severity="info">
                      {availableUsers.length > 0 
                        ? 'Select a user from the dropdown above to view their sentiment trajectory over time'
                        : 'Enter a User ID above to view their sentiment trajectory over time'}
                    </Alert>
                  </Box>
                )}
              </CardContent>
            </Card>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Analytics
