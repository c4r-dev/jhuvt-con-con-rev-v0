'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Container,
  CircularProgress
} from '@mui/material';
import SessionConfigPopup from './components/SessionPopup/SessionConfigPopup'


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
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for session and student IDs
  const [sessionId, setSessionId] = useState(null);
  const [showConfigPopup, setShowConfigPopup] = useState(true)
  const [studentId, setStudentId] = useState(null);

  // Extract sessionId from URL on component mount
  useEffect(() => {
    const sessionIdFromUrl = searchParams.get('sessionID');
    const studentIdFromUrl = searchParams.get('studentId');
    
    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl);
    }
    
    if (studentIdFromUrl) {
      setStudentId(studentIdFromUrl);
    }
    
    console.log('Session ID from URL:', sessionIdFromUrl);
    console.log('Student ID from URL:', studentIdFromUrl);
  }, [searchParams]);

  const handleConfigClose = () => {
    // Only allow closing if a sessionID exists
    if (sessionId) {
      setShowConfigPopup(false)
    }
  }

  const handleSeeControlsClick = () => {
    // Navigate to review controls with the session and student IDs
    const queryParams = new URLSearchParams();
    if (sessionId) queryParams.append('sessionID', sessionId);
    if (studentId) queryParams.append('studentId', studentId);
    
    router.push(`/review-controls?${queryParams.toString()}`);
  };

  return (
    <Box sx={{ flexGrow: 1, mt: 2 }}>
    

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
In order to study the neural dynamics of perceptual integration, subjects listen to a sequence of tones experienced either as a single audio stream or as two parallel audio streams. Neurophysiological indices of information integration are calculated from scalp EEG recordings, identifying a functional network spanning two brain regions which is claimed to be responsible for perceptual integration and differentiation.        </Typography>
      </Paper>

      {/* See Controls Button */}
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
        {showConfigPopup && (
        <SessionConfigPopup
          open={showConfigPopup}
          onClose={handleConfigClose}
          setSessionID={setSessionId}
        />
      )}
      </Box>
    </Box>
  );
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