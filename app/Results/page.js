'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Button,
  Tab,
  Tabs,
  TextField,
  Container,
  Paper
} from '@mui/material';
// No chart library imports needed

const chartData = [
  { name: 'Set aside', value: 6 },
  { name: 'Compromise 1', value: 15 },
  { name: 'Compromise\n2', value: 8 },
  { name: 'Other', value: 3 }
];

export default function StrategyScreen() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [explanations, setExplanations] = useState({
    explanation1: '',
    explanation2: '',
    explanation3: ''
  });
  const [limits, setLimits] = useState({
    limit1: '',
    limit2: '',
    limit3: ''
  });

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleExplanationChange = (field, value) => {
    setExplanations(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLimitChange = (field, value) => {
    setLimits(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
        Screen 3
      </Typography>

      {/* Constraint Alert */}
      <Alert 
        severity="warning" 
        sx={{ 
          mb: 3,
          backgroundColor: '#FFE4B5',
          color: '#8B4513',
          '& .MuiAlert-icon': {
            color: '#FF6B35'
          }
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          constraint
        </Typography>
        <Typography variant="body2">
          Oh no! There is a constraint they need to address that complicates the controls they want to use.
        </Typography>
      </Alert>

      {/* Activity Highlights Section */}
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2, 
          color: '#999',
          textTransform: 'lowercase',
          fontSize: '1.1rem'
        }}
      >
        activity-highlights
      </Typography>

      {/* Chart Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: '#f5f5f5' }}>
        <Box sx={{ height: 300, mb: 2, position: 'relative', border: '1px solid #ddd' }}>
          {/* Y-axis labels */}
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 40,
              width: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              pr: 1,
              fontSize: '12px',
              color: '#666',
              pt: 1
            }}
          >
            <span>20</span>
            <span>15</span>
            <span>10</span>
            <span>5</span>
            <span>0</span>
          </Box>
          
          {/* Y-axis label */}
          <Box
            sx={{
              position: 'absolute',
              left: '-15px',
              top: '50%',
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              fontSize: '10px',
              color: '#666',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              letterSpacing: '1px'
            }}
          >
            NUMBER OF SUBMISSIONS
          </Box>
          
          {/* Chart area with grid lines */}
          <Box
            sx={{
              position: 'absolute',
              left: '50px',
              top: '10px',
              right: '10px',
              bottom: '50px',
              borderLeft: '1px solid #ddd',
              borderBottom: '1px solid #ddd',
              background: `
                linear-gradient(to top, 
                  transparent 0%, 
                  transparent calc(20% - 1px), 
                  #ddd calc(20% - 1px), 
                  #ddd calc(20% + 1px), 
                  transparent calc(20% + 1px),
                  transparent calc(40% - 1px), 
                  #ddd calc(40% - 1px), 
                  #ddd calc(40% + 1px), 
                  transparent calc(40% + 1px),
                  transparent calc(60% - 1px), 
                  #ddd calc(60% - 1px), 
                  #ddd calc(60% + 1px), 
                  transparent calc(60% + 1px),
                  transparent calc(80% - 1px), 
                  #ddd calc(80% - 1px), 
                  #ddd calc(80% + 1px), 
                  transparent calc(80% + 1px)
                )
              `
            }}
          >
            {/* Bars */}
            <Box
              sx={{
                height: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                alignItems: 'end',
                gap: '10px',
                p: '0 20px'
              }}
            >
              {chartData.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end'
                  }}
                >
                  {/* Bar */}
                  <Box
                    sx={{
                      width: '40px',
                      height: `${(item.value / 20) * 100}%`,
                      backgroundColor: '#4CAF50',
                      borderRadius: '4px 4px 0 0'
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
          
          {/* X-axis labels */}
          <Box
            sx={{
              position: 'absolute',
              left: '50px',
              right: '10px',
              bottom: '10px',
              height: '40px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              px: '20px'
            }}
          >
            {chartData.map((item, index) => (
              <Typography
                key={index}
                variant="caption"
                sx={{
                  fontSize: '12px',
                  color: '#666',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  whiteSpace: 'pre-line',
                  alignSelf: 'center'
                }}
              >
                {item.name}
              </Typography>
            ))}
          </Box>
        </Box>
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            textAlign: 'center', 
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            mt: 1
          }}
        >
          STRATEGY
        </Typography>
      </Paper>

      {/* Tabs Section */}
      <Paper elevation={0} sx={{ mb: 3 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              backgroundColor: selectedTab === 0 ? '#333' : '#ccc',
              color: selectedTab === 0 ? 'white' : '#666',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              minHeight: 48,
              '&.Mui-selected': {
                color: 'white',
                backgroundColor: '#333'
              }
            },
            '& .MuiTabs-indicator': {
              display: 'none'
            }
          }}
        >
          <Tab label="SET ASIDE" />
          <Tab label="PILOT STUDY" />
          <Tab label="COMPUTATIONAL ESTIMATE" />
          <Tab label="OTHER" />
        </Tabs>
      </Paper>

      {/* Form Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: '#e8e8e8' }}>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 3, 
            color: '#666',
            textTransform: 'uppercase',
            fontSize: '0.75rem'
          }}
        >
          THIS IS A TABLE PLACEHOLDER. ALL ENTRIES FOR THIS SESSION ARE DISPLAYED.
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {/* Left Column - Explanations */}
          <Box>
            <TextField
              fullWidth
              variant="outlined"
              label="EXPLANATION 1"
              value={explanations.explanation1}
              onChange={(e) => handleExplanationChange('explanation1', e.target.value)}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-input': {
                  backgroundColor: '#d0d0d0'
                },
                '& .MuiInputLabel-root': {
                  color: '#666',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="EXPLANATION 2"
              value={explanations.explanation2}
              onChange={(e) => handleExplanationChange('explanation2', e.target.value)}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-input': {
                  backgroundColor: '#d0d0d0'
                },
                '& .MuiInputLabel-root': {
                  color: '#666',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="EXPLANATION 3"
              value={explanations.explanation3}
              onChange={(e) => handleExplanationChange('explanation3', e.target.value)}
              sx={{ 
                '& .MuiOutlinedInput-input': {
                  backgroundColor: '#d0d0d0'
                },
                '& .MuiInputLabel-root': {
                  color: '#666',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }
              }}
            />
          </Box>

          {/* Right Column - Limits */}
          <Box>
            <TextField
              fullWidth
              variant="outlined"
              label="LIMIT 1"
              value={limits.limit1}
              onChange={(e) => handleLimitChange('limit1', e.target.value)}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-input': {
                  backgroundColor: '#d0d0d0'
                },
                '& .MuiInputLabel-root': {
                  color: '#666',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="LIMIT 2"
              value={limits.limit2}
              onChange={(e) => handleLimitChange('limit2', e.target.value)}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-input': {
                  backgroundColor: '#d0d0d0'
                },
                '& .MuiInputLabel-root': {
                  color: '#666',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="LIMIT 3"
              value={limits.limit3}
              onChange={(e) => handleLimitChange('limit3', e.target.value)}
              sx={{ 
                '& .MuiOutlinedInput-input': {
                  backgroundColor: '#d0d0d0'
                },
                '& .MuiInputLabel-root': {
                  color: '#666',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#333',
            color: 'white',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            px: 4,
            py: 1.5,
            '&:hover': {
              backgroundColor: '#555'
            }
          }}
        >
          SUBMIT
        </Button>
      </Box>
    </Container>
  );
}