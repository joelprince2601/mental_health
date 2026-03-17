import { Card, CardContent, Box, Typography } from '@mui/material'

function StatCard({ title, value, icon, color = 'primary' }) {
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 700, mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              color: `${color}.main`,
              backgroundColor: `${color}.light`,
              borderRadius: 2,
              p: 1.5,
              opacity: 0.1,
              '& svg': {
                color: `${color}.main`,
              },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default StatCard
