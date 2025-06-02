'use client'

import React, {
  useState,
  useEffect,
  Suspense,
  useCallback,
  useRef,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box,
  Typography,
  Paper,
  Button,
  Container,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'

// Helper function to format seconds into MM:SS
const formatTime = (totalSeconds) => {
  if (totalSeconds < 0) totalSeconds = 0
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}

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

function AddressControlConstraint() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const countdownIntervalRef = useRef(null)
  const inputRef = useRef(null)
  const pollIntervalRef = useRef(null)

  // State for session and student IDs
  const [sessionId, setSessionId] = useState(null)
  const [studentId, setStudentId] = useState(null)

  // State to control visibility of the Controls box, Proposed Control box, Limitation box, and Multiple Choice
  const [showControls, setShowControls] = useState(false)
  const [showProposedControl, setShowProposedControl] = useState(false)
  const [showLimitation, setShowLimitation] = useState(false)
  const [showMultipleChoice, setShowMultipleChoice] = useState(false)
  const [showExplanationInput, setShowExplanationInput] = useState(false)

  // State for multiple choice selection and other option dialog
  const [selectedOption, setSelectedOption] = useState('')
  const [showOtherDialog, setShowOtherDialog] = useState(false)
  const [otherOptionText, setOtherOptionText] = useState('')
  const [explanationText, setExplanationText] = useState('')
  const [explanationSubmitted, setExplanationSubmitted] = useState(false)
  const [finalSubmitted, setFinalSubmitted] = useState(false)

  const [timerInfo, setTimerInfo] = useState({
    isActive: false,
    startTime: null,
    durationSeconds: 90,
  })
  const [displayTime, setDisplayTime] = useState('--:--')
  const [timeExpired, setTimeExpired] = useState(false)
  const [isTimerConfirmedStarted, setIsTimerConfirmedStarted] = useState(false)

  // --- Timer Polling and Calculation ---
  // Function to fetch timer status
  const fetchTimerStatus = useCallback(async () => {
    if (!sessionId) return
    try {
      const response = await fetch(
        `/api/getSessionTimerStatus?sessionID=${sessionId}`,
      )
      if (!response.ok) {
        if (response.status !== 404) {
          console.error(`HTTP error! status: ${response.status}`) // Log non-404 errors
        }
        // Ensure timer is reset if status fetch fails or returns 404
        setTimerInfo({ isActive: false, startTime: null, durationSeconds: 90 })
        setIsTimerConfirmedStarted(false) // Reset confirmation on error/not found
      } else {
        const data = await response.json()
        setTimerInfo(data)
        // If we get a start time from the server, confirm the timer has started
        if (data.startTime) {
          setIsTimerConfirmedStarted(true) // <-- Set confirmation
        }
      }
    } catch (error) {
      console.error('Error fetching timer status:', error)
      // Don't set errorMessage here to avoid spamming user for background errors
    }
  }, [sessionId])

  // Function to stop polling interval
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      console.log('[Polling] Stopping polling...')
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }, [])

  // Function to start/restart polling interval
  const startPolling = useCallback(() => {
    // Prevent starting if no sessionID or polling already active
    if (!sessionId || pollIntervalRef.current) return

    console.log('[Polling] Starting polling...')
    fetchTimerStatus() // Fetch immediately

    const pollFrequency = isTimerConfirmedStarted ? 30000 : 5000
    pollIntervalRef.current = setInterval(fetchTimerStatus, pollFrequency)
  }, [sessionId, fetchTimerStatus, isTimerConfirmedStarted])

  // Effect for managing polling interval lifecycle based on dependencies
  useEffect(() => {
    // Start polling only if sessionID exists
    if (sessionId) {
      // Clear any previous interval before starting a new one with potentially updated frequency
      stopPolling()
      startPolling()
    }

    // Cleanup function to stop polling on unmount or when sessionID/isTimerConfirmed changes
    return stopPolling
  }, [sessionId, isTimerConfirmedStarted, startPolling, stopPolling])

  // Effect for Page Visibility API Integration
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!sessionId) return // Exit if no sessionID is set yet

      if (document.hidden) {
        console.log('[Visibility] Tab hidden, pausing polling.')
        stopPolling()
      } else {
        console.log('[Visibility] Tab visible, resuming polling.')
        // Restart polling. startPolling checks if it's already running.
        startPolling()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    console.log('[Visibility] Listener added.')

    // Cleanup listener on component unmount
    return () => {
      console.log('[Visibility] Removing listener.')
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      // Ensure polling stops if component unmounts while tab is hidden
      stopPolling()
    }
    // Only depends on sessionID (to ensure it exists) and the stable polling functions
  }, [sessionId, startPolling, stopPolling])

  // Effect for calculating and displaying countdown
  useEffect(() => {
    // Clear previous countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }

    if (timerInfo.startTime) {
      const calculateAndDisplay = () => {
        const startTimeMs = new Date(timerInfo.startTime).getTime()
        const durationMs = (timerInfo.durationSeconds || 90) * 1000
        const elapsedMs = Date.now() - startTimeMs
        const remainingSeconds = (durationMs - elapsedMs) / 1000

        if (remainingSeconds > 0) {
          setDisplayTime(formatTime(remainingSeconds))
          setTimeExpired(false)
        } else {
          setDisplayTime(formatTime(0)) // Show 00:00 when expired
          setTimeExpired(true)
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current) // Stop interval once expired
          }
        }
      }

      calculateAndDisplay() // Run immediately
      countdownIntervalRef.current = setInterval(calculateAndDisplay, 1000) // Update every second
    } else {
      // Timer hasn't started
      setDisplayTime('--:--')
      setTimeExpired(false)
    }

    // Cleanup interval on component unmount or timerInfo change
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [timerInfo])

  // --- End Timer Logic ---

  // Extract sessionId from URL on component mount
  // Extract sessionId from URL on component mount
  useEffect(() => {
    const sessionIdFromUrl = searchParams.get('sessionID')
    let studentIdFromUrl = searchParams.get('studentId')
    const selectedOptionFromUrl = searchParams.get('selectedOption')
    const customOptionFromUrl = searchParams.get('otherOptionText')
    const explanationFromUrl = searchParams.get('explanation')

    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl)
    }

    // Generate unique student ID if not present in URL
    if (!studentIdFromUrl) {
      studentIdFromUrl = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Add the generated student ID to the URL
      const queryParams = new URLSearchParams(window.location.search)
      queryParams.set('studentId', studentIdFromUrl)
      
      // Update the URL without navigating
      const newUrl = `${window.location.pathname}?${queryParams.toString()}`
      window.history.replaceState({}, '', newUrl)
    }

    setStudentId(studentIdFromUrl)

    // Initialize selected option from URL if present
    if (selectedOptionFromUrl) {
      setSelectedOption(selectedOptionFromUrl)
    }

    // Initialize customOption from URL if present
    if (customOptionFromUrl) {
      setOtherOptionText(customOptionFromUrl)
      setSelectedOption('Other.') // Auto-select "Other" option if customOption exists
    }

    // Initialize explanation from URL if present
    if (explanationFromUrl) {
      setExplanationText(explanationFromUrl)
    }

    console.log('Session ID from URL:', sessionIdFromUrl)
    console.log('Student ID from URL (generated or existing):', studentIdFromUrl)
    console.log('Selected Option from URL:', selectedOptionFromUrl)
    console.log('Custom Option from URL:', customOptionFromUrl)
    console.log('Explanation from URL:', explanationFromUrl)
  }, [searchParams])

  const handleSeeControlsClick = () => {
    // Show the controls box instead of navigating
    setShowControls(true)
  }

  const handleTheresAProblemClick = () => {
    // Show the proposed control box instead of limitation box
    setShowProposedControl(true)
  }

  const handleAddressTheConstraintClick = () => {
    // Show the limitation box instead of navigating immediately
    setShowLimitation(true)
  }

  const handleOptionSelect = (option) => {
    setSelectedOption(option)
  }

  const handleCheckboxChange = (option, checked) => {
    if (checked) {
      // First, always select the option
      setSelectedOption(option)

      // Add selected option to URL immediately
      const queryParams = new URLSearchParams(window.location.search)
      queryParams.set('selectedOption', option)
      
      // Update the URL without navigating
      const newUrl = `${window.location.pathname}?${queryParams.toString()}`
      window.history.replaceState({}, '', newUrl)

      // Then, if it's "Other", show the dialog
      if (option === 'Other.') {
        setShowOtherDialog(true)
      }
    } else {
      setSelectedOption('')
      
      // Remove selected option from URL when unchecked
      const queryParams = new URLSearchParams(window.location.search)
      queryParams.delete('selectedOption')
      
      // Update the URL without navigating
      const newUrl = `${window.location.pathname}?${queryParams.toString()}`
      window.history.replaceState({}, '', newUrl)
      
      if (option === 'Other.') {
        setOtherOptionText('')
        // Also remove custom option from URL
        queryParams.delete('otherOptionText')
        const updatedUrl = `${window.location.pathname}?${queryParams.toString()}`
        window.history.replaceState({}, '', updatedUrl)
      }
    }
  }

  const handleOtherDialogClose = () => {
    setShowOtherDialog(false)
    // Keep the "Other" option selected even if dialog is closed without text
    // The checkbox will remain checked
  }

  //   const handleOtherDialogSave = () => {
  //     if (otherOptionText.trim()) {
  //       setSelectedOption('Other.')
  //       setShowOtherDialog(false)
  //     }
  //   }

  const handleOtherDialogSave = () => {
    if (otherOptionText.trim()) {
      setSelectedOption('Other.')
      setShowOtherDialog(false)

      // Add customOption and explanation to URL params immediately when saved
      const queryParams = new URLSearchParams(window.location.search)
      queryParams.set('otherOptionText', otherOptionText.trim())

      // Also add explanation if it exists
      if (explanationText.trim()) {
        queryParams.set('explanation', explanationText.trim())
      }

      // Update the URL without navigating
      const newUrl = `${window.location.pathname}?${queryParams.toString()}`
      window.history.replaceState({}, '', newUrl)

      console.log('Custom option added to URL:', otherOptionText.trim())
      console.log('Current explanation in URL:', explanationText.trim())
    }
  }

  const handleOtherTextChange = (event) => {
    setOtherOptionText(event.target.value)
  }

  const handleExplanationTextChange = (event) => {
    setExplanationText(event.target.value)
  }

  const handleSubmit = () => {
    // Show the explanation input box
    setShowExplanationInput(true)
  }

  const handleExplanationSubmit = () => {
    // Just save the explanation text to URL without triggering timer
    if (explanationText.trim()) {
      const queryParams = new URLSearchParams(window.location.search)
      queryParams.set('explanation', explanationText.trim())
      
      // Update the URL without navigating
      const newUrl = `${window.location.pathname}?${queryParams.toString()}`
      window.history.replaceState({}, '', newUrl)
      
      console.log('Explanation saved to URL:', explanationText.trim())
      setExplanationSubmitted(true)
    }
  }

  //   const saveUrlDataToAPI = async () => {
  //     try {
  //       // Extract all the data from URL and component state
  //       const urlParams = new URLSearchParams(window.location.search)

  //       // Helper function to clean URL parameter values
  //       const cleanUrlParam = (value) => {
  //         if (!value) return value
  //         return value.replace(/%/g, '')
  //       }

  //       // Prepare the data payload
  //       const payload = {
  //         sessionId: sessionId || urlParams.get('sessionID'),
  //         studentId: studentId || urlParams.get('studentId'),
  //         option: selectedOption || cleanUrlParam(urlParams.get('selectedOption')),
  //         customOption: otherOptionText || cleanUrlParam(urlParams.get('otherOptionText')),
  //         response: explanationText || cleanUrlParam(urlParams.get('explanation')),
  //         withinTimer: true // You can modify this based on your timer logic
  //       }

  //       // Make the POST request to your API
  //       const response = await fetch('/api/controls', { // Replace with your actual API endpoint
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify(payload)
  //       })

  //       if (!response.ok) {
  //         const errorData = await response.json()
  //         throw new Error(errorData.message || 'Failed to save data')
  //       }

  //       const result = await response.json()
  //       console.log('Data saved successfully:', result)
  //       return result

  //     } catch (error) {
  //       console.error('Error saving data:', error)
  //       // You might want to show an error message to the user
  //       alert('Failed to save data. Please try again.')
  //       throw error
  //     }
  //   }

  // Updated saveUrlDataToAPI to accept a studentId parameter
 // Updated saveUrlDataToAPI to accept a studentId parameter and map options
  const saveUrlDataToAPI = async (overrideStudentId = null) => {
    try {
      // Extract all the data from URL and component state
      const urlParams = new URLSearchParams(window.location.search)

      // Helper function to clean URL parameter values
      const cleanUrlParam = (value) => {
        if (!value) return value
        return value.replace(/%/g, '')
      }

      // Function to map displayed option text to API option names
      const mapOptionForAPI = (displayedOption) => {
        switch (displayedOption) {
          case 'Run a depth electrode pilot study in a single clinical participant.':
            return 'Compromise option 1.'
          case 'Use computational methods to estimate which cortical regions generated each scalp signal, then measure mutual information between those reconstructed regions.':
            return 'Compromise option 2.'
          case 'Set this experiment aside.':
            return 'Set this experiment aside.'
          case 'Other.':
            return 'Other.'
          default:
            return displayedOption // Return as-is if no mapping found
        }
      }

      // Debug: Log what we're getting from URL and state
      console.log('Current URL:', window.location.href)
      console.log('URL Params:', Object.fromEntries(urlParams.entries()))
      console.log('State values:', {
        sessionId,
        studentId,
        selectedOption,
        otherOptionText,
        explanationText,
      })

      // Use override studentId if provided, otherwise use the existing logic
      const finalStudentId =
        overrideStudentId ||
        studentId ||
        cleanUrlParam(urlParams.get('studentId')) ||
        `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Get the current option and map it for the API
      const currentOption = selectedOption || cleanUrlParam(urlParams.get('selectedOption'))
      const mappedOption = mapOptionForAPI(currentOption)

      console.log('Original option:', currentOption)
      console.log('Mapped option for API:', mappedOption)

      // Prepare the data payload
      const payload = {
        sessionId: sessionId || cleanUrlParam(urlParams.get('sessionID')),
        studentId: finalStudentId,
        option: mappedOption, // Use mapped option instead of original
        customOption:
          otherOptionText || cleanUrlParam(urlParams.get('otherOptionText')),
        response:
          explanationText || cleanUrlParam(urlParams.get('explanation')),
        withinTimer: true, // You can modify this based on your timer logic
      }

      console.log('Payload being sent:', payload)

      // Validate that we have required fields
      if (!payload.sessionId || !payload.studentId) {
        throw new Error(
          `Missing required fields: sessionId=${payload.sessionId}, studentId=${payload.studentId}`,
        )
      }

      // Make the POST request to your API
      const response = await fetch('/api/controls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save data')
      }

      const result = await response.json()
      console.log('Data saved successfully:', result)

      const response1 = await fetch('/api/saveRandomizationIdeas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ideas: ['zscdsvdsfdfsdfsd'], // Replace with actual ideas array
          sessionID: sessionId,
        }),
      })
      const result1 = await response1.json()
      if (!response1.ok) {
        throw new Error(
          result1.message || 'Failed to submit randomization ideas',
        )
      }
      if (result1.timerStarted) {
        setIsTimerConfirmedStarted(true)
        fetchTimerStatus()
      }

      return result
    } catch (error) {
      console.error('Error saving data:', error)
      setIsTimerConfirmedStarted(false)
      // You might want to show an error message to the user
      alert('Failed to save data. Please try again.')
      throw error
    }
  }

  //   const handleFinalSubmit = async () => {
  //     // Navigate to review controls with the session and student IDs and selected option
  //     const queryParams = new URLSearchParams()
  //     if (sessionId) queryParams.append('sessionID', sessionId)

  //     // Generate a unique student ID if one doesn't exist, otherwise use existing one
  //     const finalStudentId = studentId || `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  //     queryParams.append('studentId', finalStudentId)
  //     if (selectedOption) {
  //       queryParams.append('selectedOption', selectedOption)
  //       // If "Other" was selected, also include the custom text
  //       if (selectedOption === 'Other.' && otherOptionText.trim()) {
  //         queryParams.append('otherOptionText', otherOptionText.trim())
  //       }
  //     }
  //     if (explanationText.trim()) {
  //       queryParams.append('explanation', explanationText.trim())
  //     }

  //     console.log('Navigating with URL params:', queryParams.toString())
  //     router.push(`/ResearchSelection?${queryParams.toString()}`)

  //     try {
  //         // Save the current state to the database
  //         await saveUrlDataToAPI()

  //         // Start your timer logic here
  //         console.log('Timer started and data saved!')

  //         // You might want to navigate or update UI after successful save
  //         // router.push('/next-page')

  //       } catch (error) {
  //         // Handle error - maybe don't start timer if save failed
  //         console.error('Failed to save data before starting timer')
  //       }

  //   }

  // Updated handleFinalSubmit
  const handleFinalSubmit = async () => {
    if (finalSubmitted) return // Prevent multiple submissions
    
    setFinalSubmitted(true) // Disable button immediately
    
    try {
      // Get the current URL params to extract studentId if it exists
      const urlParams = new URLSearchParams(window.location.search)
      const cleanUrlParam = (value) => {
        if (!value) return value
        return value.replace(/%/g, '')
      }

      // Determine the final studentId ONCE
      const finalStudentId =
        studentId ||
        cleanUrlParam(urlParams.get('studentId')) ||
        `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      console.log(
        'Using studentId for both API and navigation:',
        finalStudentId,
      )

      // FIRST: Save the current state to the database BEFORE navigation
      // Pass the finalStudentId to ensure consistency
      await saveUrlDataToAPI(finalStudentId)
      console.log('Data saved successfully!')
    } catch (error) {
      // Handle error - don't navigate if save failed
      console.error('Failed to save data before navigation:', error)
      // Optionally show user feedback
      alert('Failed to save data. Please try again.')
      setFinalSubmitted(false) // Re-enable button on error
    }
  }

  const handleNavigateToNext = () => {
    // Get the current URL params to extract studentId if it exists
    const urlParams = new URLSearchParams(window.location.search)
    const cleanUrlParam = (value) => {
      if (!value) return value
      return value.replace(/%/g, '')
    }

    // Determine the final studentId ONCE
    const finalStudentId =
      studentId ||
      cleanUrlParam(urlParams.get('studentId')) ||
      `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Navigate to the next page using the SAME studentId
    const queryParams = new URLSearchParams()
    if (sessionId) queryParams.append('sessionID', sessionId)

    queryParams.append('studentId', finalStudentId)
    if (selectedOption) {
      queryParams.append('option', selectedOption)
      // If "Other" was selected, also include the custom text
      if (selectedOption === 'Other.' && otherOptionText.trim()) {
        queryParams.append('customOption', otherOptionText.trim())
      }
    }
    if (explanationText.trim()) {
      queryParams.append('explanation', explanationText.trim())
    }

    console.log('Navigating with URL params:', queryParams.toString())
    router.push(`/ResearchMethodology?${queryParams.toString()}`)
  }

  return (
    <Box sx={{ flexGrow: 1, mt: 2 }}>
      {/* Research Question Box */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: '#e0e0e0',
          mb: 2,
          borderRadius: 1,
        }}
      >
        <Typography
          variant="h5"
          component="h3"
          sx={{
            fontWeight: 'bold',
            fontSize: '1.3rem',
            marginBottom: '10px',
            color: '#000000',
          }}
        >
          Research question: Does Neuroserpin induce axonal elongation?
        </Typography>
      </Paper>

      {/* Experiment Box */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: '#e0e0e0',
          mb: 3,
          borderRadius: 1,
        }}
      >
        <Typography
          variant="h5"
          component="h4"
          sx={{
            fontWeight: 'bold',
            fontSize: '1.3rem',
            marginBottom: '15px',
            color: '#000000',
          }}
        >
          Experiment
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: '1rem',
            lineHeight: 1.6,
            color: '#000000',
          }}
        >
         In order to study the neural dynamics of perceptual integration, subjects listen to a sequence of tones experienced either as a single audio stream or as two parallel audio streams. Neurophysiological indices of information integration are calculated from scalp EEG recordings, identifying a functional network spanning two brain regions which is claimed to be responsible for perceptual integration and differentiation.
        </Typography>
      </Paper>

      {/* Controls Box - Only visible when showControls is true */}
      {showControls && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: 'rgba(255, 90, 0, 0.2)',
            mb: 3,
            borderRadius: 1,
            border: '2px solid #2196f3',
          }}
        >
          <Typography
            variant="h5"
            component="h4"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.3rem',
              marginBottom: '15px',
              color: '#000000',
            }}
          >
            Concern
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: '1rem',
              lineHeight: 1.6,
              color: '#000000',
            }}
          >
           Unverified regional specificity: There is no confirmation that the observed information transfer is specific the monitored brain regions, so any claim describing neural dynamics would be predicated on the assumption that the findings aren&apos;t confounded by other regions or connections.
          </Typography>
        </Paper>
      )}

      {/* Proposed Control Box - Only visible when showProposedControl is true */}
      {showProposedControl && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: '#d4f6d4',
            mb: 3,
            borderRadius: 1,
            border: '1px solid #4caf50',
          }}
        >
          <Typography
            variant="h5"
            component="h4"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.3rem',
              marginBottom: '15px',
              color: '#4caf50',
            }}
          >
            Proposed control
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: '1rem',
              lineHeight: 1.6,
              color: '#000000',
            }}
          >
            Use depth electrodes: Include readings from depth electrodes which provide high spatial resolution and signal fidelity, enabling measurement of potential effects in other major cortical hubs.
          </Typography>
        </Paper>
      )}

      {/* Limitation Box - Only visible when showLimitation is true */}
      {showLimitation && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: '#ffe8d6',
            mb: 3,
            borderRadius: 1,
          }}
        >
          <Typography
            variant="h5"
            component="h4"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.3rem',
              marginBottom: '15px',
              color: '#ff7043',
            }}
          >
            Limitation
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: '1rem',
              lineHeight: 1.6,
              color: '#000000',
            }}
          >
           Sample Size: Depth electrodes require a much more invasive procedure, which will limit your ability to recruit subjects for the experiment.
          </Typography>
        </Paper>
      )}

      {/* Multiple Choice Section - Only visible when showMultipleChoice is true */}
      {showMultipleChoice && (
        <Box sx={{ mt: 3 }}>
          {/* Multiple Choice Options */}
          <Box sx={{ mb: 3 }}>
            {[
              'Set this experiment aside.',
              'Run a depth electrode pilot study in a single clinical participant.',
              'Use computational methods to estimate which cortical regions generated each scalp signal, then measure mutual information between those reconstructed regions.',
              'Other.',
            ].map((option, index) => (
              <Paper
                key={option}
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor:
                    selectedOption === option ? '#d4edda' : '#e0e0e0',
                  mb: 1,
                  borderRadius: 1,
                  border:
                    selectedOption === option ? '2px solid #28a745' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  '&:hover': {
                    backgroundColor:
                      selectedOption === option ? '#d4edda' : '#d5d5d5',
                  },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedOption === option}
                      onChange={(e) =>
                        handleCheckboxChange(option, e.target.checked)
                      }
                      sx={{
                        color: '#666666',
                        '&.Mui-checked': {
                          color: '#28a745',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: '1rem',
                        color: '#000000',
                        fontWeight:
                          selectedOption === option ? 'bold' : 'normal',
                      }}
                    >
                      {option}
                    </Typography>
                  }
                  sx={{
                    margin: 0,
                    width: '100%',
                  }}
                />
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      <div className="header-container">
        {/* Timer Display - Show when timer is active */}
        {timerInfo.startTime && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: '#e0e0e0',
              mb: 3,
              borderRadius: 1,
              textAlign: 'center',
              border: timeExpired ? '2px solid #ff4444' : 'none',
              boxShadow: timeExpired
                ? '0 0 10px rgba(255, 68, 68, 0.3)'
                : 'none',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.2rem',
                color: timeExpired ? '#ff4444' : '#000000',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              TIME REMAINING: {displayTime}
            </Typography>
          </Paper>
        )}
      </div>

      {/* Explanation Input Box - Only visible when showExplanationInput is true */}
      {showExplanationInput && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: '#e0e0e0',
            mb: 3,
            borderRadius: 1,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontSize: '1rem',
              color: '#999999',
              marginBottom: '15px',
            }}
          >
            Explain why you picked this option...
          </Typography>
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              value={explanationText}
              onChange={handleExplanationTextChange}
              placeholder=""
              disabled={explanationSubmitted}
              sx={{
                backgroundColor: explanationSubmitted ? '#f5f5f5' : 'white',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#bdbdbd',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2196f3',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#f5f5f5',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              disabled={!explanationText.trim() || explanationSubmitted}
              onClick={handleExplanationSubmit}
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                bgcolor: explanationText.trim() && !explanationSubmitted ? '#000000' : '#cccccc',
                color: explanationText.trim() && !explanationSubmitted ? 'white' : '#666666',
                minWidth: 'auto',
                px: 2,
                py: 0.5,
                fontSize: '0.875rem',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: explanationText.trim() && !explanationSubmitted ? '#333333' : '#cccccc',
                },
                '&:disabled': {
                  bgcolor: '#cccccc',
                  color: '#666666',
                },
              }}
            >
              {explanationSubmitted ? 'SUBMITTED' : 'SUBMIT'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Other Option Dialog */}
      <Dialog
        open={showOtherDialog}
        onClose={handleOtherDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
          Specify Other Option
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, color: '#666666' }}>
            Please describe your alternative approach to address the constraint:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={otherOptionText}
            onChange={handleOtherTextChange}
            placeholder="Enter your alternative approach here..."
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#bdbdbd',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2196f3',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleOtherDialogClose}
            sx={{
              color: '#666666',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleOtherDialogSave}
            variant="contained"
            disabled={!otherOptionText.trim()}
            sx={{
              bgcolor: otherOptionText.trim() ? '#000000' : '#cccccc',
              color: otherOptionText.trim() ? 'white' : '#666666',
              '&:hover': {
                bgcolor: otherOptionText.trim() ? '#333333' : '#cccccc',
              },
              '&:disabled': {
                bgcolor: '#cccccc',
                color: '#666666',
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* See Controls Button - Only show if controls are not visible */}
      {!showControls && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSeeControlsClick}
            sx={{
              bgcolor: '#000000',
              color: 'white',
              px: 3,
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '1rem',
              '&:hover': {
                bgcolor: '#333333',
              },
              borderRadius: 1,
              textTransform: 'uppercase',
            }}
          >
            THERE&apos;S A PROBLEM!
          </Button>
        </Box>
      )}

      {/* Address the Concern Button - Only show when controls are visible but proposed control is not */}
      {showControls && !showProposedControl && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleTheresAProblemClick}
            sx={{
              bgcolor: '#000000',
              color: 'white',
              px: 3,
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '1rem',
              '&:hover': {
                bgcolor: '#333333',
              },
              borderRadius: 1,
              textTransform: 'uppercase',
            }}
          >
           ADDRESS THE CONCERN
          </Button>
        </Box>
      )}

      {/* There's a Problem Button - Only show when proposed control is visible but limitation is not */}
      {showProposedControl && !showLimitation && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleAddressTheConstraintClick}
            sx={{
              bgcolor: '#000000',
              color: 'white',
              px: 3,
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '1rem',
              '&:hover': {
                bgcolor: '#333333',
              },
              borderRadius: 1,
              textTransform: 'uppercase',
            }}
          >
           THERE&apos;S A PROBLEM!
          </Button>
        </Box>
      )}

      {/* Address the Constraint Button - Only show when limitation is visible but multiple choice is not */}
      {showLimitation && !showMultipleChoice && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => setShowMultipleChoice(true)}
            sx={{
              bgcolor: '#000000',
              color: 'white',
              px: 3,
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '1rem',
              '&:hover': {
                bgcolor: '#333333',
              },
              borderRadius: 1,
              textTransform: 'uppercase',
            }}
          >
           WHAT SHOULD BE DONE?
          </Button>
        </Box>
      )}

      {/* Submit Button - Show when multiple choice is visible and explanation input is not shown */}
      {showMultipleChoice && !showExplanationInput && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!selectedOption}
            sx={{
              bgcolor: selectedOption ? '#000000' : '#cccccc',
              color: selectedOption ? 'white' : '#666666',
              px: 3,
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '1rem',
              '&:hover': {
                bgcolor: selectedOption ? '#333333' : '#cccccc',
              },
              '&:disabled': {
                bgcolor: '#cccccc',
                color: '#666666',
                cursor: 'not-allowed',
              },
              borderRadius: 1,
              textTransform: 'uppercase',
            }}
          >
            SUBMIT
          </Button>
        </Box>
      )}

      {/* Final Submit Button - Show when explanation input is visible */}
      {/* Final Submit Button - Show when explanation input is visible */}
      {showExplanationInput && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleFinalSubmit}
            disabled={!explanationText.trim() || finalSubmitted || timeExpired}
            sx={{
              bgcolor: explanationText.trim() && !finalSubmitted && !timeExpired ? '#000000' : '#cccccc',
              color: explanationText.trim() && !finalSubmitted && !timeExpired ? 'white' : '#666666',
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '1rem',
              '&:hover': {
                bgcolor: explanationText.trim() && !finalSubmitted && !timeExpired ? '#333333' : '#cccccc',
              },
              '&:disabled': {
                bgcolor: '#cccccc',
                color: '#666666',
                cursor: 'not-allowed',
              },
              borderRadius: 1,
              textTransform: 'uppercase',
            }}
          >
            {finalSubmitted ? 'SUBMITTED' : 'SUBMIT AND START GROUP COUNTDOWN'}
          </Button>
          
          <Button
            variant="contained"
            onClick={handleNavigateToNext}
            disabled={!finalSubmitted}
            sx={{
              bgcolor: finalSubmitted ? '#000000' : '#cccccc',
              color: finalSubmitted ? 'white' : '#666666',
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '1rem',
              '&:hover': {
                bgcolor: finalSubmitted ? '#333333' : '#cccccc',
              },
              '&:disabled': {
                bgcolor: '#cccccc',
                color: '#666666',
                cursor: 'not-allowed',
              },
              borderRadius: 1,
              textTransform: 'uppercase',
            }}
          >
            NAVIGATE TO NEXT SCREEN
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default function AddressControlConstraintScreen() {
  return (
    <Suspense fallback={<LoadingContent />}>
      <Container maxWidth="md" sx={{ pt: 4, pb: 4 }}>
        <AddressControlConstraint />
      </Container>
    </Suspense>
  )
}