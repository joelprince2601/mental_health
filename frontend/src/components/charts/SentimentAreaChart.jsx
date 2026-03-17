import { Box, Typography } from '@mui/material'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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

function SentimentAreaChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    )
  }

  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date))

  return (
    <ResponsiveContainer width="100%" height={450}>
      <AreaChart
        data={sortedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
      >
        <defs>
          <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#64748b" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#64748b" stopOpacity={0.1} />
          </linearGradient>
        </defs>
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
        <Area
          type="monotone"
          dataKey="negative"
          stackId="1"
          stroke="#ef4444"
          fillOpacity={1}
          fill="url(#colorNegative)"
          name="Negative"
        />
        <Area
          type="monotone"
          dataKey="neutral"
          stackId="1"
          stroke="#64748b"
          fillOpacity={1}
          fill="url(#colorNeutral)"
          name="Neutral"
        />
        <Area
          type="monotone"
          dataKey="positive"
          stackId="1"
          stroke="#10b981"
          fillOpacity={1}
          fill="url(#colorPositive)"
          name="Positive"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default SentimentAreaChart

