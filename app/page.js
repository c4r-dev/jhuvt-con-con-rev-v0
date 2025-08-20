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
        Experiment: What brain regions integrate audio perception?
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
      <Box sx={{ 
        display: 'flex', 
        justifyContent: { xs: 'center', sm: 'flex-end' }, 
        mt: 2 
      }}>
        <Button
          variant="contained"
          onClick={handleSeeControlsClick}
          sx={{
            bgcolor: '#000000',
            color: 'white',
            px: { xs: 2, sm: 3 },
            py: 1.5,
            fontWeight: 'bold',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            '&:hover': {
              bgcolor: '#333333',
            },
            borderRadius: 1,
            textTransform: 'uppercase',
            minWidth: { xs: '200px', sm: 'auto' }
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
      <Box sx={{ 
        px: { xs: 1, sm: 2, md: 3 }, 
        py: { xs: 2, sm: 3, md: 4 },
        maxWidth: '1200px',
        mx: 'auto',
        width: '100%'
      }}>
        <AddressControlConstraint />
      </Box>
    </Suspense>
  )
}



// import React, { useState, useEffect } from 'react';

// // QR Code generator function
// const generateQRCode = (text, size = 200) => {
//   return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
// };

// const ModeSelectionPopup = ({ open, onClose, setSessionID, sessionId, studentId }) => {
//   const [selectedMode, setSelectedMode] = useState(null);
//   const [shareableLink, setShareableLink] = useState('');
//   const [showQRCode, setShowQRCode] = useState(false);

//   // Generate shareable link when group mode is selected
//   useEffect(() => {
//     if (selectedMode === 'group' && sessionId) {
//       const baseUrl = window.location.origin;
//       const params = new URLSearchParams();
//       params.append('sessionID', sessionId);
//       if (studentId) params.append('studentId', studentId);
//       params.append('selectedGroup', 'cyxbhcbti'); // Example group ID
      
//       const link = `${baseUrl}/RandomizeActivityVariables?${params.toString()}`;
//       setShareableLink(link);
//       setShowQRCode(true);
//     }
//   }, [selectedMode, sessionId, studentId]);

//   const handleModeSelect = (mode) => {
//     setSelectedMode(mode);
    
//     if (mode === 'solo') {
//       onClose();
//     }
//   };

//   const handleCopyLink = async () => {
//     try {
//       await navigator.clipboard.writeText(shareableLink);
//       console.log('Link copied to clipboard');
//     } catch (err) {
//       console.error('Failed to copy link:', err);
//     }
//   };

//   const handleContinue = () => {
//     onClose();
//   };

//   const handleCancel = () => {
//     setSelectedMode(null);
//     setShowQRCode(false);
//     setShareableLink('');
//   };

//   if (!open) return null;

//   const overlayStyle = {
//     position: 'fixed',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1000
//   };

//   const dialogStyle = {
//     backgroundColor: '#f5f5f5',
//     borderRadius: '8px',
//     padding: '32px',
//     maxWidth: '800px',
//     width: '90%',
//     maxHeight: '90vh',
//     overflow: 'auto',
//     position: 'relative'
//   };

//   const headerStyle = {
//     textAlign: 'center',
//     marginBottom: '32px',
//     paddingTop: '16px'
//   };

//   const titleStyle = {
//     fontSize: '2rem',
//     fontWeight: 'bold',
//     color: '#000',
//     margin: 0
//   };

//   const modeContainerStyle = {
//     display: 'flex',
//     gap: '32px',
//     justifyContent: 'center',
//     alignItems: 'center',
//     minHeight: '300px'
//   };

//   const modeCardStyle = {
//     padding: '32px',
//     textAlign: 'center',
//     cursor: 'pointer',
//     transition: 'all 0.2s ease',
//     backgroundColor: '#fff',
//     border: '2px solid transparent',
//     borderRadius: '8px',
//     minWidth: '200px',
//     minHeight: '150px',
//     boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//   };

