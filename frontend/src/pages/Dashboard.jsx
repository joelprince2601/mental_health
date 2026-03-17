import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Psychology,
  Assessment,
  BarChart,
  PieChart,
} from '@mui/icons-material'
import { apiService } from '../services/api'
import StatCard from '../components/StatCard'
import SentimentChart from '../components/charts/SentimentChart'
import CategoryPieChart from '../components/charts/CategoryPieChart'

function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch dashboard statistics
      const statsResponse = await apiService.getDashboardStats()
      setStats(statsResponse.data)

      // Fetch sentiment distribution
      const sentimentResponse = await apiService.getSentimentDistribution()
      setSentimentData(sentimentResponse.data)

      // Fetch category distribution
      const categoryResponse = await apiService.getCategoryDistribution()
      setCategoryData(categoryResponse.data)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(err.message)
      // Use mock data for development
      setStats({
        totalPosts: 15420,
        totalUsers: 3250,
        avgSentiment: 0.42,
        negativePosts: 6240,
        positivePosts: 5230,
        neutralPosts: 3950,
      })
      setSentimentData([
        { name: 'Negative', value: 6240, color: '#ef4444' },
        { name: 'Positive', value: 5230, color: '#10b981' },
        { name: 'Neutral', value: 3950, color: '#64748b' },
      ])
      setCategoryData([
        { name: 'Depression', value: 2450 },
        { name: 'Anxiety', value: 1890 },
        { name: 'Stress', value: 1320 },
        { name: 'Support Seeking', value: 2100 },
        { name: 'Support Providing', value: 1890 },
        { name: 'Other', value: 5770 },
      ])
    } finally {
      setLoading(false)
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
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
        Dashboard Overview
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error} - Displaying sample data
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Posts"
            value={stats.totalPosts.toLocaleString()}
            icon={<Psychology sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={<Assessment sx={{ fontSize: 40 }} />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Positive Posts"
            value={stats.positivePosts.toLocaleString()}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Negative Posts"
            value={stats.negativePosts.toLocaleString()}
            icon={<TrendingDown sx={{ fontSize: 40 }} />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PieChart sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Sentiment Distribution
                </Typography>
              </Box>
              <SentimentChart data={sentimentData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <BarChart sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Category Distribution
                </Typography>
              </Box>
              <CategoryPieChart data={categoryData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
