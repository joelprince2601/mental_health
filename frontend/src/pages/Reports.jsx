import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

function Reports() {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [reports, setReports] = useState([])

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const response = await apiService.getReports()
      setReports(response.data || [])
    } catch (error) {
      console.error('Error loading reports:', error)
      toast.error('Failed to load reports: ' + error.message)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    try {
      setGenerating(true)
      
      // Get the most recent analysis ID
      const analysesResponse = await apiService.getSavedAnalyses()
      const analyses = analysesResponse.data || []
      
      if (analyses.length === 0) {
        toast.error('No analyses available. Please run an analysis first.')
        setGenerating(false)
        return
      }
      
      // Use most recent analysis
      const mostRecentAnalysis = analyses[0]
      
      const response = await apiService.generateReport({
        type: 'comprehensive',
        includeVisualizations: true,
        includeStatistics: true,
        analysisId: mostRecentAnalysis.id,
      })
      
      if (response.data) {
        toast.success('Report generated successfully!')
        // Refresh reports list
        await loadReports()
      } else {
        toast.error('Failed to generate report')
      }
    } catch (error) {
      toast.error('Failed to generate report: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleViewReport = async (reportId) => {
    try {
      const response = await apiService.getReport(reportId)
      // Open report in new window or modal
      window.open(`/api/reports/${reportId}/view`, '_blank')
    } catch (error) {
      toast.error('Failed to load report: ' + error.message)
    }
  }

  const handleDownloadReport = async (reportId) => {
    try {
      const response = await apiService.downloadReport(reportId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${reportId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Report downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download report: ' + error.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'processing':
        return 'warning'
      case 'failed':
        return 'error'
      default:
        return 'default'
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Reports
        </Typography>
        <Button
          variant="contained"
          onClick={handleGenerateReport}
          disabled={generating}
        >
          {generating ? 'Generating...' : 'Generate New Report'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
                Generated Reports
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Report Name</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Date Generated</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Size</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Alert severity="info">No reports available. Generate your first report above.</Alert>
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports.map((report) => (
                        <TableRow key={report.id} hover>
                          <TableCell>{report.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={report.type}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {format(new Date(report.date), 'MMM dd, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={report.status}
                              size="small"
                              color={getStatusColor(report.status)}
                            />
                          </TableCell>
                          <TableCell>{report.size}</TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleViewReport(report.id)}
                                color="primary"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadReport(report.id)}
                                color="primary"
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Report Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Reports are comprehensive PDF documents containing:
                </Typography>
                <Box component="ul" sx={{ pl: 3 }}>
                  <li>Sentiment distribution analysis</li>
                  <li>Category breakdown by mental health dimensions</li>
                  <li>Temporal trend analysis</li>
                  <li>User-level progression statistics</li>
                  <li>Statistical summaries (regression, volatility, trend tests)</li>
                  <li>Visualizations and charts</li>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Reports are generated based on processed data and can be downloaded or viewed directly.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Reports
