import { Box, Typography, Alert } from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

function UserTrajectoryChart({ userId, data = [] }) {
  const [loading, setLoading] = useState(false)
  const [trajectoryData, setTrajectoryData] = useState(data)

  useEffect(() => {
    if (userId && (!data || data.length === 0)) {
      loadUserTrajectory(userId)
    } else {
      setTrajectoryData(data)
    }
  }, [userId, data])

  const loadUserTrajectory = async (userId) => {
    try {
      setLoading(true)
      const response = await apiService.getUserTrajectories(userId)
      setTrajectoryData(response.data || [])
    } catch (error) {
      console.error('Error loading user trajectory:', error)
      setTrajectoryData([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Loading trajectory data...</Typography>
      </Box>
    )
  }

  if (!trajectoryData || trajectoryData.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="info">No trajectory data available for this user</Alert>
      </Box>
    )
  }

  // Transform data to include sentiment scores
  const chartData = trajectoryData.map((item) => ({
    date: item.date || item.timestamp,
    sentiment: item.sentiment || item.sentimentScore || 0,
    category: item.category,
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[-1, 1]} label={{ value: 'Sentiment Score', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" label="Neutral" />
        <Line
          type="monotone"
          dataKey="sentiment"
          stroke="#6366f1"
          strokeWidth={2}
          name="Sentiment Score"
          dot={{ r: 5 }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default UserTrajectoryChart
