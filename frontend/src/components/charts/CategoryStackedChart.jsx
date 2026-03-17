import { Box, Typography } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#ff4500', '#ff6a33', '#ff8c66', '#ffad99', '#ffcecc']

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
            {entry.name}: {entry.value.toLocaleString()}
          </Typography>
        ))}
        <Typography variant="body2" sx={{ color: '#fff', mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          Total: {total.toLocaleString()}
        </Typography>
      </Box>
    )
  }
  return null
}

function CategoryStackedChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    )
  }

  // Sort by total value
  const sortedData = [...data].sort((a, b) => (b.value || 0) - (a.value || 0))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={sortedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fill: '#fff', fontSize: 12 }}
          stroke="rgba(255,255,255,0.5)"
        />
        <YAxis
          tick={{ fill: '#fff', fontSize: 12 }}
          stroke="rgba(255,255,255,0.5)"
          label={{
            value: 'Count',
            angle: -90,
            position: 'insideLeft',
            style: { fill: '#fff', textAnchor: 'middle' },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#fff' }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default CategoryStackedChart

