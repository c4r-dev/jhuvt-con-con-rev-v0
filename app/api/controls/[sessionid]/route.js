// export async function GET_DYNAMIC(req, { params }) {
//     try {
//       await connectMongoDB();
  
//       const { sessionId } = params;
//       const { searchParams } = new URL(req.url);
//       const studentId = searchParams.get('studentId');
  
//       if (!sessionId) {
//         return NextResponse.json(
//           { message: 'sessionId parameter is required' },
//           { status: 400 }
//         );
//       }
  
//       const session = await session.findOne({ sessionId });
  
//       if (!session) {
//         return NextResponse.json(
//           { message: `Session '${sessionId}' not found` },
//           { status: 404 }
//         );
//       }
  
//       // If studentId query param is provided
//       if (studentId) {
//         const student = session.students.find(s => s.studentId === studentId);
        
//         if (!student) {
//           return NextResponse.json(
//             { message: `Student '${studentId}' not found in session` },
//             { status: 404 }
//           );
//         }
  
//         return NextResponse.json({
//           message: 'Student data retrieved successfully',
//           data: {
//             sessionId: session.sessionId,
//             sessionType: session.sessionType,
//             student,
//             sessionStats: {
//               totalStudents: session.students.length,
//               createdAt: session.createdAt,
//               updatedAt: session.updatedAt
//             }
//           }
//         });
//       }
  
//       // Return full session
//       return NextResponse.json({
//         message: 'Session retrieved successfully',
//         data: {
//           sessionId: session.sessionId,
//           sessionType: session.sessionType,
//           totalStudents: session.students.length,
//           students: session.students,
//           createdAt: session.createdAt,
//           updatedAt: session.updatedAt,
//           analytics: {
//             optionBreakdown: getOptionBreakdown(session.students),
//             timerStats: getTimerStats(session.students),
//             responseStats: getResponseStats(session.students)
//           }
//         }
//       });
  
//     } catch (error) {
//       console.error('Error retrieving session:', error);
//       return NextResponse.json(
//         { message: 'Internal Server Error', error: error.message },
//         { status: 500 }
//       );
//     }
//   }
  
//   // Helper functions for analytics
//   function getOptionBreakdown(students) {
//     const breakdown = {};
//     students.forEach(student => {
//       if (student.option) {
//         breakdown[student.option] = (breakdown[student.option] || 0) + 1;
//       }
//     });
//     return breakdown;
//   }
  
//   function getTimerStats(students) {
//     const withinTimer = students.filter(s => s.withinTimer).length;
//     const outsideTimer = students.length - withinTimer;
//     return {
//       withinTimer,
//       outsideTimer,
//       total: students.length,
//       percentageWithinTimer: students.length > 0 ? Math.round((withinTimer / students.length) * 100) : 0
//     };
//   }
  
//   function getResponseStats(students) {
//     const withResponse = students.filter(s => s.response && s.response.trim()).length;
//     const withoutResponse = students.length - withResponse;
//     return {
//       withResponse,
//       withoutResponse,
//       total: students.length,
//       averageResponseLength: students.length > 0 
//         ? Math.round(students.reduce((sum, s) => sum + (s.response?.length || 0), 0) / students.length)
//         : 0
//     };
//   }



// Make sure to import your Session model at the top
import Session from '../../../api/models/session'; // Adjust path as needed
import connectMongoDB from '../../../api/libs/mongodb'; // Adjust path as needed
import { NextResponse } from 'next/server';


// Option 1: If your file is at /api/controls/[sessionId]/route.js
export async function GET(req, { params }) {
    try {
      await connectMongoDB();
  
      const { sessionId } = params; // This works if file is at /api/controls/[sessionId]/route.js
      const { searchParams } = new URL(req.url);
      const studentId = searchParams.get('studentId');
  
      console.log('=== GET API DEBUG START ===');
      console.log('SessionId from params:', sessionId);
      console.log('StudentId query param:', studentId);
      console.log('Full URL:', req.url);
      console.log('Params object:', params);
  
      if (!sessionId) {
        return NextResponse.json(
          { message: 'sessionId parameter is required' },
          { status: 400 }
        );
      }
  
      const session = await Session.findOne({ sessionId });
  
      if (!session) {
        return NextResponse.json(
          { message: `Session '${sessionId}' not found` },
          { status: 404 }
        );
      }
  
      console.log('Found session with students count:', session.students.length);
  
      // If studentId query param is provided
      if (studentId) {
        const student = session.students.find(s => s.studentId === studentId);
        
        if (!student) {
          return NextResponse.json(
            { message: `Student '${studentId}' not found in session` },
            { status: 404 }
          );
        }
  
        console.log('RETRIEVED STUDENT OBJECT:', JSON.stringify(student, null, 2));
        console.log('Student limitExplanation:', student.limitExplanation);
        console.log('Student limitExplanations:', student.limitExplanations);
        console.log('=== GET API DEBUG END ===');
  
        return NextResponse.json({
          message: 'Student data retrieved successfully',
          data: {
            sessionId: session.sessionId,
            sessionType: session.sessionType,
            student,
            sessionStats: {
              totalStudents: session.students.length,
              createdAt: session.createdAt,
              updatedAt: session.updatedAt
            }
          }
        });
      }
  
      // Debug all students
      console.log('ALL STUDENTS IN SESSION:');
      session.students.forEach((student, index) => {
        console.log(`Student ${index + 1}:`, JSON.stringify(student, null, 2));
      });
      console.log('=== GET API DEBUG END ===');
  
      // Return full session
      return NextResponse.json({
        message: 'Session retrieved successfully',
        data: {
          sessionId: session.sessionId,
          sessionType: session.sessionType,
          totalStudents: session.students.length,
          students: session.students,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          analytics: {
            optionBreakdown: getOptionBreakdown(session.students),
            timerStats: getTimerStats(session.students),
            responseStats: getResponseStats(session.students)
          }
        }
      });
  
    } catch (error) {
      console.error('Error retrieving session:', error);
      return NextResponse.json(
        { message: 'Internal Server Error', error: error.message },
        { status: 500 }
      );
    }
}

// Helper functions for analytics
function getOptionBreakdown(students) {
  const breakdown = {};
  students.forEach(student => {
    if (student.option) {
      breakdown[student.option] = (breakdown[student.option] || 0) + 1;
    }
  });
  return breakdown;
}

function getTimerStats(students) {
  const withinTimer = students.filter(s => s.withinTimer).length;
  const outsideTimer = students.length - withinTimer;
  return {
    withinTimer,
    outsideTimer,
    total: students.length,
    percentageWithinTimer: students.length > 0 ? Math.round((withinTimer / students.length) * 100) : 0
  };
}

function getResponseStats(students) {
  const withResponse = students.filter(s => s.response && s.response.trim()).length;
  const withoutResponse = students.length - withResponse;
  const responseLengths = students
    .map(s => s.response?.length || 0)
    .filter(length => length > 0);
  
  return {
    withResponse,
    withoutResponse,
    total: students.length,
    averageResponseLength: responseLengths.length > 0 
      ? Math.round(responseLengths.reduce((sum, length) => sum + length, 0) / responseLengths.length)
      : 0
  };
}