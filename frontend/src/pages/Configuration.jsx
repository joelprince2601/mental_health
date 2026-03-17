import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PsychologyIcon from '@mui/icons-material/Psychology'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AssessmentIcon from '@mui/icons-material/Assessment'
import SentimentChart from '../components/charts/SentimentChart'
import CategoryPieChart from '../components/charts/CategoryPieChart'
import StatCard from '../components/StatCard'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'

function Configuration() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [lastJobId, setLastJobId] = useState(null)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [config, setConfig] = useState({
    // Extraction Parameters
    subreddits: ['depression', 'anxiety', 'mentalhealth'],
    extractionMode: 'full_threads',
    threadsPerSubreddit: 10,
    minComments: 5,
    threadUrl: '',
    username: '',
    filePath: '',
    dateRange: {
      start: '',
      end: '',
    },
    
    // Processing Configuration
    batchSize: 32,
    useGPU: false,
    enablePreprocessing: true,
    
    // Output Configuration
    saveVisualizations: true,
    generateReports: true,
    exportFormat: 'csv',
  })

  useEffect(() => {
    loadConfig()
    // Check for completed jobs and load results
    const savedJobId = localStorage.getItem('lastJobId')
    if (savedJobId) {
      checkJobStatus(savedJobId)
    }
  }, [])

  // Poll for job completion and results
  useEffect(() => {
    if (!lastJobId) return

    const interval = setInterval(async () => {
      await checkJobStatus(lastJobId)
    }, 3000) // Check every 3 seconds

    return () => clearInterval(interval)
  }, [lastJobId])

  const checkJobStatus = async (jobId) => {
    try {
      const statusResponse = await apiService.getPipelineStatus(jobId)
      const jobStatus = statusResponse.data

      if (jobStatus.status === 'completed' && jobStatus.analysisId) {
        // Job completed, load analysis results
        const analysisResponse = await apiService.getAnalysisByJob(jobId)
        setAnalysisResults(analysisResponse.data)
        setProcessing(false)
      } else if (jobStatus.status === 'failed' || jobStatus.status === 'stopped') {
        setProcessing(false)
      }
    } catch (error) {
      console.error('Error checking job status:', error)
    }
  }

  const loadConfig = async () => {
    try {
      setLoading(true)
      const response = await apiService.getConfig()
      if (response.data) {
        setConfig((prev) => ({ ...prev, ...response.data }))
      }
    } catch (error) {
      console.error('Error loading config:', error)
      // Config will use defaults if API fails
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await apiService.updateConfig(config)
      toast.success('Configuration saved successfully!')
    } catch (error) {
      toast.error('Failed to save configuration: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleStartProcessing = async () => {
    try {
      setProcessing(true)
      
      // Validate based on extraction mode
      if (config.extractionMode === 'user_specific') {
        if (!config.threadUrl || !config.threadUrl.trim()) {
          toast.error('Please provide a Reddit thread URL')
          setProcessing(false)
          return
        }
        if (!config.username || !config.username.trim()) {
          toast.error('Please provide a username')
          setProcessing(false)
          return
        }
        // Validate thread URL format
        if (!config.threadUrl.includes('reddit.com') || !config.threadUrl.includes('/comments/')) {
          toast.error('Please provide a valid Reddit thread URL (must contain reddit.com/comments/)')
          setProcessing(false)
          return
        }
      } else if (config.extractionMode === 'existing_files') {
        if (!config.filePath || !config.filePath.trim()) {
          toast.error('Please provide a file path')
          setProcessing(false)
          return
        }
      } else if (config.extractionMode === 'full_threads') {
        if (!config.subreddits || config.subreddits.length === 0 || config.subreddits.every(s => !s.trim())) {
          toast.error('Please provide at least one subreddit')
          setProcessing(false)
          return
        }
      }
      
      // Build params based on selected extraction mode
      let params = {
        extractionMode: config.extractionMode,
        batchSize: config.batchSize,
        useGPU: config.useGPU,
      }

      if (config.extractionMode === 'full_threads') {
        // Filter out empty subreddits
        const validSubreddits = config.subreddits.filter(s => s && s.trim())
        params = {
          ...params,
          subreddits: validSubreddits,
          threadsPerSubreddit: config.threadsPerSubreddit,
          minComments: config.minComments,
        }
      } else if (config.extractionMode === 'user_specific') {
        params = {
          ...params,
          threadUrl: config.threadUrl.trim(),
          username: config.username.trim(),
        }
      } else if (config.extractionMode === 'existing_files') {
        params = {
          ...params,
          filePath: config.filePath.trim(),
        }
      }

      const response = await apiService.startPipeline(params)
      
      toast.success('Processing started!')
      // Store job ID and redirect to processing page
      if (response.data?.jobId) {
        const jobId = response.data.jobId
        setLastJobId(jobId)
        localStorage.setItem('lastJobId', jobId)
        window.location.href = `/processing?jobId=${jobId}`
      }
    } catch (error) {
      toast.error('Failed to start processing: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNestedChange = (parent, field, value) => {
    setConfig((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }))
  }

  const handleSubredditChange = (index, value) => {
    const newSubreddits = [...config.subreddits]
    newSubreddits[index] = value
    handleChange('subreddits', newSubreddits)
  }

  const addSubreddit = () => {
    handleChange('subreddits', [...config.subreddits, ''])
  }

  const removeSubreddit = (index) => {
    const newSubreddits = config.subreddits.filter((_, i) => i !== index)
    handleChange('subreddits', newSubreddits)
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
          Configuration
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleStartProcessing}
            disabled={processing}
          >
            {processing ? 'Starting...' : 'Start Processing'}
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Extraction and processing run with secure server-side credentials. Adjust parameters below and start the analysis.
      </Alert>

      <Grid container spacing={3}>
        {/* Quick Start */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Quick Start
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use recommended defaults and begin analysis immediately. Credentials are handled securely by the server.
              </Typography>
              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  onClick={handleStartProcessing}
                  disabled={processing}
                >
                  {processing ? 'Starting...' : 'Run Analysis'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Current Parameters'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Extraction Parameters */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Extraction Parameters
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Target Subreddits
                  </Typography>
                  {config.extractionMode === 'full_threads' && config.subreddits.map((subreddit, index) => (
                    <Box key={index} display="flex" gap={2} mb={2}>
                      <TextField
                        fullWidth
                        label={`Subreddit ${index + 1}`}
                        value={subreddit}
                        onChange={(e) => handleSubredditChange(index, e.target.value)}
                        placeholder="e.g., depression"
                      />
                      {config.subreddits.length > 1 && (
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => removeSubreddit(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                  ))}
                  {config.extractionMode === 'full_threads' && (
                    <Button variant="outlined" onClick={addSubreddit}>
                      Add Subreddit
                    </Button>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Extraction Mode</InputLabel>
                    <Select
                      value={config.extractionMode}
                      onChange={(e) => handleChange('extractionMode', e.target.value)}
                      label="Extraction Mode"
                    >
                      <MenuItem value="full_threads">Full Threads</MenuItem>
                      <MenuItem value="user_specific">User Specific</MenuItem>
                      <MenuItem value="existing_files">Existing Files</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {config.extractionMode === 'full_threads' && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Threads per Subreddit"
                        value={config.threadsPerSubreddit}
                        onChange={(e) => handleChange('threadsPerSubreddit', parseInt(e.target.value))}
                        inputProps={{ min: 1, max: 100 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Minimum Comments"
                        value={config.minComments}
                        onChange={(e) => handleChange('minComments', parseInt(e.target.value))}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                  </>
                )}

                {config.extractionMode === 'user_specific' && (
                  <>
                    <Grid item xs={12}>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          <strong>User-Specific Extraction:</strong> Extract all comments from a specific user in a Reddit thread.
                        </Typography>
                        <Typography variant="body2">
                          Provide the full Reddit thread URL and the username of the user whose comments you want to extract.
                        </Typography>
                      </Alert>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        required
                        label="Reddit Thread URL"
                        value={config.threadUrl}
                        onChange={(e) => handleChange('threadUrl', e.target.value)}
                        placeholder="https://www.reddit.com/r/mentalhealth/comments/abc123/..."
                        helperText="Must be a valid Reddit thread URL containing 'reddit.com' and '/comments/'"
                        error={config.threadUrl && !(config.threadUrl.includes('reddit.com') && config.threadUrl.includes('/comments/'))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label="Username"
                        value={config.username}
                        onChange={(e) => handleChange('username', e.target.value)}
                        placeholder="e.g., some_user123"
                        helperText="Enter the exact Reddit username (case-sensitive)"
                      />
                    </Grid>
                  </>
                )}

                {config.extractionMode === 'existing_files' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Existing CSV File Path (server-side)"
                      value={config.filePath}
                      onChange={(e) => handleChange('filePath', e.target.value)}
                      placeholder="C:/path/to/file.csv or /absolute/path/on/server.csv"
                      helperText="Path should be accessible to the server"
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Start Date (Optional)"
                    value={config.dateRange.start}
                    onChange={(e) => handleNestedChange('dateRange', 'start', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="End Date (Optional)"
                    value={config.dateRange.end}
                    onChange={(e) => handleNestedChange('dateRange', 'end', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Processing Configuration */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Processing Configuration
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Batch Size"
                    value={config.batchSize}
                    onChange={(e) => handleChange('batchSize', parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 128 }}
                    helperText="Recommended: 16-32"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Export Format</InputLabel>
                    <Select
                      value={config.exportFormat}
                      onChange={(e) => handleChange('exportFormat', e.target.value)}
                      label="Export Format"
                    >
                      <MenuItem value="csv">CSV</MenuItem>
                      <MenuItem value="json">JSON</MenuItem>
                      <MenuItem value="excel">Excel</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.useGPU}
                        onChange={(e) => handleChange('useGPU', e.target.checked)}
                      />
                    }
                    label="Use GPU Acceleration (Recommended)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.enablePreprocessing}
                        onChange={(e) => handleChange('enablePreprocessing', e.target.checked)}
                      />
                    }
                    label="Enable Text Preprocessing"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.saveVisualizations}
                        onChange={(e) => handleChange('saveVisualizations', e.target.checked)}
                      />
                    }
                    label="Save Visualizations"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.generateReports}
                        onChange={(e) => handleChange('generateReports', e.target.checked)}
                      />
                    }
                    label="Generate PDF Reports"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Display */}
        {analysisResults && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      Analysis Results
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed: {new Date(analysisResults.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Total Posts"
                      value={analysisResults.stats?.totalPosts?.toLocaleString() || '0'}
                      icon={<PsychologyIcon sx={{ fontSize: 40 }} />}
                      color="primary"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Total Users"
                      value={analysisResults.stats?.totalUsers?.toLocaleString() || '0'}
                      icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
                      color="secondary"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Positive Posts"
                      value={analysisResults.stats?.positivePosts?.toLocaleString() || '0'}
                      icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
                      color="success"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Negative Posts"
                      value={analysisResults.stats?.negativePosts?.toLocaleString() || '0'}
                      icon={<TrendingDownIcon sx={{ fontSize: 40 }} />}
                      color="error"
                    />
                  </Grid>
                </Grid>

                {/* Charts */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                          Sentiment Distribution
                        </Typography>
                        <SentimentChart
                          data={[
                            {
                              name: 'Negative',
                              value: analysisResults.stats?.negativePosts || 0,
                              color: '#ef4444',
                            },
                            {
                              name: 'Positive',
                              value: analysisResults.stats?.positivePosts || 0,
                              color: '#10b981',
                            },
                            {
                              name: 'Neutral',
                              value: analysisResults.stats?.neutralPosts || 0,
                              color: '#64748b',
                            },
                          ]}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                          Analysis Information
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Analysis ID:</strong> {analysisResults.id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Job ID:</strong> {analysisResults.jobId}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Timestamp:</strong> {new Date(analysisResults.timestamp).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Extraction Mode:</strong> {analysisResults.config?.extractionMode || 'N/A'}
                          </Typography>
                          {analysisResults.config?.params && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                Configuration:
                              </Typography>
                              {Object.entries(analysisResults.config.params).map(([key, value]) => (
                                <Typography key={key} variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                                  {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Alert severity="success" sx={{ mt: 3 }}>
                  Analysis completed successfully! Results have been saved and are available in the Analytics page.
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default Configuration
