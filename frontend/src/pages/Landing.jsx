import { Box, Typography, Button, Grid, Card, CardContent, Container, Divider, Chip, Paper } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PsychologyIcon from '@mui/icons-material/Psychology'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import SettingsIcon from '@mui/icons-material/Settings'
import AssessmentIcon from '@mui/icons-material/Assessment'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import DataObjectIcon from '@mui/icons-material/DataObject'
import TimelineIcon from '@mui/icons-material/Timeline'
import BarChartIcon from '@mui/icons-material/BarChart'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import StorageIcon from '@mui/icons-material/Storage'
import ScienceIcon from '@mui/icons-material/Science'
import SpeedIcon from '@mui/icons-material/Speed'
import FilterAltIcon from '@mui/icons-material/FilterAlt'

function Landing() {
  const navigate = useNavigate()

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        {/* Hero Section */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box
              sx={{
                backgroundColor: 'rgba(255, 69, 0, 0.1)',
                borderRadius: '50%',
                p: 3,
                display: 'inline-flex',
              }}
            >
              <PsychologyIcon sx={{ fontSize: 80, color: 'primary.main' }} />
            </Box>
          </Box>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
            Mental Health Sentiment Analysis System
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}>
            Advanced AI-powered platform for analyzing mental health discussions on Reddit using 
            state-of-the-art transformer models to extract insights, track sentiment patterns, and 
            understand user trajectories over time.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrowIcon />}
              onClick={() => navigate('/configuration')}
              sx={{ px: 5, py: 1.5, fontSize: '1.1rem' }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<AnalyticsIcon />}
              onClick={() => navigate('/analytics')}
              sx={{ px: 5, py: 1.5, fontSize: '1.1rem' }}
            >
              View Analytics
            </Button>
          </Box>
        </Box>

        {/* What We Do Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
            What We Do
          </Typography>
          <Card sx={{ mb: 4, backgroundColor: 'rgba(255, 69, 0, 0.05)', border: '1px solid rgba(255, 69, 0, 0.2)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, mb: 3 }}>
                Our system extracts and analyzes mental health discussions from Reddit subreddits to provide 
                comprehensive insights into sentiment patterns, mental health categories, and user trajectories. 
                The platform uses advanced natural language processing powered by transformer models to:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <FilterAltIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Extract & Process Data
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Collect Reddit posts and comments from mental health subreddits (default: depression, anxiety, mentalhealth), 
                        clean and preprocess text data (URL removal, contraction handling, special character removal)
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <ScienceIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        AI-Powered Analysis
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Use transformer models (RoBERTa & MentalBERT) to classify sentiment and categorize 
                        mental health topics with high accuracy
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <BarChartIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Generate Insights
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create 7 chart types showing sentiment distributions (Negative/Neutral/Positive), 
                        temporal trends, category breakdowns (10 categories), post volume, user activity, and trajectories
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TimelineIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Track Trajectories
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Monitor individual user sentiment changes over time to understand mental health 
                        progression patterns
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* Transformer Models Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
            Transformer Models
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 4, maxWidth: 800, mx: 'auto' }}>
            Our system leverages two state-of-the-art transformer models, each fine-tuned for specific tasks 
            in mental health analysis
          </Typography>
          
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {/* RoBERTa Section */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 48, color: 'error.main' }} />
                    <Box>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        RoBERTa (Robustly Optimized BERT Pretraining Approach)
                      </Typography>
                      <Chip label="Detection" color="error" size="small" />
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                    <strong>Purpose:</strong> Detection of sentiment patterns in mental health discussions
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                    <strong>Task:</strong> Detects and classifies each post/comment into three sentiment categories:
                  </Typography>
                  <Box sx={{ pl: 2, mb: 2 }}>
                    <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                      • <strong>Negative:</strong> Expresses distress, sadness, anxiety, or negative emotions
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      • <strong>Neutral:</strong> Informational, factual, or balanced emotional tone
                    </Typography>
                    <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                      • <strong>Positive:</strong> Shows improvement, hope, gratitude, or positive outlook
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                    <strong>How It Works:</strong> The model analyzes cleaned text input, processes it through 
                    transformer layers to understand context and emotional tone, then outputs probability scores 
                    for each sentiment class. The highest probability determines the sentiment label.
                  </Typography>
                  <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      <strong>Model:</strong> RoBERTa-base fine-tuned on mental health sentiment datasets
                      <br />
                      <strong>Input:</strong> Cleaned Reddit post/comment text (max 128 tokens)
                      <br />
                      <strong>Output:</strong> Sentiment label (Negative/Neutral/Positive) + confidence scores
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* MentalBERT Section */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <DataObjectIcon sx={{ fontSize: 48, color: 'success.main' }} />
                    <Box>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        MentalBERT
                      </Typography>
                      <Chip label="Diagnosis" color="success" size="small" />
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                    <strong>Purpose:</strong> Diagnosis and classification of mental health disorders from detected negative sentiment posts
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                    <strong>Task:</strong> Diagnoses and classifies negative sentiment posts into mental health disorder categories:
                  </Typography>
                  <Box sx={{ pl: 2, mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>• Depression</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>• Anxiety</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>• Stress</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>• PTSD</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>• Social Issues</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>• Self-harm</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>• Support Seeking</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>• Support Providing</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>• Professional Treatment</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>• Off-topic</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                    <strong>How It Works:</strong> For posts classified as "Negative" by RoBERTa, MentalBERT 
                    analyzes the content to identify specific mental health concerns. The model uses domain-specific 
                    knowledge from mental health datasets to classify topics accurately.
                  </Typography>
                  <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      <strong>Model:</strong> BERT-based model fine-tuned on mental health category datasets
                      <br />
                      <strong>Input:</strong> Negative sentiment post text (max 128 tokens)
                      <br />
                      <strong>Output:</strong> Mental health category label + confidence scores
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Workflow Section - Exact Flow from Image */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
            Complete Workflow
          </Typography>
          
          {/* Stage 1: DATA ACQUISITION */}
          <Card sx={{ mb: 4, backgroundColor: 'rgba(255, 69, 0, 0.05)', border: '1px solid rgba(255, 69, 0, 0.2)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    backgroundColor: 'primary.main',
                    borderRadius: '50%',
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h5" fontWeight={700}>
                    1
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  DATA ACQUISITION
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                    <PsychologyIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Subreddit Search
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Search and identify relevant mental health subreddits. Default subreddits: depression, anxiety, mentalhealth
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                    <FilterAltIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Scrape User Comments
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Collect user comments and posts from identified subreddits with configurable parameters
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                    <StorageIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Export Scraped Data to CSV
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Save collected data to CSV format for further processing and analysis
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Stage 2: DATA PREPARATION */}
          <Card sx={{ mb: 4, backgroundColor: 'rgba(255, 69, 0, 0.05)', border: '1px solid rgba(255, 69, 0, 0.2)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    backgroundColor: 'primary.main',
                    borderRadius: '50%',
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h5" fontWeight={700}>
                    2
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  DATA PREPARATION
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                    <StorageIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Load CSV Data
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Import and load the exported CSV files containing scraped Reddit data into the system
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                    <FilterAltIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Clean and Format Data
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Remove noise, irrelevant information, URLs, special characters. Normalize text for consistency
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                    <ScienceIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Extract Linguistic Features
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Identify and extract relevant linguistic characteristics: keywords, sentiment-bearing words, 
                        parts of speech, and semantic features
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Stage 3: MODEL FINE-TUNING & CLASSIFICATION */}
          <Card sx={{ mb: 4, backgroundColor: 'rgba(255, 69, 0, 0.05)', border: '1px solid rgba(255, 69, 0, 0.2)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    backgroundColor: 'primary.main',
                    borderRadius: '50%',
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h5" fontWeight={700}>
                    3
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  MODEL FINE-TUNING & CLASSIFICATION
                </Typography>
              </Box>
              
              {/* Model Fine-Tuning Subsection */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                  Model Fine-Tuning
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                        <AutoAwesomeIcon sx={{ color: 'error.main' }} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          RoBERTa for Detection
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Fine-tuned RoBERTa model for detecting sentiment patterns in mental health discussions
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                        <DataObjectIcon sx={{ color: 'success.main' }} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          MentalBERT for Diagnosis
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Fine-tuned MentalBERT model for diagnosing mental health disorders from detected negative posts
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* Classification Subsection */}
              <Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                  Classification
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                      <AssessmentIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Assign Sentiment Labels
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Process comments through RoBERTa to assign sentiment labels: Negative, Neutral, or Positive
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                      <AssessmentIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Assign Disorder Labels
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Process negative sentiment posts through MentalBERT to assign disorder labels 
                          (Depression, Anxiety, Stress, PTSD, etc.)
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          {/* Stage 4: PROGRESSION ANALYSIS */}
          <Card sx={{ mb: 4, backgroundColor: 'rgba(255, 69, 0, 0.05)', border: '1px solid rgba(255, 69, 0, 0.2)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    backgroundColor: 'primary.main',
                    borderRadius: '50%',
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h5" fontWeight={700}>
                    4
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  PROGRESSION ANALYSIS
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                    <StorageIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Group User Comments
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Organize comments by user, topic, or time period for trajectory analysis
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                    <TimelineIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Create User Threads
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Link related comments to form conversational threads or sequences for analysis
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                    <ShowChartIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Analyse Sentiment Trajectory
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Examine how sentiment associated with users or topics evolves over time
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                    <ScienceIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Analyse Disorder Trajectory
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Analyze how indicators of mental health disorders change or progress over time
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                    <BarChartIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Plot Progression Over Time
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Visualize trajectories and progression metrics over a timeline with accurate date ranges
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                    <TrendingUpIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Identify Intervention Points
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pinpoint specific moments or patterns in progression where intervention or support 
                        might be most effective
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Stage 5: REPORTING AND VISUALISATION */}
          <Card sx={{ mb: 4, backgroundColor: 'rgba(255, 69, 0, 0.05)', border: '1px solid rgba(255, 69, 0, 0.2)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    backgroundColor: 'primary.main',
                    borderRadius: '50%',
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h5" fontWeight={700}>
                    5
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  REPORTING AND VISUALISATION
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                    <BarChartIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Sentiment Distribution
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Visualize overall sentiment distribution across analyzed data with donut charts and bar charts
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                    <TimelineIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Progression Timelines
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Display progression of various metrics over time with accurate date range filtering
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                    <AnalyticsIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Display Keywords and Topic Trends
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Present key terms and emerging topics identified in the data analysis
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                    <SpeedIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Evaluation Metrics
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Display model performance metrics: F1-score, Recall, Accuracy (available when model evaluation data is present)
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                    <AssessmentIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Downloadable Reports
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Generate comprehensive PDF reports containing all analysis results, visualizations, 
                        and insights for documentation and sharing
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
            Key Features
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <SettingsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Flexible Configuration
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Configure extraction parameters: choose subreddits (default: depression, anxiety, mentalhealth), 
                      set threads per subreddit, minimum comments, extraction modes (full_threads, user_comments, or existing files)
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Real-Time Processing
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Live log output showing detailed progress at each step, pause/resume controls for step-by-step 
                      processing, and stop functionality for immediate termination
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <ShowChartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Comprehensive Analytics
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      7 chart types: Sentiment Distribution (donut), Category Distribution (bar), Temporal Trends (line), 
                      Area Chart, Category Heatmap (stacked bar), Post Volume (bar), User Activity (bar), and User Trajectories (line)
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      User Trajectory Analysis
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Track individual user sentiment changes over time, visualize progression patterns, 
                      and identify improvement or decline trends
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <StorageIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Historical Analysis Storage
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All analyses are automatically saved with timestamps. View and compare different analyses 
                      from the Analytics page, with all charts and data preserved
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Professional Reports
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Generate comprehensive PDF reports with all statistics, visualizations, and insights. 
                      Download reports for documentation and sharing
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Technical Details */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
            Technical Specifications
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 69, 0, 0.05)', border: '1px solid rgba(255, 69, 0, 0.2)' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Model Architecture
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • RoBERTa-base: 125M parameters
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • MentalBERT: BERT-based architecture
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Fine-tuned on mental health datasets
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • GPU acceleration support
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 69, 0, 0.05)', border: '1px solid rgba(255, 69, 0, 0.2)' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Processing Capabilities
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Batch processing support (configurable batch size)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Text preprocessing: URL removal, contraction handling, special character removal
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Max token length: 128 tokens per post/comment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Real-time progress tracking with detailed logs
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 69, 0, 0.05)', border: '1px solid rgba(255, 69, 0, 0.2)' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Analytics Output
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • 7 chart types: Sentiment, Category, Temporal, Area, Heatmap, Volume, Activity, Trajectories
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Analytics: sentiment ratios, post volume, user activity, temporal trends
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  • Statistics: total posts, total users, positive/negative/neutral counts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Export to PDF reports with timestamps
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
            Ready to Analyze Mental Health Data?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Start by configuring your extraction parameters and processing pipeline. Our AI models will 
            analyze the data and provide comprehensive insights automatically.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={() => navigate('/configuration')}
            sx={{ px: 6, py: 2, fontSize: '1.2rem' }}
          >
            Start Analysis Now
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

export default Landing
