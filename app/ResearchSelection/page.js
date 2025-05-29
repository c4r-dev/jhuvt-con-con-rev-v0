'use client'

import React, { useState, useEffect, Suspense } from 'react'
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

  // State for session and student IDs
  const [sessionId, setSessionId] = useState(null)
  const [studentId, setStudentId] = useState(null)

  // State to control visibility of the Controls box, Limitation box, and Multiple Choice
  const [showControls, setShowControls] = useState(false)
  const [showLimitation, setShowLimitation] = useState(false)
  const [showMultipleChoice, setShowMultipleChoice] = useState(false)
  const [showExplanationInput, setShowExplanationInput] = useState(false)

  // State for multiple choice selection and other option dialog
  const [selectedOption, setSelectedOption] = useState('')
  const [showOtherDialog, setShowOtherDialog] = useState(false)
  const [otherOptionText, setOtherOptionText] = useState('')
  const [explanationText, setExplanationText] = useState('')

  // Extract sessionId from URL on component mount
 // Extract sessionId from URL on component mount
useEffect(() => {
    const sessionIdFromUrl = searchParams.get('sessionID')
    const studentIdFromUrl = searchParams.get('studentId')
    const customOptionFromUrl = searchParams.get('otherOptionText')
    const explanationFromUrl = searchParams.get('explanation')
  
    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl)
    }
  
    if (studentIdFromUrl) {
      setStudentId(studentIdFromUrl)
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
    console.log('Student ID from URL:', studentIdFromUrl)
    console.log('Custom Option from URL:', customOptionFromUrl)
    console.log('Explanation from URL:', explanationFromUrl)
  }, [searchParams])

  const handleSeeControlsClick = () => {
    // Show the controls box instead of navigating
    setShowControls(true)
  }

  const handleTheresAProblemClick = () => {
    // Show the limitation box instead of navigating immediately
    setShowLimitation(true)
  }

  const handleAddressTheConstraintClick = () => {
    // Show the multiple choice options instead of navigating immediately
    setShowMultipleChoice(true)
  }

  const handleOptionSelect = (option) => {
    setSelectedOption(option)
  }

  const handleCheckboxChange = (option, checked) => {
    if (checked) {
      // First, always select the option
      setSelectedOption(option)

      // Then, if it's "Other", show the dialog
      if (option === 'Other.') {
        setShowOtherDialog(true)
      }
    } else {
      setSelectedOption('')
      if (option === 'Other.') {
        setOtherOptionText('')
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
const saveUrlDataToAPI = async (overrideStudentId = null) => {
    try {
      // Extract all the data from URL and component state
      const urlParams = new URLSearchParams(window.location.search)
      
      // Helper function to clean URL parameter values
      const cleanUrlParam = (value) => {
        if (!value) return value
        return value.replace(/%/g, '')
      }
  
      // Debug: Log what we're getting from URL and state
      console.log('Current URL:', window.location.href)
      console.log('URL Params:', Object.fromEntries(urlParams.entries()))
      console.log('State values:', {
        sessionId,
        studentId,
        selectedOption,
        otherOptionText,
        explanationText
      })
  
      // Use override studentId if provided, otherwise use the existing logic
      const finalStudentId = overrideStudentId || 
                            studentId || 
                            cleanUrlParam(urlParams.get('studentId')) || 
                            `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
      // Prepare the data payload
      const payload = {
        sessionId: sessionId || cleanUrlParam(urlParams.get('sessionID')),
        studentId: finalStudentId,
        option: selectedOption || cleanUrlParam(urlParams.get('selectedOption')),
        customOption: otherOptionText || cleanUrlParam(urlParams.get('otherOptionText')),
        response: explanationText || cleanUrlParam(urlParams.get('explanation')),
        withinTimer: true // You can modify this based on your timer logic
      }
  
      console.log('Payload being sent:', payload)
  
      // Validate that we have required fields
      if (!payload.sessionId || !payload.studentId) {
        throw new Error(`Missing required fields: sessionId=${payload.sessionId}, studentId=${payload.studentId}`)
      }
  
      // Make the POST request to your API
      const response = await fetch('/api/controls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save data')
      }
  
      const result = await response.json()
      console.log('Data saved successfully:', result)
    //   if (result.timerStarted) {
    //     setIsTimerConfirmedStarted(true);
    //     fetchTimerStatus();
    // }
      return result
  
    } catch (error) {
      console.error('Error saving data:', error)
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
    try {
      // Get the current URL params to extract studentId if it exists
      const urlParams = new URLSearchParams(window.location.search)
      const cleanUrlParam = (value) => {
        if (!value) return value
        return value.replace(/%/g, '')
      }
  
      // Determine the final studentId ONCE
      const finalStudentId = studentId || 
                            cleanUrlParam(urlParams.get('studentId')) || 
                            `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      console.log('Using studentId for both API and navigation:', finalStudentId)
  
      // FIRST: Save the current state to the database BEFORE navigation
      // Pass the finalStudentId to ensure consistency
      await saveUrlDataToAPI(finalStudentId)
      console.log('Data saved successfully!')
      
      // THEN: Navigate to the next page using the SAME studentId
      const queryParams = new URLSearchParams()
      if (sessionId) queryParams.append('sessionID', sessionId)
      
      queryParams.append('studentId', finalStudentId)
      if (selectedOption) {
        queryParams.append('selectedOption', selectedOption)
        // If "Other" was selected, also include the custom text
        if (selectedOption === 'Other.' && otherOptionText.trim()) {
          queryParams.append('otherOptionText', otherOptionText.trim())
        }
      }
      if (explanationText.trim()) {
        queryParams.append('explanation', explanationText.trim())
      }
    
      console.log('Navigating with URL params:', queryParams.toString())
      router.push(`/ResearchSelection?${queryParams.toString()}`)
      
    } catch (error) {
      // Handle error - don't navigate if save failed
      console.error('Failed to save data before navigation:', error)
      // Optionally show user feedback
      alert('Failed to save data. Please try again.')
    }
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
          Research question: does neuroserpin induce axonal elongation?
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
          Placeholder text that will relate relevant details of the experiment.
          Enough information is required for this to not feel like a total waste
          of time!
        </Typography>
      </Paper>

      {/* Controls Box - Only visible when showControls is true */}
      {showControls && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: '#e0e0e0',
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
            Controls
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: '1rem',
              lineHeight: 1.6,
              color: '#000000',
            }}
          >
            Placeholder text that will relate relevant details of the controls
            used in the experiment. This includes both the controls used and the
            rationale for those controls.
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
            Oh no! There is a constraint they need to address that complicates
            the controls they want to use.
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
              'Compromise option 1.',
              'Compromise option 2.',
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
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={explanationText}
            onChange={handleExplanationTextChange}
            placeholder=""
            sx={{
              backgroundColor: 'white',
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
            SEE CONTROLS
          </Button>
        </Box>
      )}

      {/* There's a Problem Button - Only show when controls are visible but limitation is not */}
      {showControls && !showLimitation && (
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
            THERE&apos;S A PROBLEM!
          </Button>
        </Box>
      )}

      {/* Address the Constraint Button - Only show when limitation is visible but multiple choice is not */}
      {showLimitation && !showMultipleChoice && (
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
            ADDRESS THE CONSTRAINT
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
      {showExplanationInput && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleFinalSubmit}
            sx={{
              bgcolor: '#000000',
              color: 'white',
              px: 4,
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
            SUBMIT AND START GROUP COUNTDOWN
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