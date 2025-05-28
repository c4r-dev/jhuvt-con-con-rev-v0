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

  // State for multiple choice selection and other option dialog
  const [selectedOption, setSelectedOption] = useState('')
  const [showOtherDialog, setShowOtherDialog] = useState(false)
  const [otherOptionText, setOtherOptionText] = useState('')

  // Extract sessionId from URL on component mount
  useEffect(() => {
    const sessionIdFromUrl = searchParams.get('sessionID')
    const studentIdFromUrl = searchParams.get('studentId')

    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl)
    }

    if (studentIdFromUrl) {
      setStudentId(studentIdFromUrl)
    }

    console.log('Session ID from URL:', sessionIdFromUrl)
    console.log('Student ID from URL:', studentIdFromUrl)
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

  const handleOtherDialogSave = () => {
    if (otherOptionText.trim()) {
      setSelectedOption('Other.')
      setShowOtherDialog(false)
    }
  }

  const handleOtherTextChange = (event) => {
    setOtherOptionText(event.target.value)
  }

  const handleSubmit = () => {
    // Navigate to review controls with the session and student IDs and selected option
    const queryParams = new URLSearchParams()
    if (sessionId) queryParams.append('sessionID', sessionId)
    if (studentId) queryParams.append('studentId', studentId)
    if (selectedOption) {
      queryParams.append('selectedOption', selectedOption)
      // If "Other" was selected, also include the custom text
      if (selectedOption === 'Other.' && otherOptionText.trim()) {
        queryParams.append('otherOptionText', otherOptionText.trim())
      }
    }

    console.log('Navigating with URL params:', queryParams.toString())
    router.push(`/ResearchSelection?${queryParams.toString()}`)
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

          {/* Bottom Z Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}></Box>
        </Box>
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

      {/* Submit Button - Show when multiple choice is visible, enabled only when option is selected */}
      {showMultipleChoice && (
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
