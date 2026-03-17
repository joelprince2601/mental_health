import { Box, Typography } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#ef4444', '#f59e0b', '#10b981']

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

function HeatmapChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    )
  }

  // Transform data for heatmap and sort by total
  const chartData = data
    .map((item) => ({
      category: item.category,
      Negative: item.negative || 0,
      Neutral: item.neutral || 0,
      Positive: item.positive || 0,
      total: (item.negative || 0) + (item.neutral || 0) + (item.positive || 0),
    }))
    .sort((a, b) => b.total - a.total)

  return (
    <ResponsiveContainer width="100%" height={450}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fill: '#fff', fontSize: 12 }}
          stroke="rgba(255,255,255,0.5)"
          label={{
            value: 'Percentage (%)',
            position: 'insideBottom',
            offset: -10,
            style: { fill: '#fff', textAnchor: 'middle' },
          }}
        />
        <YAxis
          dataKey="category"
          type="category"
          width={100}
          tick={{ fill: '#fff', fontSize: 12 }}
          stroke="rgba(255,255,255,0.5)"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#fff', paddingTop: '20px' }} />
        <Bar dataKey="Negative" stackId="a" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
        <Bar dataKey="Neutral" stackId="a" fill={COLORS[1]} />
        <Bar dataKey="Positive" stackId="a" fill={COLORS[2]} radius={[4, 0, 0, 4]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default HeatmapChart
