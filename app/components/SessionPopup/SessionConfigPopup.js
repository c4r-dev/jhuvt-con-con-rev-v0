"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  Typography
} from '@mui/material';

const SessionConfigPopup = ({ 
  open, 
  onClose,
  sessionID: initialSessionID
}) => {
  const [mode, setMode] = useState(null);
  const [sessionID, setSessionID] = useState(initialSessionID || generateSessionID());
  const [isOpen, setIsOpen] = useState(open);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  function generateSessionID() {
    return Math.random().toString(36).substring(2, 15);
  }

  // Check for sessionID in URL on mount
  useEffect(() => {
    const urlSessionID = searchParams.get('sessionID');
    if (!urlSessionID) {
      onClose?.();
    }
  }, [searchParams]);

  const handleClose = (event, reason) => {
    // Prevent closing when clicking outside
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      return;
    }
    
    setIsOpen(false);
    setMode(null);
    onClose?.();
  };

  const handleModeSelect = (selectedMode) => {
    if (selectedMode === 'individual') {
      // Route to individual mode with hardcoded sessionID
      router.push(`/ResearchSelection?sessionID=individual1`);
      handleClose();
    } else {
      // Generate new sessionID for group mode
      setSessionID(generateSessionID());
      setMode('group');
    }
  };

  const handleBack = () => {
    setMode(null);
  };

  const handleStart = () => {
    router.push(`/ResearchSelection?sessionID=${sessionID}`);
    handleClose();
  };

  const handleCopyLink = async () => {
    try {
      const sharingURL = `${window.location.origin}/ResearchSelection?sessionID=${sessionID}`;
      await navigator.clipboard.writeText(sharingURL);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Don't render anything if not open
  if (!isOpen) return null;

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
    >
      {mode === null ? (
        <>
          <DialogTitle sx={{ textAlign: 'center' }}>
            How are you completing this activity?
          </DialogTitle>
          <DialogContent>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2,
              alignItems: 'center',
              mt: 6,
              mb: 6
            }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => handleModeSelect('individual')}
                style={{ 
                  backgroundColor: '#6200EE',
                  color: 'white',
                  width: '200px'
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: '#5000C8',
                  }
                }}
              >
                As an Individual
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => handleModeSelect('group')}
                style={{ 
                  backgroundColor: '#6200EE',
                  color: 'white',
                  width: '200px'
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: '#5000C8',
                  }
                }}
              >
                As a Group
              </Button>
            </Box>
          </DialogContent>
        </>
      ) : (
        <>
          <DialogTitle>Configure Group Activity</DialogTitle>
          <DialogContent>
            <Button 
              variant="text" 
              onClick={handleBack}
              sx={{ mb: 2 }}
            >
              ← Back
            </Button>
            
            <Box sx={{ p: 2 }}>
              <Typography gutterBottom>
                Share this link with your group to collaborate:
              </Typography>
              <Typography variant="body1" sx={{ 
                p: 2, 
                mb: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                wordBreak: 'break-all'
              }}>
                {`${window.location.origin}/ResearchSelection?sessionID=${sessionID}`}
              </Typography>
              <Button 
                variant="contained"
                onClick={handleCopyLink}
                fullWidth
                style={{ 
                  backgroundColor: '#6200EE',
                  color: 'white'
                }}
                sx={{ 
                  mb: 4,
                  '&:hover': {
                    backgroundColor: '#5000C8',
                  }
                }}
              >
                Copy Link
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleStart}
                style={{ 
                  backgroundColor: '#6200EE',
                  color: 'white'
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: '#5000C8',
                  }
                }}
              >
                Start Activity
              </Button>
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

export default SessionConfigPopup;