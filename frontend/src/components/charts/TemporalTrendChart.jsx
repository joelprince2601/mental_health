import { Box, Typography } from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, item) => sum + (item.value || 0), 0)
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 1,
          p: 1.5,
        }}
      >
        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{ color: entry.color, mb: 0.5 }}
          >
            {entry.name}: {entry.value.toFixed(1)}%
          </Typography>
        ))}
        <Typography variant="body2" sx={{ color: '#fff', mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          Total: {total.toFixed(1)}%
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

function TemporalTrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    )
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date))

  return (
    <ResponsiveContainer width="100%" height={450}>
      <LineChart
        data={sortedData}
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
          domain={[0, 100]}
          tick={{ fill: '#fff', fontSize: 12 }}
          stroke="rgba(255,255,255,0.5)"
          label={{
            value: 'Percentage (%)',
            angle: -90,
            position: 'insideLeft',
            style: { fill: '#fff', textAnchor: 'middle' },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#fff', paddingTop: '20px' }} />
        <Line
          type="monotone"
          dataKey="negative"
          stroke="#ef4444"
          strokeWidth={3}
          name="Negative"
          dot={{ r: 5, fill: '#ef4444' }}
          activeDot={{ r: 7 }}
        />
        <Line
          type="monotone"
          dataKey="positive"
          stroke="#10b981"
          strokeWidth={3}
          name="Positive"
          dot={{ r: 5, fill: '#10b981' }}
          activeDot={{ r: 7 }}
        />
        <Line
          type="monotone"
          dataKey="neutral"
          stroke="#64748b"
          strokeWidth={3}
          name="Neutral"
          dot={{ r: 5, fill: '#64748b' }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default TemporalTrendChart