//   const modeCardHoverStyle = {
//     ...modeCardStyle,
//     transform: 'translateY(-2px)',
//     boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
//   };

//   const modeCardSelectedStyle = {
//     ...modeCardStyle,
//     backgroundColor: '#e3f2fd',
//     borderColor: '#2196f3'
//   };

//   const modeTitleStyle = {
//     fontSize: '1.5rem',
//     fontWeight: 'bold',
//     color: '#6c5ce7',
//     marginBottom: '16px',
//     margin: '0 0 16px 0'
//   };

//   const modeDescStyle = {
//     color: '#666',
//     margin: 0
//   };

//   const orStyle = {
//     color: '#999',
//     fontWeight: 'bold',
//     fontSize: '2rem',
//     padding: '0 16px'
//   };

//   const qrContainerStyle = {
//     textAlign: 'center'
//   };

//   const qrFlexStyle = {
//     display: 'flex',
//     gap: '32px',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: '32px'
//   };

//   const qrCodeWrapperStyle = {
//     padding: '24px',
//     backgroundColor: '#fff',
//     borderRadius: '8px',
//     boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//   };

//   const qrImageStyle = {
//     width: '200px',
//     height: '200px',
//     display: 'block'
//   };

//   const linkSectionStyle = {
//     textAlign: 'center'
//   };

//   const linkBoxStyle = {
//     padding: '16px',
//     backgroundColor: '#fff',
//     borderRadius: '4px',
//     maxWidth: '300px',
//     wordBreak: 'break-all',
//     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//     marginBottom: '16px'
//   };

//   const linkTextStyle = {
//     color: '#2196f3',
//     fontSize: '0.9rem',
//     lineHeight: '1.4',
//     margin: 0
//   };

//   const buttonStyle = {
//     padding: '8px 16px',
//     border: '1px solid #ccc',
//     backgroundColor: '#fff',
//     color: '#666',
//     borderRadius: '4px',
//     cursor: 'pointer',
//     fontSize: '14px',
//     display: 'inline-flex',
//     alignItems: 'center',
//     gap: '8px'
//   };

//   const buttonHoverStyle = {
//     borderColor: '#999',
//     backgroundColor: '#f5f5f5'
//   };

//   const participantLabelStyle = {
//     fontWeight: 'bold',
//     marginBottom: '24px',
//     color: '#000',
//     fontSize: '1.25rem',
//     margin: '0 0 24px 0'
//   };

//   const buttonGroupStyle = {
//     display: 'flex',
//     gap: '16px',
//     justifyContent: 'center'
//   };

//   const cancelButtonStyle = {
//     ...buttonStyle,
//     padding: '12px 32px'
//   };

//   const continueButtonStyle = {
//     padding: '12px 32px',
//     backgroundColor: '#333',
//     color: 'white',
//     border: 'none',
//     borderRadius: '4px',
//     cursor: 'pointer',
//     fontSize: '14px'
//   };

//   const continueButtonHoverStyle = {
//     backgroundColor: '#555'
//   };

//   return (
//     <div style={overlayStyle}>
//       <div style={dialogStyle}>
//         <div style={headerStyle}>
//           <h2 style={titleStyle}>
//             Join the group exploring the data
//           </h2>
//         </div>

