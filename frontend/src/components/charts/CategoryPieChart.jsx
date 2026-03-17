import { Box, Typography } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#ff4500', '#ff6a33', '#ff8c66', '#ffad99', '#ffcecc', '#ffefef']

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
          {data.payload.name}
        </Typography>
        <Typography variant="body2" sx={{ color: '#fff' }}>
          Count: {data.value.toLocaleString()}
        </Typography>
      </Box>
    )
  }
  return null
}

function CategoryPieChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    )
  }

  // Sort data by value descending
  const sortedData = [...data].sort((a, b) => (b.value || 0) - (a.value || 0))

  return (
    <ResponsiveContainer width="100%" height={350}>
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
          label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fill: '#fff' } }}
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

export default CategoryPieChart
