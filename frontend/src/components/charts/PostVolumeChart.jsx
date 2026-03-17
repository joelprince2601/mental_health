import { Box, Typography } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 1,
          p: 1.5,
        }}
      >
        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>
          {data.payload.date || data.payload.name}
        </Typography>
        <Typography variant="body2" sx={{ color: '#ff4500' }}>
          Posts: {data.value.toLocaleString()}
        </Typography>
      </Box>
    )
  }
  return null
}

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateString
  }
}

function PostVolumeChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    )
  }

  // Calculate total posts per day
  const dailyTotals = data.map((item) => ({
    date: item.date,
    total: (item.negative || 0) + (item.positive || 0) + (item.neutral || 0),
  })).sort((a, b) => new Date(a.date) - new Date(b.date))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={dailyTotals}
        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#fff', fontSize: 12 }}
          stroke="rgba(255,255,255,0.5)"
          angle={-45}
          textAnchor="end"
          height={80}
          tickFormatter={formatDate}
        />
        <YAxis
          tick={{ fill: '#fff', fontSize: 12 }}
          stroke="rgba(255,255,255,0.5)"
          label={{
            value: 'Number of Posts',
            angle: -90,
            position: 'insideLeft',
            style: { fill: '#fff', textAnchor: 'middle' },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
          {dailyTotals.map((entry, index) => (
            <Cell key={`cell-${index}`} fill="#ff4500" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default PostVolumeChart