//         {!showQRCode ? (
//           <div style={modeContainerStyle}>
//             {/* Solo Mode */}
//             <div
//               style={selectedMode === 'solo' ? modeCardSelectedStyle : modeCardStyle}
//               onClick={() => handleModeSelect('solo')}
//               onMouseEnter={(e) => {
//                 if (selectedMode !== 'solo') {
//                   Object.assign(e.target.style, modeCardHoverStyle);
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (selectedMode !== 'solo') {
//                   Object.assign(e.target.style, modeCardStyle);
//                 }
//               }}
//             >
//               <h3 style={modeTitleStyle}>
//                 As a Solo Explorer
//               </h3>
//               <p style={modeDescStyle}>
//                 Explore the data on your own
//               </p>
//             </div>

//             {/* OR Divider */}
//             <div style={{ display: 'flex', alignItems: 'center', minHeight: '150px' }}>
//               <span style={orStyle}>OR</span>
//             </div>

//             {/* Group Mode */}
//             <div
//               style={selectedMode === 'group' ? modeCardSelectedStyle : modeCardStyle}
//               onClick={() => handleModeSelect('group')}
//               onMouseEnter={(e) => {
//                 if (selectedMode !== 'group') {
//                   Object.assign(e.target.style, modeCardHoverStyle);
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (selectedMode !== 'group') {
//                   Object.assign(e.target.style, modeCardStyle);
//                 }
//               }}
//             >
//               <h3 style={modeTitleStyle}>
//                 As a Participant
//               </h3>
//               <p style={modeDescStyle}>
//                 Join a collaborative session
//               </p>
//             </div>
//           </div>
//         ) : (
//           <div style={qrContainerStyle}>
//             <h3 style={modeTitleStyle}>
//               As a Participant
//             </h3>

//             <div style={qrFlexStyle}>
//               {/* QR Code */}
//               <div style={qrCodeWrapperStyle}>
//                 <img
//                   src={generateQRCode(shareableLink)}
//                   alt="QR Code for group session"
//                   style={qrImageStyle}
//                 />
//               </div>

//               {/* OR Divider */}
//               <span style={orStyle}>OR</span>

//               {/* Copy Link Section */}
//               <div style={linkSectionStyle}>
//                 <div style={linkBoxStyle}>
//                   <p style={linkTextStyle}>
//                     {shareableLink}
//                   </p>
//                 </div>
//                 <button
//                   style={buttonStyle}
//                   onClick={handleCopyLink}
//                   onMouseEnter={(e) => {
//                     Object.assign(e.target.style, { ...buttonStyle, ...buttonHoverStyle });
//                   }}
//                   onMouseLeave={(e) => {
//                     Object.assign(e.target.style, buttonStyle);
//                   }}
//                 >
//                   <span>📋</span>
//                   Copy Link
//                 </button>
//               </div>
//             </div>

//             {/* Participant Label and Action Buttons */}
//             <div style={{ textAlign: 'center' }}>
//               <h4 style={participantLabelStyle}>
//                 Participant
//               </h4>
              
//               <div style={buttonGroupStyle}>
//                 <button
//                   style={cancelButtonStyle}
//                   onClick={handleCancel}
//                   onMouseEnter={(e) => {
//                     Object.assign(e.target.style, { ...cancelButtonStyle, ...buttonHoverStyle });
//                   }}
//                   onMouseLeave={(e) => {
//                     Object.assign(e.target.style, cancelButtonStyle);
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   style={continueButtonStyle}
//                   onClick={handleContinue}
//                   onMouseEnter={(e) => {
//                     Object.assign(e.target.style, { ...continueButtonStyle, ...continueButtonHoverStyle });
//                   }}
//                   onMouseLeave={(e) => {
//                     Object.assign(e.target.style, continueButtonStyle);
//                   }}
//                 >
//                   Continue
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Landing Page Component (your original content)
// const LandingPage = ({ sessionId, studentId, onSeeControls }) => {
//   const containerStyle = {
//     maxWidth: '800px',
//     margin: '0 auto',
//     padding: '32px 16px',
//     fontFamily: 'Arial, sans-serif'
//   };

//   const experimentBoxStyle = {
//     padding: '16px',
//     backgroundColor: '#e0e0e0',
//     marginBottom: '24px',
//     borderRadius: '4px'
//   };

//   const experimentTitleStyle = {
//     fontWeight: 'bold',
//     fontSize: '1.3rem',
//     marginBottom: '15px',
//     color: '#000000',
//     margin: '0 0 15px 0'
//   };

//   const experimentDescStyle = {
//     fontSize: '1rem',
//     lineHeight: '1.6',
//     color: '#000000',
//     margin: 0
//   };

//   const buttonContainerStyle = {
//     display: 'flex',
//     justifyContent: 'flex-end',
//     marginTop: '16px'
//   };

//   const seeControlsButtonStyle = {
//     backgroundColor: '#000000',
//     color: 'white',
//     padding: '12px 24px',
//     fontWeight: 'bold',
//     fontSize: '1rem',
//     borderRadius: '4px',
//     textTransform: 'uppercase',
//     border: 'none',
//     cursor: 'pointer'
//   };

//   const seeControlsButtonHoverStyle = {
//     backgroundColor: '#333333'
//   };

//   return (
//     <div style={containerStyle}>
//       {/* Experiment Box */}
//       <div style={experimentBoxStyle}>
//         <h4 style={experimentTitleStyle}>
//           Experiment: What brain regions integrate audio perception?
//         </h4>
//         <p style={experimentDescStyle}>
//           In order to study the neural dynamics of perceptual integration, subjects listen to a sequence of tones experienced either as a single audio stream or as two parallel audio streams. Neurophysiological indices of information integration are calculated from scalp EEG recordings, identifying a functional network spanning two brain regions which is claimed to be responsible for perceptual integration and differentiation.
//         </p>
//       </div>

//       {/* See Controls Button */}
//       <div style={buttonContainerStyle}>
//         <button
//           style={seeControlsButtonStyle}
//           onClick={onSeeControls}
//           onMouseEnter={(e) => {
//             Object.assign(e.target.style, { ...seeControlsButtonStyle, ...seeControlsButtonHoverStyle });
//           }}
//           onMouseLeave={(e) => {
//             Object.assign(e.target.style, seeControlsButtonStyle);
//           }}
//         >
//           SEE CONTROLS
//         </button>
//       </div>
//     </div>
//   );
// };

// // Complete Application Component
// const ExampleApp = () => {
//   const [showPopup, setShowPopup] = useState(true);
//   const [sessionId, setSessionId] = useState('session-123');
//   const [studentId, setStudentId] = useState('student-456');

//   const handleSeeControlsClick = () => {
//     // Navigate to review controls with the session and student IDs
//     const queryParams = new URLSearchParams();
//     if (sessionId) queryParams.append('sessionID', sessionId);
//     if (studentId) queryParams.append('studentId', studentId);
    
//     // In a real Next.js app, you would use router.push here
//     console.log(`Would navigate to: /review-controls?${queryParams.toString()}`);
//     alert(`Would navigate to: /review-controls?${queryParams.toString()}`);
//   };

//   const handlePopupClose = () => {
//     // Only allow closing if a sessionID exists (as in your original logic)
//     if (sessionId) {
//       setShowPopup(false);
//     }
//   };

//   const containerStyle = {
//     backgroundColor: '#f8f9fa',
//     minHeight: '100vh',
//     fontFamily: 'Arial, sans-serif'
//   };

//   return (
//     <div style={containerStyle}>
//       {/* Mode Selection Popup */}
//       <ModeSelectionPopup
//         open={showPopup}
//         onClose={handlePopupClose}
//         setSessionID={setSessionId}
//         sessionId={sessionId}
//         studentId={studentId}
//       />
      
//       {/* Landing Page Content (shown after popup closes) */}
//       {!showPopup && (
//         <LandingPage
//           sessionId={sessionId}
//           studentId={studentId}
//           onSeeControls={handleSeeControlsClick}
//         />
//       )}
      
//       {/* Debug info - remove in production */}
//       {!showPopup && (
//         <div style={{ position: 'fixed', bottom: '10px', right: '10px', background: 'white', padding: '10px', border: '1px solid #ccc', fontSize: '12px' }}>
//           Session ID: {sessionId}<br/>
//           Student ID: {studentId}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ExampleApp;