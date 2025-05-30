'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#f5f5f5',
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: '#f5f5f5',
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
}));

const LimitationPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#ffebcc',
  border: '1px solid #ff9800',
}));

const CompromisePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#e8e3ff',
  border: '1px solid #9c27b0',
}));

const ExplanationPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#e8e3ff',
  minHeight: '120px',
}));

const AnswerFieldPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  minHeight: '120px',
}));

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
  const searchParams = useSearchParams();
  const [compromiseChecked, setCompromiseChecked] = useState(true);
  const [limitExplanation, setLimitExplanation] = useState('');
  const [experimentExpanded, setExperimentExpanded] = useState(false);
  const [controlsExpanded, setControlsExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedStudentOption, setSelectedStudentOption] = useState('');
  const [selectedStudentExplanation, setSelectedStudentExplanation] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [currentUserOption, setCurrentUserOption] = useState('');
  const [currentUserCustomOption, setCurrentUserCustomOption] = useState('');

  useEffect(() => {
    const sessionIdFromUrl = searchParams.get('sessionID');
    const studentIdFromUrl = searchParams.get('studentId');
    const optionFromUrl = searchParams.get('option');
    const customOptionFromUrl = searchParams.get('customOption');
    const explanationFromUrl = searchParams.get('explanation');
    
    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl);
    }
    
    if (studentIdFromUrl) {
      setCurrentStudentId(studentIdFromUrl);
    }
    
    // Set current user's option from URL
    if (optionFromUrl) {
      setCurrentUserOption(optionFromUrl);
    }
    
    if (customOptionFromUrl) {
      setCurrentUserCustomOption(customOptionFromUrl);
    }
    
    // Only fetch if we have both sessionId and studentId
    if (sessionIdFromUrl && studentIdFromUrl) {
      fetchStudentOptions(sessionIdFromUrl, studentIdFromUrl, optionFromUrl, customOptionFromUrl, explanationFromUrl);
    }
  }, [searchParams]);

  const fetchStudentOptions = async (sessionId, currentStudentId, currentUserOption, currentUserCustomOption, currentUserExplanation) => {
    try {
      const response = await fetch(`/api/controls?sessionId=${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch student options');
      }
      const apiResponse = await response.json();
      
      console.log('API Response:', apiResponse); // Debug log
      console.log('Current Student ID:', currentStudentId); // Debug log
      
      // Extract students array from the nested response structure
      let studentsArray = [];
      if (apiResponse.data && apiResponse.data.students && Array.isArray(apiResponse.data.students)) {
        studentsArray = apiResponse.data.students;
      } else if (Array.isArray(apiResponse.students)) {
        studentsArray = apiResponse.students;
      } else if (Array.isArray(apiResponse)) {
        studentsArray = apiResponse;
      }
      
      if (!Array.isArray(studentsArray) || studentsArray.length === 0) {
        console.warn('No students found in API response:', apiResponse);
        // If no students in API, use current user's option from URL
        if (currentUserOption && currentUserOption !== 'Set this experiment aside.') {
          const displayOption = currentUserOption === 'Other.' && currentUserCustomOption 
            ? currentUserCustomOption 
            : currentUserOption;
          setSelectedStudentOption(displayOption);
          setSelectedStudentExplanation(currentUserExplanation || 'Your explanation for this choice.');
        } else {
          setSelectedStudentOption('No other students found.');
          setSelectedStudentExplanation('No other student responses available.');
        }
        return;
      }
      
      console.log('All students:', studentsArray); // Debug log
      
      // Filter out:
      // 1. Students with "Set this experiment aside" option
      // 2. The current student (exclude by studentId)
      const validOptions = studentsArray.filter(student => {
        const isNotSetAside = student.option && student.option !== 'Set this experiment aside.';
        const isNotCurrentStudent = student.studentId !== currentStudentId;
        
        console.log(`Student ${student.studentId}: option="${student.option}", isNotSetAside=${isNotSetAside}, isNotCurrentStudent=${isNotCurrentStudent}`); // Debug log
        
        return isNotSetAside && isNotCurrentStudent;
      });
      
      console.log('Valid options after filtering:', validOptions); // Debug log
      
      // Randomly select one option from valid options
      if (validOptions.length > 0) {
        const randomIndex = Math.floor(Math.random() * validOptions.length);
        const selectedStudent = validOptions[randomIndex];
        
        console.log('Selected Student:', selectedStudent); // Debug log
        
        // Set the selected option (use customOption if it's "Other", otherwise use the main option)
        const displayOption = selectedStudent.option === 'Other.' && selectedStudent.customOption 
          ? selectedStudent.customOption 
          : selectedStudent.option;
          
        setSelectedStudentOption(displayOption);
        
        // Set the explanation if available
        if (selectedStudent.response) {
          setSelectedStudentExplanation(selectedStudent.response);
        } else {
          setSelectedStudentExplanation('No explanation provided by this student.');
        }
        
        console.log('Display Option:', displayOption); // Debug log
        console.log('Student Explanation:', selectedStudent.response); // Debug log
      } else {
        console.log('No valid options found for selection');
        // Check if there are any students at all besides the current one
        const otherStudents = studentsArray.filter(student => student.studentId !== currentStudentId);
        if (otherStudents.length === 0) {
          // User is the only one in session - display their own option
          if (currentUserOption && currentUserOption !== 'Set this experiment aside.') {
            const displayOption = currentUserOption === 'Other.' && currentUserCustomOption 
              ? currentUserCustomOption 
              : currentUserOption;
            setSelectedStudentOption(displayOption);
            setSelectedStudentExplanation(currentUserExplanation || 'Your explanation for this choice.');
          } else {
            setSelectedStudentOption('You are the only student in this session.');
            setSelectedStudentExplanation('No other students have submitted responses yet.');
          }
        } else {
          setSelectedStudentOption('Other students chose to set experiment aside.');
          setSelectedStudentExplanation('No viable options available from other students.');
        }
      }
    } catch (error) {
      console.error('Error fetching student options:', error);
      // Set fallback values on error - try to use current user's option as fallback
      if (currentUserOption && currentUserOption !== 'Set this experiment aside.') {
        const displayOption = currentUserOption === 'Other.' && currentUserCustomOption 
          ? currentUserCustomOption 
          : currentUserOption;
        setSelectedStudentOption(displayOption);
        setSelectedStudentExplanation(currentUserExplanation || 'Your explanation for this choice.');
      } else {
        setSelectedStudentOption('Error loading student data.');
        setSelectedStudentExplanation('Unable to fetch other student responses.');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitted(true); // Disable button immediately
      
      const response = await fetch('/api/controls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          studentId: currentStudentId,
          limitExplanation: limitExplanation.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit explanation');
      }

      const result = await response.json();
      console.log('Explanation submitted successfully:', result);
    } catch (error) {
      console.error('Error submitting explanation:', error);
      // Re-enable button on error
      setSubmitted(false);
      alert('Failed to submit explanation. Please try again.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
        Screen 2
      </Typography>
      
      <StyledPaper elevation={1}>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          Now, let&apos;s review someone else&apos;s choices. You receive the following information about how someone handled a difficult limitation. What is important for you to know about this choice? What implications would you expect the authors to report?
        </Typography>
      </StyledPaper>

      <StyledPaper elevation={1}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
          Research question: does neuroserpin induce axonal elongation?
        </Typography>
      </StyledPaper>

      <StyledAccordion 
        expanded={experimentExpanded} 
        onChange={(event, isExpanded) => setExperimentExpanded(isExpanded)}
        elevation={1}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            Experiment
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Methodology:</strong> Primary cortical neurons were cultured from E18 rat embryos and plated on poly-L-lysine coated coverslips at a density of 50,000 cells/cm².
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Treatment:</strong> Neurons were treated with recombinant neuroserpin (10 μg/ml) or vehicle control (PBS) at DIV 3 and allowed to grow for 72 hours.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Measurement:</strong> Axonal length was measured using immunofluorescence staining for Tau-1 (axonal marker) and analyzed using ImageJ software. At least 100 neurons per condition were analyzed.
          </Typography>
          <Typography variant="body2">
            <strong>Analysis:</strong> Statistical analysis performed using unpaired t-test with significance set at p &lt; 0.05.
          </Typography>
        </AccordionDetails>
      </StyledAccordion>

      <StyledAccordion 
        expanded={controlsExpanded} 
        onChange={(event, isExpanded) => setControlsExpanded(isExpanded)}
        elevation={1}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            Controls
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Negative Control:</strong> Neurons treated with PBS vehicle only to establish baseline axonal growth patterns.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Positive Control:</strong> Neurons treated with NGF (nerve growth factor, 50 ng/ml) as a known promoter of axonal elongation.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Protein Control:</strong> Heat-inactivated neuroserpin (boiled at 100°C for 10 minutes) to verify that biological activity, not just protein presence, is responsible for observed effects.
          </Typography>
          <Typography variant="body2">
            <strong>Concentration Control:</strong> Dose-response curve with neuroserpin concentrations ranging from 1-50 μg/ml to determine optimal effective concentration.
          </Typography>
        </AccordionDetails>
      </StyledAccordion>

      <LimitationPaper elevation={1}>
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{ fontWeight: 'bold', color: '#ff5722', mb: 1 }}
        >
          Limitation
        </Typography>
        <Typography variant="body2" sx={{ textDecoration: 'underline' }}>
          Oh no! There is a constraint they need to address that complicates the controls they want to use.
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
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {currentUserOption === 'Other.' 
                ? 'Other' 
                : currentUserOption || 'Loading...'}
            </Typography>
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
              mt: 4
            }}
          >
            This is the explanation a user provided for why they picked this choice.
          </Typography>
        )}
      </ExplanationPaper>

      <AnswerFieldPaper elevation={1}>
        <TextField
          multiline
          rows={4}
          fullWidth
          placeholder="Explain the limits of this choice..."
          variant="standard"
          value={limitExplanation}
          onChange={(e) => setLimitExplanation(e.target.value)}
          disabled={submitted}
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: '0.9rem',
              backgroundColor: submitted ? '#f5f5f5' : 'transparent',
              '& .MuiInputBase-input::placeholder': {
                color: '#888',
                opacity: 1,
              },
              '&.Mui-disabled': {
                backgroundColor: '#f5f5f5',
                color: '#666',
              },
            }
          }}
        />
      </AnswerFieldPaper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          disabled={submitted || !limitExplanation.trim()}
          onClick={handleSubmit}
          sx={{
            backgroundColor: !submitted && limitExplanation.trim() ? '#333' : '#ccc',
            color: !submitted && limitExplanation.trim() ? 'white' : '#666',
            px: 4,
            py: 1,
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: !submitted && limitExplanation.trim() ? '#555' : '#ccc',
            },
            '&:disabled': {
              backgroundColor: '#ccc',
              color: '#666',
            },
          }}
        >
          {submitted ? 'SUBMITTED' : 'SUBMIT'}
        </Button>
      </Box>
    </Container>
  );
}

export default function ResearchMethodologyPage() {
  return (
    <Suspense fallback={<LoadingContent />}>
      <ResearchMethodologyScreen />
    </Suspense>
  )
}