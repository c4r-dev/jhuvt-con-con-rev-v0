'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material'

const chartData = [
  { name: 'Set aside', value: 6 },
  { name: 'Compromise 1', value: 15 },
  { name: 'Compromise\n2', value: 8 },
  { name: 'Other', value: 3 },
]

// Loading component for suspense
function LoadingContent() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
      }}
    >
      <CircularProgress />
    </Box>
  )
}

function StrategyScreen() {
  const searchParams = useSearchParams()
  const [selectedTab, setSelectedTab] = useState(0)
  const [sessionData, setSessionData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState([
    { name: 'Set aside', value: 0 },
    { name: 'Pilot study', value: 0 },
    { name: 'Estimate\nRegions', value: 0 },
    { name: 'Other', value: 0 },
  ])
  const [tableRows, setTableRows] = useState([])

  // Tab options mapping - maps tab index to actual option values in the data
  const tabOptions = [
    'Set this experiment aside.',
    'Compromise option 1.', // PILOT STUDY tab
    'Compromise option 2.', // COMPUTATIONAL ESTIMATE tab
    'Other.',
  ]

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue)
  }

  // Helper function to extract all limit explanation fields from a student
  const extractLimitExplanations = (student) => {
    const limitExplanations = []
    
    // Add the main limitExplanation if it exists
    if (student.limitExplanation && student.limitExplanation.trim()) {
      limitExplanations.push(student.limitExplanation)
    }
    
    // Add numbered limit explanations from limitExplanations object
    if (student.limitExplanations && typeof student.limitExplanations === 'object') {
      // Sort the keys to maintain order (limitExplanation1, limitExplanation2, etc.)
      const sortedKeys = Object.keys(student.limitExplanations)
        .filter(key => key.startsWith('limitExplanation'))
        .sort((a, b) => {
          const numA = parseInt(a.replace('limitExplanation', '')) || 0
          const numB = parseInt(b.replace('limitExplanation', '')) || 0
          return numA - numB
        })
      
      sortedKeys.forEach(key => {
        const value = student.limitExplanations[key]
        if (value && value.toString().trim()) {
          limitExplanations.push(value.toString())
        }
      })
    }
    
    return limitExplanations
  }

  // Fetch session data on component mount
  useEffect(() => {
    const sessionId = searchParams.get('sessionID')
    console.log('Session ID from URL:', sessionId)
    if (sessionId) {
      fetchSessionData(sessionId)
    } else {
      console.error('No sessionID found in URL parameters')
      setLoading(false)
    }
  }, [searchParams])

  // Update chart data when session data changes
  useEffect(() => {
    updateChartData()
  }, [sessionData])

  // Filter data when selectedTab changes
  useEffect(() => {
    filterDataByTab()
  }, [selectedTab, sessionData])

  const fetchSessionData = async (sessionId) => {
    try {
      setLoading(true)
      console.log('Fetching data for session:', sessionId)

      const response = await fetch(`/api/controls?sessionId=${sessionId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch session data: ${response.status}`)
      }

      const apiResponse = await response.json()
      console.log('Raw API Response:', apiResponse)

      // Extract students array from the nested response structure
      let studentsArray = []
      if (
        apiResponse.data &&
        apiResponse.data.students &&
        Array.isArray(apiResponse.data.students)
      ) {
        studentsArray = apiResponse.data.students
      } else if (Array.isArray(apiResponse.students)) {
        studentsArray = apiResponse.students
      } else if (Array.isArray(apiResponse)) {
        studentsArray = apiResponse
      } else if (apiResponse.data && Array.isArray(apiResponse.data)) {
        studentsArray = apiResponse.data
      }

      console.log('Extracted students array:', studentsArray)
      setSessionData(studentsArray)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching session data:', error)
      setLoading(false)
    }
  }

  const updateChartData = () => {
    if (!sessionData.length) {
      setChartData([
        { name: 'Set aside', value: 0 },
        { name: 'Pilot study', value: 0 },
        { name: 'Estimate\nRegions', value: 0 },
        { name: 'Other', value: 0 },
      ])
      return
    }

    // Count occurrences of each option
    const counts = {
      'Set this experiment aside.': 0,
      'Compromise option 1.': 0,
      'Compromise option 2.': 0,
      'Other.': 0,
    }

    sessionData.forEach((student) => {
      if (counts.hasOwnProperty(student.option)) {
        counts[student.option]++
      }
    })

    console.log('Option counts:', counts)

    // Update chart data with actual counts
    setChartData([
      { name: 'Set aside', value: counts['Set this experiment aside.'] },
      { name: 'Pilot study', value: counts['Compromise option 1.'] },
      { name: 'Estimate\nRegions', value: counts['Compromise option 2.'] },
      { name: 'Other', value: counts['Other.'] },
    ])
  }

  const filterDataByTab = () => {
    if (!sessionData.length) {
      console.log('No session data available for filtering')
      setTableRows([])
      return
    }

    const selectedOption = tabOptions[selectedTab]
    console.log('Filtering by option:', selectedOption)

    // Filter data based on selected tab option
    const filtered = sessionData.filter((student) => {
      return student.option === selectedOption
    })

    console.log('Filtered data:', filtered)
    setFilteredData(filtered)

    // Create table rows with expanded limit explanations
    const rows = []
    
    filtered.forEach((student) => {
      const limitExplanations = extractLimitExplanations(student)
      
      if (limitExplanations.length === 0) {
        // If no limit explanations, create a single row
        rows.push({
          explanation: student.response || '',
          limitExplanation: '',
          customOption: student.customOption || '',
          studentId: student.studentId
        })
      } else {
        // Create a row for each limit explanation
        limitExplanations.forEach((limitExp) => {
          rows.push({
            explanation: student.response || '',
            limitExplanation: limitExp,
            customOption: student.customOption || '',
            studentId: student.studentId
          })
        })
      }
    })

    setTableRows(rows)
    console.log('Generated table rows:', rows)
  }

  // Debug: Show current state
  console.log('Current state:', {
    selectedTab,
    sessionDataLength: sessionData.length,
    filteredDataLength: filteredData.length,
    tableRowsLength: tableRows.length
  })

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Loading indicator */}
      {loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Loading session data...
        </Alert>
      )}

      {/* Error message if no data */}
      {!loading && sessionData.length === 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No data found for this session. Please check the sessionID in the URL.
        </Alert>
      )}

      {/* Constraint Alert */}
      <Alert
        severity="warning"
        sx={{
          mb: 3,
          backgroundColor: '#FFE4B5',
          color: '#8B4513',
          '& .MuiAlert-icon': {
            color: '#FF6B35',
          },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Limitation
        </Typography>
        <Typography variant="body2">
          Sample Size: Depth electrodes require a much more invasive procedure,
          which will limit your ability to recruit subjects for the experiment.{' '}
        </Typography>
      </Alert>

      {/* Chart Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: '#f5f5f5' }}>
        <Box
          sx={{
            height: 300,
            mb: 2,
            position: 'relative',
            border: '1px solid #ddd',
            ml: 4,
          }}
        >
          {/* Y-axis labels */}
          <Box
            sx={{
              position: 'absolute',
              left: '-50px',
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
              pt: 1,
            }}
          >
            <span>10</span>
            <span>8</span>
            <span>6</span>
            <span>4</span>
            <span>2</span>
            <span>0</span>
          </Box>

          {/* Y-axis label - moved further left */}
          <Box
            sx={{
              position: 'absolute',
              left: '-80px',
              top: '50%',
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              fontSize: '10px',
              color: '#666',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              letterSpacing: '1px',
            }}
          >
            NUMBER OF SUBMISSIONS
          </Box>

          {/* Chart area with grid lines */}
          <Box
            sx={{
              position: 'absolute',
              left: '10px',
              top: '10px',
              right: '10px',
              bottom: '50px',
              borderLeft: '1px solid #ddd',
              borderBottom: '1px solid #ddd',
              background: `
          linear-gradient(to top, 
            transparent 0%, 
            transparent calc(16.67% - 1px), 
            #ddd calc(16.67% - 1px), 
            #ddd calc(16.67% + 1px), 
            transparent calc(16.67% + 1px),
            transparent calc(33.33% - 1px), 
            #ddd calc(33.33% - 1px), 
            #ddd calc(33.33% + 1px), 
            transparent calc(33.33% + 1px),
            transparent calc(50% - 1px), 
            #ddd calc(50% - 1px), 
            #ddd calc(50% + 1px), 
            transparent calc(50% + 1px),
            transparent calc(66.67% - 1px), 
            #ddd calc(66.67% - 1px), 
            #ddd calc(66.67% + 1px), 
            transparent calc(66.67% + 1px),
            transparent calc(83.33% - 1px), 
            #ddd calc(83.33% - 1px), 
            #ddd calc(83.33% + 1px), 
            transparent calc(83.33% + 1px)
          )
        `,
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
                p: '0 20px',
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
                    justifyContent: 'flex-end',
                  }}
                >
                  {/* Bar */}
                  <Box
                    sx={{
                      width: '40px',
                      height: `${(item.value / 10) * 100}%`,
                      backgroundColor: '#4CAF50',
                      borderRadius: '4px 4px 0 0',
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
              left: '10px',
              right: '10px',
              bottom: '10px',
              height: '40px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              px: '20px',
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
                  alignSelf: 'center',
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
            mt: 1,
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
          centered
          sx={{
            '& .MuiTab-root': {
              backgroundColor: '#ccc',
              color: '#666',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              minHeight: 48,
              '&.Mui-selected': {
                color: 'white',
                backgroundColor: '#333',
              },
            },
            '& .MuiTabs-indicator': {
              display: 'none',
            },
          }}
        >
          <Tab label="SET ASIDE" />
          <Tab label="PILOT STUDY" />
          <Tab label="COMPUTATIONAL ESTIMATE" />
          <Tab label="OTHER" />
        </Tabs>
      </Paper>

      {/* Table Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: '#e8e8e8' }}>
        <TableContainer component={Paper} sx={{ backgroundColor: '#f5f5f5' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#d0d0d0' }}>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    color: '#666',
                    fontSize: '0.875rem',
                  }}
                >
                  EXPLANATION
                </TableCell>
                {/* Show LIMIT column when not on SET ASIDE tab (tab index 0) */}
                {selectedTab !== 0 && (
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: '#666',
                      fontSize: '0.875rem',
                    }}
                  >
                    LIMIT
                  </TableCell>
                )}
                {/* Show CUSTOM OPTION column only on OTHER tab (tab index 3) */}
                {selectedTab === 3 && (
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: '#666',
                      fontSize: '0.875rem',
                    }}
                  >
                    CUSTOM OPTION
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRows.length === 0 ? (
                // Show "no information" when no data
                <TableRow
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell
                    colSpan={selectedTab === 0 ? 1 : selectedTab === 3 ? 3 : 2}
                    sx={{
                      backgroundColor: '#f0f0f0',
                      padding: 2,
                      textAlign: 'center',
                      height: '100px',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: '#666', fontStyle: 'italic' }}
                    >
                      No information
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                // Show data when available - now using dynamic tableRows
                tableRows.map((row, index) => (
                  <TableRow
                    key={`${row.studentId}-${index}`}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell
                      sx={{
                        backgroundColor: '#f0f0f0',
                        padding: 2,
                        verticalAlign: 'top',
                        maxWidth: selectedTab === 0 ? '600px' : selectedTab === 3 ? '250px' : '300px',
                        wordWrap: 'break-word',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: 'pre-wrap' }}
                      >
                        {row.explanation}
                      </Typography>
                    </TableCell>
                    {/* Show LIMIT column when not on SET ASIDE tab (tab index 0) */}
                    {selectedTab !== 0 && (
                      <TableCell
                        sx={{
                          backgroundColor: '#f0f0f0',
                          padding: 2,
                          verticalAlign: 'top',
                          maxWidth: selectedTab === 3 ? '250px' : '300px',
                          wordWrap: 'break-word',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: 'pre-wrap' }}
                        >
                          {row.limitExplanation}
                        </Typography>
                      </TableCell>
                    )}
                    {/* Show CUSTOM OPTION column only on OTHER tab (tab index 3) */}
                    {selectedTab === 3 && (
                      <TableCell
                        sx={{
                          backgroundColor: '#f0f0f0',
                          padding: 2,
                          verticalAlign: 'top',
                          maxWidth: '250px',
                          wordWrap: 'break-word',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: 'pre-wrap' }}
                        >
                          {row.customOption}
                        </Typography>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingContent />}>
      <StrategyScreen />
    </Suspense>
  )
}