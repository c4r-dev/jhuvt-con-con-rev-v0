import * as React from 'react'
import { useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95vw', sm: '80vw', md: '600px' },
  maxWidth: '600px',
  maxHeight: { xs: '90vh', sm: '80vh' },
  overflow: 'auto',
  bgcolor: '#6e00ff',
  border: 'none',
  borderRadius: '8px',
  boxShadow: 24,
  p: { xs: 2, sm: 3, md: 4 },
  color: 'white',
  outline: 0,
}

export default function CustomModal({ isOpen, closeModal, hypothesis }) {
  return (
    <div>
      {/* <Button onClick={handleOpen}>Open modal</Button> */}
      <Modal
        open={isOpen}
        onClose={closeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Button
            onClick={closeModal}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white', // Changed button text color to purple
              // backgroundColor: 'white', // Changed button background to white
              minWidth: 'auto',
              // width: 'fit-content',
              padding: '4px 12px',
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: 'lightgray', // Optional: change hover color for better visibility
                color: 'black',
              },
            }}
          >
            X
          </Button>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{ 
              mb: 2,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              fontWeight: 'bold'
            }}
          >
            Control Review
          </Typography>

          <Box
            component="ol"
            sx={{
              mb: 2,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              lineHeight: 1.5,
              pl: 3,
              m: 0,
              mb: 2
            }}
          >
            <Box component="li" sx={{ mb: 1.5 }}>
              Progress through how a research team proposes to address an issue with their experiment.
            </Box>
            <Box component="li" sx={{ mb: 1.5 }}>
              Once you see the control the team proposed to address the issue, you will consider the limitations of that control and select a way to improve it, providing your rationale.
            </Box>
            <Box component="li" sx={{ mb: 1.5 }}>
              Then, you will see how another user&apos;s selected choice and rationale. You will then explain the limits of that choice, including what you would expect the study would report if they implemented the chosen strategy.
            </Box>
            <Box component="li" sx={{ mb: 0 }}>
              Review how other users improved the controls in the study, and how they explained the limitations of each approach.
            </Box>
          </Box>
        </Box>
      </Modal>
    </div>
  )
}
