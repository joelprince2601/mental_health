import { Box, Typography } from '@mui/material'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = ['#ef4444', '#10b981', '#64748b']

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    const total = payload.reduce((sum, item) => sum + (item.value || 0), 0)
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0
    
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 1,
          p: 1.5,
        }}
      >
        <Typography variant="body2" sx={{ color: data.payload.color || '#fff', fontWeight: 600, mb: 0.5 }}>
          {data.name}
        </Typography>
        <Typography variant="body2" sx={{ color: '#fff' }}>
          Count: {data.value.toLocaleString()}
        </Typography>
        <Typography variant="body2" sx={{ color: '#fff' }}>
          Percentage: {percentage}%
        </Typography>
      </Box>
    )
  }
  return null
}

function SentimentChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    )
  }

  const total = data.reduce((sum, item) => sum + (item.value || 0), 0)

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => {
            if (percent > 0.05) {
              return `${name}: ${(percent * 100).toFixed(1)}%`
            }
            return ''
          }}
          outerRadius={110}
          innerRadius={40}
          fill="#8884d8"
          dataKey="value"
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value, entry) => {
            const item = data.find(d => d.name === value)
            const count = item?.value || 0
            const percent = total > 0 ? ((count / total) * 100).toFixed(1) : 0
            return `${value} (${count.toLocaleString()} - ${percent}%)`
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default SentimentChart
