'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  TextField,
  Button,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { styled } from '@mui/material/styles'

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  border: '1px solid black',
}))

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  border: '1px solid black',
  '&:before': {
    display: 'none',
  },
  '& .MuiAccordionSummary-root': {
    backgroundColor: '#f5f5f5',
    minHeight: 56,
  },
  '& .MuiAccordionDetails-root': {
    backgroundColor: 'white',
    paddingTop: theme.spacing(2),
  },
}))

const LimitationPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#ffebcc',
  border: '1px solid black',
}))

const CompromisePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#e8e3ff',
  border: '1px solid black',
}))

const ExplanationPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#e8e3ff',
  minHeight: '120px',
  border: '1px solid black',
}))

const AnswerFieldPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  minHeight: '120px',
  border: '2px solid black',
}))

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

function ResearchMethodologyScreen() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [compromiseChecked, setCompromiseChecked] = useState(true)
  const [limitExplanation, setLimitExplanation] = useState('')
  const [experimentExpanded, setExperimentExpanded] = useState(false)
  const [controlsExpanded, setControlsExpanded] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [selectedStudentOption, setSelectedStudentOption] = useState('')
  const [selectedStudentExplanation, setSelectedStudentExplanation] = useState('')
  const [selectedStudentCustomOption, setSelectedStudentCustomOption] = useState('') // NEW: Store custom option
  const [sessionId, setSessionId] = useState(null)
  const [currentStudentId, setCurrentStudentId] = useState(null)
  const [currentUserOption, setCurrentUserOption] = useState('')
  const [currentUserCustomOption, setCurrentUserCustomOption] = useState('')
  const [noValidOptions, setNoValidOptions] = useState(false)
  const [displayedOptionStudentId, setDisplayedOptionStudentId] = useState(null)

  useEffect(() => {
    const sessionIdFromUrl = searchParams.get('sessionID')
    const studentIdFromUrl = searchParams.get('studentId')
    const optionFromUrl = searchParams.get('option')
    const customOptionFromUrl = searchParams.get('customOption')
    const explanationFromUrl = searchParams.get('explanation')

    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl)
    }

    if (studentIdFromUrl) {
      setCurrentStudentId(studentIdFromUrl)
    }

    // Set current user's option from URL
    if (optionFromUrl) {
      setCurrentUserOption(optionFromUrl)
    }

    if (customOptionFromUrl) {
      setCurrentUserCustomOption(customOptionFromUrl)
    }

    // Only fetch if we have both sessionId and studentId
    if (sessionIdFromUrl && studentIdFromUrl) {
      fetchStudentOptions(
        sessionIdFromUrl,
        studentIdFromUrl,
        optionFromUrl,
        customOptionFromUrl,
        explanationFromUrl,
      )
    }
  }, [searchParams])

  // Auto-scroll to bottom when accordion sections expand
  useEffect(() => {
    if (experimentExpanded) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      }, 100)
    }
  }, [experimentExpanded])

  useEffect(() => {
    if (controlsExpanded) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      }, 100)
    }
  }, [controlsExpanded])

  // Auto-scroll when student data loads
  useEffect(() => {
    if (selectedStudentOption && selectedStudentOption !== 'Loading...') {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      }, 300) // Slightly longer delay for data loading
    }
  }, [selectedStudentOption])

  const fetchStudentOptions = async (
    sessionId,
    currentStudentId,
    currentUserOption,
    currentUserCustomOption,
    currentUserExplanation,
  ) => {
    try {
      const response = await fetch(`/api/controls?sessionId=${sessionId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch student options')
      }
      const apiResponse = await response.json()

      console.log('API Response:', apiResponse)
      console.log('Current Student ID:', currentStudentId)

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
      }

      if (!Array.isArray(studentsArray)) {
        studentsArray = []
      }

      console.log('All students:', studentsArray)

      // Find current user in the session to check their withinTimer status
      const currentUser = studentsArray.find(student => student.studentId === currentStudentId)
      const currentUserWithinTimer = currentUser ? currentUser.withinTimer !== false : true

      console.log('Current user data:', currentUser)
      console.log('Current user withinTimer:', currentUserWithinTimer)

      // Helper function to check if an option is valid
      const isValidOption = (student) => {
        const hasValidOption = student.option && student.option !== 'Set this experiment aside.'
        const withinTimer = student.withinTimer !== false
        return hasValidOption && withinTimer
      }

      // Filter out the current student to get other students
      const otherStudents = studentsArray.filter((student) => 
        student.studentId !== currentStudentId
      )

      console.log('Other students:', otherStudents)

      // Case 1: Current user is the only student in the session
      if (otherStudents.length === 0) {
        if (currentUserOption && currentUserOption !== 'Set this experiment aside.' && currentUserWithinTimer) {
          const displayOption = currentUserOption === 'Other.' ? 'Other' : currentUserOption
          setSelectedStudentOption(displayOption)
          setSelectedStudentExplanation(currentUserExplanation || 'Your explanation for this choice.')
          setSelectedStudentCustomOption(currentUserCustomOption || '') // Set custom option
          setDisplayedOptionStudentId(currentStudentId)
          setNoValidOptions(false)
          console.log('Case 1: Only student - showing own option:', displayOption)
        } else {
          setSelectedStudentOption('No valid options available.')
          setSelectedStudentExplanation('No valid options were selected within the time limit.')
          setSelectedStudentCustomOption('') // Clear custom option
          setDisplayedOptionStudentId(null)
          setNoValidOptions(true)
          console.log('Case 1: Only student chose to set experiment aside or outside time limit')
        }
        return
      }

      // Case 2: There are other students - first try to find valid options from others
      const validOtherStudents = otherStudents.filter(isValidOption)

      console.log('Valid other students:', validOtherStudents)

      if (validOtherStudents.length > 0) {
        // Randomly select one option from other students
        const randomIndex = Math.floor(Math.random() * validOtherStudents.length)
        const selectedStudent = validOtherStudents[randomIndex]

        console.log('Selected Student:', selectedStudent)

        const displayOption = selectedStudent.option === 'Other.' ? 'Other' : selectedStudent.option
        setSelectedStudentOption(displayOption)
        setSelectedStudentExplanation(selectedStudent.response || 'No explanation provided by this student.')
        setSelectedStudentCustomOption(selectedStudent.customOption || '') // Set custom option from selected student
        setDisplayedOptionStudentId(selectedStudent.studentId)
        setNoValidOptions(false)
        console.log('Case 2: Multiple students - showing random other option:', displayOption)
      } else {
        // Case 3: All other students chose "Set aside" or are outside time limit
        // Fall back to current user's option if it's valid
        if (currentUserOption && currentUserOption !== 'Set this experiment aside.' && currentUserWithinTimer) {
          const displayOption = currentUserOption === 'Other.' ? 'Other' : currentUserOption
          setSelectedStudentOption(displayOption)
          setSelectedStudentExplanation(currentUserExplanation || 'Your explanation for this choice.')
          setSelectedStudentCustomOption(currentUserCustomOption || '') // Set custom option
          setDisplayedOptionStudentId(currentStudentId)
          setNoValidOptions(false)
          console.log('Case 3: All others invalid - showing current user option:', displayOption)
        } else {
          // Final fallback: No valid options available
          setSelectedStudentOption('No valid options available.')
          setSelectedStudentExplanation('No valid options were selected within the time limit.')
          setSelectedStudentCustomOption('') // Clear custom option
          setDisplayedOptionStudentId(null)
          setNoValidOptions(true)
          console.log('Final fallback: No valid options from any students')
        }
      }

    } catch (error) {
      console.error('Error fetching student options:', error)
      // Set fallback values on error
      if (currentUserOption && currentUserOption !== 'Set this experiment aside.') {
        const displayOption = currentUserOption === 'Other.' ? 'Other' : currentUserOption
        setSelectedStudentOption(displayOption)
        setSelectedStudentExplanation(currentUserExplanation || 'Error loading explanation.')
        setSelectedStudentCustomOption(currentUserCustomOption || '') // Set custom option on error
        setDisplayedOptionStudentId(currentStudentId)
        setNoValidOptions(false)
      } else {
        setSelectedStudentOption('Error loading option')
        setSelectedStudentExplanation('Error loading explanation.')
        setSelectedStudentCustomOption('') // Clear custom option on error
        setDisplayedOptionStudentId(null)
        setNoValidOptions(true)
      }
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitted(true) // Disable button immediately

      const response = await fetch('/api/controls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          studentId: displayedOptionStudentId,
          limitExplanation: limitExplanation.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit explanation')
      }

      const result = await response.json()
      console.log('Explanation submitted successfully:', result)
      
      // Navigate to Results page with sessionId
      router.push(`/Results?sessionID=${sessionId}`)
    } catch (error) {
      console.error('Error submitting explanation:', error)
      // Re-enable button on error
      setSubmitted(false)
      alert('Failed to submit explanation. Please try again.')
    }
  }

  const handleNavigateToResults = () => {
    router.push(`/Results?sessionID=${sessionId}`)
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <StyledPaper elevation={1} sx={{ backgroundColor: '#e0e0e0' }}>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          Now, let&apos;s review someone else&apos;s choices. You receive the
          following information about how someone handled a difficult
          limitation. What is important for you to know about this choice? What
          implications would you expect the authors to report?
        </Typography>
      </StyledPaper>

      <StyledAccordion
        sx={{
          backgroundColor: '#e0e0e0 !important',
          '& .MuiAccordionSummary-root': {
            backgroundColor: '#e0e0e0 !important',
          },
        }}
        expanded={experimentExpanded}
        onChange={(event, isExpanded) => setExperimentExpanded(isExpanded)}
        elevation={1}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            Experiment: What brain regions integrate audio perception?
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: '#e0e0e0 !important' }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            In order to study the neural dynamics of perceptual integration,
            subjects listen to a sequence of tones experienced either as a
            single audio stream or as two parallel audio streams.
            Neurophysiological indices of information integration are calculated
            from scalp EEG recordings, identifying a functional network spanning
            two brain regions which is claimed to be responsible for perceptual
            integration and differentiation.
          </Typography>
        </AccordionDetails>
      </StyledAccordion>

      <StyledAccordion
        sx={{
          backgroundColor: '#e0e0e0 !important',
          '& .MuiAccordionSummary-root': {
            backgroundColor: '#e0e0e0 !important',
          },
        }}
        expanded={controlsExpanded}
        onChange={(event, isExpanded) => setControlsExpanded(isExpanded)}
        elevation={1}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ backgroundColor: '#e0e0e0' }}
        >
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            Controls
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: '#e0e0e0 !important' }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Include readings from depth electrodes which provide high spatial resolution and signal fidelity, enabling measurement of potential effects in other major cortical hubs.
          </Typography>
        </AccordionDetails>
      </StyledAccordion>

      <LimitationPaper elevation={1}>
        <Typography
          variant="h6"
          component="h2"
          sx={{ fontWeight: 'bold', color: '#ff5722', mb: 1 }}
        >
          Limitation: sample size
        </Typography>
        <Typography variant="body2" >
        Depth electrodes require a much more invasive procedure, which will limit your ability to recruit subjects for the experiment.
        </Typography>
      </LimitationPaper>

      <CompromisePaper elevation={1}>
        <FormControlLabel
          control={
            <Checkbox
              checked={compromiseChecked}
              onChange={(e) => setCompromiseChecked(e.target.checked)}
              sx={{
                color: '#9c27b0',
                '&.Mui-checked': {
                  color: '#9c27b0',
                },
              }}
            />
          }
          label={
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {selectedStudentOption || 'Loading...'}
              </Typography>
              {selectedStudentOption === 'Compromise option 1.' && (
                <Typography variant="body2" sx={{ mt: 1, color: '#666', fontStyle: 'italic' }}>
                  Run a depth electrode pilot study in a single clinical participant.
                </Typography>
              )}
              {selectedStudentOption === 'Compromise option 2.' && (
                <Typography variant="body2" sx={{ mt: 1, color: '#666', fontStyle: 'italic' }}>
                  Use computational methods to estimate which cortical regions generated each scalp signal, then measure mutual information between those reconstructed regions.
                </Typography>
              )}
              {/* NEW: Display custom option text when option is "Other" */}
              {selectedStudentOption === 'Other' && selectedStudentCustomOption && (
                <Typography variant="body2" sx={{ mt: 1, color: '#666', fontStyle: 'italic' }}>
                  {selectedStudentCustomOption}
                </Typography>
              )}
            </Box>
          }
        />
      </CompromisePaper>

      <ExplanationPaper elevation={1}>
        {selectedStudentExplanation ? (
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
            {selectedStudentExplanation}
          </Typography>
        ) : (
          <Typography
            variant="body2"
            sx={{
              fontStyle: 'italic',
              color: '#666',
              textAlign: 'center',
              mt: 4,
            }}
          >
            This is the explanation a user provided for why they picked this
            choice.
          </Typography>
        )}
      </ExplanationPaper>

      {/* Only show the text field if there are valid options */}
      {!noValidOptions && (
        <AnswerFieldPaper 
          elevation={1} 
          sx={{ 
            backgroundColor: '#e0e0e0'
          }}
        >
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="Explain the limits of this choice..."
            variant="outlined"
            value={limitExplanation}
            onChange={(e) => setLimitExplanation(e.target.value)}
            disabled={submitted}
            sx={{
              backgroundColor: submitted ? '#f5f5f5' : 'white',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'black',
                  borderWidth: '1px',
                },
                '&:hover fieldset': {
                  borderColor: 'black',
                  borderWidth: '1px',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'black',
                  borderWidth: '1px',
                },
                '&.Mui-disabled': {
                  backgroundColor: '#f5f5f5',
                  '& fieldset': {
                    borderColor: 'black',
                    borderWidth: '1px',
                  },
                },
              },
            }}
          />
        </AnswerFieldPaper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        {noValidOptions ? (
          <Button
            variant="contained"
            onClick={handleNavigateToResults}
            sx={{
              backgroundColor: '#333',
              color: 'white',
              px: 4,
              py: 1,
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#555',
              },
            }}
          >
            CONTINUE TO RESULTS
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={submitted || !limitExplanation.trim()}
            onClick={handleSubmit}
            sx={{
              backgroundColor:
                !submitted && limitExplanation.trim() ? '#333' : '#ccc',
              color: !submitted && limitExplanation.trim() ? 'white' : '#666',
              px: 4,
              py: 1,
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor:
                  !submitted && limitExplanation.trim() ? '#555' : '#ccc',
              },
              '&:disabled': {
                backgroundColor: '#ccc',
                color: '#666',
              },
            }}
          >
            {submitted ? 'SUBMITTED' : 'SUBMIT'}
          </Button>
        )}
      </Box>
    </Container>
  )
}

export default function ResearchMethodologyPage() {
  return (
    <Suspense fallback={<LoadingContent />}>
      <ResearchMethodologyScreen />
    </Suspense>
  )
}