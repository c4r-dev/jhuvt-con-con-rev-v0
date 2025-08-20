// app/layout.js
'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppBar, Toolbar, Box, Container } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Header from './components/Header/Header'
import CustomModal from './components/CustomModal'

// Create theme here directly if you're having issues with the import
const theme = createTheme({
  palette: {
    primary: {
      main: '#6200ee',
    },
  },
})

export default function RootLayout({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const handleLogoClick = async () => {
    try {
      console.log('Resetting application state...')
      
      // Call API to clear session data and reset timer
      const [controlsResponse, timerResponse] = await Promise.all([
        fetch('/api/controls?confirm=true', { method: 'DELETE' }).catch(err => {
          console.warn('Failed to clear session data:', err)
          return { ok: false }
        }),
        fetch('/api/getSessionTimerStatus', { method: 'DELETE' }).catch(err => {
          console.warn('Failed to reset timer:', err)
          return { ok: false }
        })
      ])
      
      if (controlsResponse.ok) {
        console.log('Session data cleared successfully')
      }
      if (timerResponse.ok) {
        console.log('Timer reset successfully')
      }
      
      // Navigate to home page - this will trigger the SessionConfigPopup to show
      router.push('/')
      
    } catch (error) {
      console.error('Error resetting application:', error)
      // Still navigate to home even if API calls fail
      router.push('/')
    }
  }

  const handleHelpClick = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }


  return (
    <html lang="en">
      <head>
        <title>Control Review</title>
        <link rel="icon" href="/01_RR_Large.png" type="image/png" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <CustomModal isOpen={isModalOpen} closeModal={closeModal} />

          <AppBar
            position="fixed"
            color="default"
            elevation={1}
            sx={{
              backgroundColor: 'white',
              borderBottom: '1px solid #e0e0e0',
              zIndex: 1200,
            }}
          >
            <Toolbar sx={{ 
              height: { xs: 56, sm: 64 },
              px: { xs: 1, sm: 2 },
              minHeight: { xs: 56, sm: 64 }
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                width: '100%'
              }}>
                <Header
                  onLogoClick={handleLogoClick}
                  onHelpClick={handleHelpClick}
                  text="Control Review"
                /> 
              </Box>
            </Toolbar>
          </AppBar>

          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />

          <Container 
            component="main" 
            maxWidth={false}
            sx={{ 
              pt: 2, 
              pb: 4,
              px: { xs: 1, sm: 2, md: 3 },
              maxWidth: { xs: '100vw', sm: '100vw', md: '1200px' },
              mx: 'auto'
            }}
          >
            {children}
          </Container>
        </ThemeProvider>
      </body>
    </html>
  )
}
