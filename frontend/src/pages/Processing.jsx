import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Paper,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'

const steps = [
  'Configuration',
  'Data Extraction',
  'Preprocessing',
  'Sentiment Classification',
  'Category Classification',
  'Trajectory Analysis',
  'Visualization Generation',
  'Report Generation',
  'Completed',
]

function Processing() {
  const [searchParams] = useSearchParams()
  const jobId = searchParams.get('jobId')
  const [status, setStatus] = useState(null)
  const [activeStep, setActiveStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [logs, setLogs] = useState([])
  const [isPaused, setIsPaused] = useState(false)
  const logContainerRef = useRef(null)

  useEffect(() => {
    if (jobId) {
      const interval = setInterval(() => {
        fetchJobStatus()
        fetchLogs()
      }, 2000) // Poll every 2 seconds

      fetchJobStatus()
      fetchLogs()

      return () => clearInterval(interval)
    }
  }, [jobId])

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  const fetchJobStatus = async () => {
    if (!jobId) return

    try {
      const response = await apiService.getPipelineStatus(jobId)
      const jobStatus = response.data

      setStatus(jobStatus)
      setActiveStep(jobStatus.currentStep || 0)
      setProgress(jobStatus.progress || 0)
      setError(jobStatus.error || null)
      setIsPaused(jobStatus.isPaused || false)

      if (jobStatus.status === 'failed') {
        setError(jobStatus.error || 'Processing failed')
      }
    } catch (error) {
      console.error('Error fetching job status:', error)
    }
  }

  const fetchLogs = async () => {
    if (!jobId) return

    try {
      const response = await apiService.getPipelineLogs(jobId)
      setLogs(response.data.logs || [])
    } catch (error) {
      console.error('Error fetching logs:', error)
    }
  }

  const handleStopProcessing = async () => {
    if (!jobId) return

    try {
      await apiService.stopPipeline(jobId)
      toast.success('Processing stopped')
      setStatus({ ...status, status: 'stopped' })
    } catch (error) {
      toast.error('Failed to stop processing: ' + error.message)
    }
  }

  const handlePauseProcessing = async () => {
    if (!jobId) return

    try {
      await apiService.pausePipeline(jobId)
      toast.success('Processing paused')
      setIsPaused(true)
    } catch (error) {
      toast.error('Failed to pause processing: ' + error.message)
    }
  }

  const handleResumeProcessing = async () => {
    if (!jobId) return

    try {
      await apiService.resumePipeline(jobId)
      toast.success('Processing resumed - continuing to next step')
      setIsPaused(false)
    } catch (error) {
      toast.error('Failed to resume processing: ' + error.message)
    }
  }

  if (!jobId) {
    return (
      <Box>
        <Alert severity="warning">
          No job ID provided. Please start processing from the Configuration page.
        </Alert>
      </Box>
    )
  }

  const isProcessing = status?.status === 'processing'
  const isCompleted = status?.status === 'completed'
  const isFailed = status?.status === 'failed'

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
        Processing Status
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={600}>
                  Job ID: {jobId}
                </Typography>
                <Chip
                  label={status?.status || 'Initializing'}
                  color={
                    isCompleted
                      ? 'success'
                      : isFailed
                      ? 'error'
                      : isProcessing
                      ? 'warning'
                      : 'default'
                  }
                />
              </Box>

              <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 2 }}>
                {steps.map((label, index) => (
                  <Step key={label} completed={index < activeStep}>
                    <StepLabel
                      StepIconComponent={index < activeStep ? CheckCircleIcon : undefined}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography>{label}</Typography>
                        {index === activeStep && isProcessing && (
                          <CircularProgress size={16} sx={{ ml: 1 }} />
                        )}
                      </Box>
                      {index === activeStep && isProcessing && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          In progress...
                        </Typography>
                      )}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {error && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {error}
                </Alert>
              )}

              {isProcessing && (
                <Box sx={{ mt: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Overall Progress</Typography>
                    <Typography variant="body2">{progress}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              )}

              {isProcessing && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  {!isPaused ? (
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={handlePauseProcessing}
                      startIcon={<PauseIcon />}
                    >
                      Pause
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleResumeProcessing}
                      startIcon={<PlayArrowIcon />}
                    >
                      Resume / Next Step
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleStopProcessing}
                    startIcon={<CancelIcon />}
                  >
                    Stop Processing
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Live Logs Display */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
                Live Log Output
              </Typography>
              <Paper
                ref={logContainerRef}
                sx={{
                  backgroundColor: '#0b0b0b',
                  color: '#ffffff',
                  p: 2,
                  maxHeight: '400px',
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  borderRadius: 1,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {logs.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Waiting for logs...
                  </Typography>
                ) : (
                  logs.map((log, index) => {
                    const getColor = () => {
                      if (log.level === 'error') return '#ef4444'
                      if (log.level === 'warning') return '#f59e0b'
                      if (log.level === 'success') return '#10b981'
                      return '#cbd5e1'
                    }
                    return (
                      <Box
                        key={index}
                        sx={{
                          mb: 0.5,
                          display: 'flex',
                          gap: 1,
                          color: getColor(),
                        }}
                      >
                        <Typography
                          component="span"
                          sx={{
                            color: '#64748b',
                            minWidth: '60px',
                          }}
                        >
                          [{log.timestamp}]
                        </Typography>
                        <Typography component="span">{log.message}</Typography>
                      </Box>
                    )
                  })
                )}
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Statistics
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Total Posts:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {status?.totalPosts?.toLocaleString() || '0'}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Processed Posts:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {status?.processedPosts?.toLocaleString() || '0'}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Current Step:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {steps[activeStep] || 'N/A'}
                  </Typography>
                </Box>
                {status?.estimatedTimeRemaining && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Estimated Time Remaining:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {status.estimatedTimeRemaining}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {isCompleted && (
        <Alert severity="success" sx={{ mt: 3 }}>
          Processing completed successfully! You can now view the results in the Analytics and Reports sections.
        </Alert>
      )}
    </Box>
  )
}

export default Processing
