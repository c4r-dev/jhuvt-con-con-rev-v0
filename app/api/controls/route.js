import { NextResponse } from 'next/server';
import connectMongoDB from '../libs/mongodb';
import Session from '../models/session';

// export async function POST(req) {
//   try {
//     await connectMongoDB();

//     const body = await req.json();
//     const { sessionId, studentId, option, customOption, response, withinTimer } = body;

//     // Validate required fields
//     if (!sessionId || !studentId) {
//       return NextResponse.json(
//         { message: 'Missing required fields: sessionId and studentId are required' },
//         { status: 400 }
//       );
//     }

//     // Validate option if provided
//     if (option) {
//       const validOptions = [
//         'Set this experiment aside.',
//         'Compromise option 1.',
//         'Compromise option 2.',
//         'Other.'
//       ];

//       if (!validOptions.includes(option)) {
//         return NextResponse.json(
//           { message: `Invalid option. Must be one of: ${validOptions.join(', ')}` },
//           { status: 400 }
//         );
//       }

//       // If option is "Other.", customOption should be provided
//       if (option === 'Other.' && (!customOption || customOption.trim() === '')) {
//         return NextResponse.json(
//           { message: 'customOption is required when option is "Other."' },
//           { status: 400 }
//         );
//       }
//     }

//     // Validate withinTimer if provided
//     if (withinTimer !== undefined && typeof withinTimer !== 'boolean') {
//       return NextResponse.json(
//         { message: 'withinTimer must be a boolean value' },
//         { status: 400 }
//       );
//     }

//     // Find existing session or create new one
//     let session = await Session.findOne({ sessionId });

//     if (!session) {
//       session = new Session({
//         sessionId,
//         sessionType: 'individual', // Default to individual, can be modified as needed
//         students: []
//       });
//     }

//     // Check if student already exists in the session
//     let studentIndex = session.students.findIndex(
//       student => student.studentId === studentId
//     );

//     if (studentIndex === -1) {
//       // Create new student entry
//       session.students.push({
//         studentId,
//         option: option || null,
//         response: response || null,
//         withinTimer: withinTimer !== undefined ? withinTimer : true,
//         limitExplanation: null, // Can be added later if needed
//         customOption: (option === 'Other.' && customOption) ? customOption.trim() : null
//       });
//       studentIndex = session.students.length - 1;
//     } else {
//       // Update existing student
//       const student = session.students[studentIndex];
      
//       if (option !== undefined) student.option = option;
//       if (response !== undefined) student.response = response;
//       if (withinTimer !== undefined) student.withinTimer = withinTimer;
//       if (option === 'Other.' && customOption) {
//         student.customOption = customOption.trim();
//       } else if (option && option !== 'Other.') {
//         student.customOption = null; // Clear customOption if option is not "Other."
//       }
      
//       // Update timestamp
//       student.timestamp = new Date();
//     }

//     // Mark the students array as modified for Mongoose
//     session.markModified('students');

//     // Save the session
//     await session.save();

//     const student = session.students[studentIndex];
//     const action = studentIndex === session.students.length - 1 ? 'created' : 'updated';

//     return NextResponse.json(
//       {
//         message: `Student data ${action} successfully`,
//         data: {
//           sessionId,
//           studentId,
//           student: {
//             studentId: student.studentId,
//             option: student.option,
//             response: student.response,
//             withinTimer: student.withinTimer,
//             customOption: student.customOption,
//             timestamp: student.timestamp
//           },
//           action,
//           updatedAt: new Date().toISOString()
//         }
//       },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error('Error saving session data:', error);

//     if (error.name === 'ValidationError') {
//       return NextResponse.json(
//         {
//           message: 'Validation error',
//           details: Object.values(error.errors).map(err => err.message)
//         },
//         { status: 400 }
//       );
//     }

//     if (error.code === 11000) {
//       return NextResponse.json(
//         { message: 'Session with this sessionId already exists with conflicting data' },
//         { status: 409 }
//       );
//     }

//     return NextResponse.json(
//       { message: 'Internal Server Error', error: error.message },
//       { status: 500 }
//     );
//   }
// }


export async function POST(req) {
  try {
    await connectMongoDB();

    const body = await req.json();
    const { sessionId, studentId, option, customOption, response, withinTimer, limitExplanation } = body;

    // Validate required fields
    if (!sessionId || !studentId) {
      return NextResponse.json(
        { message: 'Missing required fields: sessionId and studentId are required' },
        { status: 400 }
      );
    }

    // Validate option if provided
    if (option) {
      const validOptions = [
        'Set this experiment aside.',
        'Compromise option 1.',
        'Compromise option 2.',
        'Other.'
      ];

      if (!validOptions.includes(option)) {
        return NextResponse.json(
          { message: `Invalid option. Must be one of: ${validOptions.join(', ')}` },
          { status: 400 }
        );
      }

      // If option is "Other.", customOption should be provided
      if (option === 'Other.' && (!customOption || customOption.trim() === '')) {
        return NextResponse.json(
          { message: 'customOption is required when option is "Other."' },
          { status: 400 }
        );
      }
    }

    // Validate withinTimer if provided
    if (withinTimer !== undefined && typeof withinTimer !== 'boolean') {
      return NextResponse.json(
        { message: 'withinTimer must be a boolean value' },
        { status: 400 }
      );
    }

    // Validate limitExplanation if provided
    if (limitExplanation !== undefined && typeof limitExplanation !== 'string') {
      return NextResponse.json(
        { message: 'limitExplanation must be a string value' },
        { status: 400 }
      );
    }

    // Find existing session
    let session = await Session.findOne({ sessionId });

    if (!session) {
      // Only create new session if we have basic data (not just limitExplanation)
      if (!option && !response && limitExplanation) {
        return NextResponse.json(
          { message: 'Cannot create new session with only limitExplanation. Session must exist.' },
          { status: 404 }
        );
      }

      session = new Session({
        sessionId,
        sessionType: 'individual', // Default to individual, can be modified as needed
        students: []
      });
    }

    // Check if student already exists in the session
    let studentIndex = session.students.findIndex(
      student => student.studentId === studentId
    );

    if (studentIndex === -1) {
      // Only create new student if we have basic data (not just limitExplanation)
      if (!option && !response && limitExplanation) {
        return NextResponse.json(
          { message: 'Cannot create new student with only limitExplanation. Student must exist in session.' },
          { status: 404 }
        );
      }

      // Create new student entry
      session.students.push({
        studentId,
        option: option || null,
        response: response || null,
        withinTimer: withinTimer !== undefined ? withinTimer : true,
        limitExplanation: limitExplanation || null,
        customOption: (option === 'Other.' && customOption) ? customOption.trim() : null
      });
      studentIndex = session.students.length - 1;
    } else {
      // Update existing student
      const student = session.students[studentIndex];
      
      if (option !== undefined) student.option = option;
      if (response !== undefined) student.response = response;
      if (withinTimer !== undefined) student.withinTimer = withinTimer;
      if (limitExplanation !== undefined) student.limitExplanation = limitExplanation.trim() || null;
      
      if (option === 'Other.' && customOption) {
        student.customOption = customOption.trim();
      } else if (option && option !== 'Other.') {
        student.customOption = null; // Clear customOption if option is not "Other."
      }
      
      // Update timestamp
      student.timestamp = new Date();
    }

    // Mark the students array as modified for Mongoose
    session.markModified('students');

    // Save the session
    await session.save();

    const student = session.students[studentIndex];
    const action = studentIndex === session.students.length - 1 ? 'created' : 'updated';

    // Determine what was updated for better response messaging
    let updatedFields = [];
    if (option !== undefined) updatedFields.push('option');
    if (response !== undefined) updatedFields.push('response');
    if (limitExplanation !== undefined) updatedFields.push('limitExplanation');
    if (customOption !== undefined) updatedFields.push('customOption');
    if (withinTimer !== undefined) updatedFields.push('withinTimer');

    return NextResponse.json(
      {
        message: `Student data ${action} successfully`,
        updatedFields: updatedFields,
        data: {
          sessionId,
          studentId,
          student: {
            studentId: student.studentId,
            option: student.option,
            response: student.response,
            withinTimer: student.withinTimer,
            limitExplanation: student.limitExplanation,
            customOption: student.customOption,
            timestamp: student.timestamp
          },
          action,
          updatedAt: new Date().toISOString()
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error saving session data:', error);

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        {
          message: 'Validation error',
          details: Object.values(error.errors).map(err => err.message)
        },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'Session with this sessionId already exists with conflicting data' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

// Optional: Add a separate PATCH method specifically for updating limitExplanation
// export async function PATCH(req) {
//   try {
//     await connectMongoDB();

//     const body = await req.json();
//     const { sessionId, studentId, limitExplanation } = body;

//     // Validate required fields
//     if (!sessionId || !studentId) {
//       return NextResponse.json(
//         { message: 'Missing required fields: sessionId and studentId are required' },
//         { status: 400 }
//       );
//     }

//     // Validate limitExplanation
//     if (limitExplanation === undefined) {
//       return NextResponse.json(
//         { message: 'limitExplanation is required for this operation' },
//         { status: 400 }
//       );
//     }

//     if (typeof limitExplanation !== 'string') {
//       return NextResponse.json(
//         { message: 'limitExplanation must be a string value' },
//         { status: 400 }
//       );
//     }

//     // Find existing session
//     const session = await Session.findOne({ sessionId });

//     if (!session) {
//       return NextResponse.json(
//         { message: 'Session not found' },
//         { status: 404 }
//       );
//     }

//     // Find the student in the session
//     const studentIndex = session.students.findIndex(
//       student => student.studentId === studentId
//     );

//     if (studentIndex === -1) {
//       return NextResponse.json(
//         { message: 'Student not found in session' },
//         { status: 404 }
//       );
//     }

//     // Update the limitExplanation
//     session.students[studentIndex].limitExplanation = limitExplanation.trim() || null;
//     session.students[studentIndex].timestamp = new Date();

//     // Mark the students array as modified for Mongoose
//     session.markModified('students');

//     // Save the session
//     await session.save();

//     const updatedStudent = session.students[studentIndex];

//     return NextResponse.json(
//       {
//         message: 'Limit explanation updated successfully',
//         data: {
//           sessionId,
//           studentId,
//           student: {
//             studentId: updatedStudent.studentId,
//             option: updatedStudent.option,
//             response: updatedStudent.response,
//             withinTimer: updatedStudent.withinTimer,
//             limitExplanation: updatedStudent.limitExplanation,
//             customOption: updatedStudent.customOption,
//             timestamp: updatedStudent.timestamp
//           },
//           updatedAt: new Date().toISOString()
//         }
//       },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error('Error updating limit explanation:', error);

//     return NextResponse.json(
//       { message: 'Internal Server Error', error: error.message },
//       { status: 500 }
//     );
//   }
// }

// PATCH API with extensive debugging
export async function PATCH(req) {
  try {
    await connectMongoDB();
    
    const body = await req.json();
    const { sessionId, studentId, limitExplanation } = body;
    
    console.log('=== PATCH API DEBUG START ===');
    console.log('Request body:', body);
    
    // Validate required fields
    if (!sessionId || !studentId) {
      return NextResponse.json(
        { message: 'Missing required fields: sessionId and studentId are required' },
        { status: 400 }
      );
    }
    
    if (limitExplanation === undefined) {
      return NextResponse.json(
        { message: 'limitExplanation is required for this operation' },
        { status: 400 }
      );
    }
    
    if (typeof limitExplanation !== 'string') {
      return NextResponse.json(
        { message: 'limitExplanation must be a string value' },
        { status: 400 }
      );
    }
    
    // Find existing session
    const session = await Session.findOne({ sessionId });
    
    if (!session) {
      return NextResponse.json(
        { message: 'Session not found' },
        { status: 404 }
      );
    }
    
    console.log('Found session:', session.sessionId);
    
    // Find the student in the session
    const studentIndex = session.students.findIndex(
      student => student.studentId === studentId
    );
    
    if (studentIndex === -1) {
      return NextResponse.json(
        { message: 'Student not found in session' },
        { status: 404 }
      );
    }
    
    const student = session.students[studentIndex];
    console.log('BEFORE UPDATE - Student object:', JSON.stringify(student, null, 2));
    
    const trimmedExplanation = limitExplanation.trim() || null;
    
    // Initialize limitExplanations object if it doesn't exist
    if (!student.limitExplanations) {
      student.limitExplanations = {};
      console.log('Initialized empty limitExplanations object');
    }
    
    console.log('Current limitExplanations:', student.limitExplanations);
    
    // Determine which field to update based on what already exists
    let fieldToUpdate;
    let explanationNumber = null;
    
    // Check if limitExplanation is empty, null, undefined, or just whitespace
    const hasLimitExplanation = student.limitExplanation && 
                               student.limitExplanation.toString().trim() !== '';
    
    console.log('hasLimitExplanation:', hasLimitExplanation);
    
    if (!hasLimitExplanation) {
      // No valid limitExplanation exists, use the original field
      fieldToUpdate = 'limitExplanation';
      console.log('Will update main limitExplanation field');
    } else {
      // limitExplanation exists and has content, find the next available numbered slot
      let counter = 1;
      while (student.limitExplanations[`limitExplanation${counter}`] && 
             student.limitExplanations[`limitExplanation${counter}`].toString().trim() !== '') {
        console.log(`limitExplanation${counter} exists:`, student.limitExplanations[`limitExplanation${counter}`]);
        counter++;
      }
      fieldToUpdate = `limitExplanation${counter}`;
      explanationNumber = counter;
      console.log(`Will update numbered field: ${fieldToUpdate}`);
    }
    
    // Update the appropriate field
    if (fieldToUpdate === 'limitExplanation') {
      student.limitExplanation = trimmedExplanation;
      console.log('Updated main limitExplanation to:', trimmedExplanation);
    } else {
      student.limitExplanations[fieldToUpdate] = trimmedExplanation;
      console.log(`Updated ${fieldToUpdate} to:`, trimmedExplanation);
      // Mark limitExplanations as modified for Schema.Types.Mixed
      session.students[studentIndex].markModified('limitExplanations');
      console.log('Marked limitExplanations as modified');
    }
    
    // Update timestamp
    student.timestamp = new Date();
    
    // Mark the students array as modified for Mongoose
    session.markModified('students');
    console.log('Marked students array as modified');
    
    console.log('AFTER UPDATE - Student object:', JSON.stringify(student, null, 2));
    
    // Save the session
    const savedSession = await session.save();
    console.log('Session saved successfully');
    
    // Verify the save by finding the student again
    const verifyStudent = savedSession.students.find(s => s.studentId === studentId);
    console.log('VERIFICATION - Student after save:', JSON.stringify(verifyStudent, null, 2));
    
    const updatedStudent = session.students[studentIndex];
    
    console.log('=== PATCH API DEBUG END ===');
    
    return NextResponse.json(
      {
        message: `Limit explanation updated successfully in field: ${fieldToUpdate}`,
        data: {
          sessionId,
          studentId,
          fieldUpdated: fieldToUpdate,
          explanationNumber: explanationNumber,
          student: {
            studentId: updatedStudent.studentId,
            option: updatedStudent.option,
            response: updatedStudent.response,
            withinTimer: updatedStudent.withinTimer,
            limitExplanation: updatedStudent.limitExplanation,
            limitExplanations: updatedStudent.limitExplanations,
            customOption: updatedStudent.customOption,
            timestamp: updatedStudent.timestamp
          },
          updatedAt: new Date().toISOString()
        }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error updating limit explanation:', error);
    
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}



export async function GET(req) {
    try {
      await connectMongoDB();
  
      const { searchParams } = new URL(req.url);
      const sessionId = searchParams.get('sessionId'); // Get from query parameter
      const studentId = searchParams.get('studentId');
  
      console.log('=== GET API DEBUG START ===');
      console.log('Full URL:', req.url);
      console.log('SessionId from query:', sessionId);
      console.log('StudentId query param:', studentId);
      console.log('All search params:', Object.fromEntries(searchParams.entries()));
  
      if (!sessionId) {
        return NextResponse.json(
          { message: 'sessionId query parameter is required' },
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
  
      // Return full session if no specific student requested
      return NextResponse.json({
        message: 'Session retrieved successfully',
        data: {
          sessionId: session.sessionId,
          sessionType: session.sessionType,
          totalStudents: session.students.length,
          students: session.students,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
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


export async function DELETE(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionID'); // Get specific session to delete
    const confirmDelete = searchParams.get('confirm'); // Safety parameter

    console.log('=== DELETE SESSIONS API DEBUG START ===');
    console.log('Full URL:', req.url);
    console.log('SessionId from query:', sessionId);
    console.log('Confirm parameter:', confirmDelete);
    console.log('All search params:', Object.fromEntries(searchParams.entries()));

    // Safety check - require confirmation parameter
    if (confirmDelete !== 'true') {
      const warningMessage = sessionId 
        ? `Confirmation required. Add ?confirm=true to delete session '${sessionId}'.`
        : 'Confirmation required. Add ?confirm=true to delete all sessions.';
      
      const warningText = sessionId
        ? `This action will permanently delete session '${sessionId}' and all its student data.`
        : 'This action will permanently delete ALL session data and cannot be undone.';

      return NextResponse.json(
        { 
          message: warningMessage,
          warning: warningText
        },
        { status: 400 }
      );
    }

    // If sessionId is provided, delete specific session
    if (sessionId) {
      console.log('Deleting specific session:', sessionId);
      
      // Check if session exists first
      const sessionToDelete = await Session.findOne({ sessionId });
      
      if (!sessionToDelete) {
        return NextResponse.json(
          { message: `Session '${sessionId}' not found` },
          { status: 404 }
        );
      }

      const studentCount = sessionToDelete.students ? sessionToDelete.students.length : 0;
      console.log('Students in session to be deleted:', studentCount);

      // Delete the specific session
      const deleteResult = await Session.deleteOne({ sessionId });
      
      console.log('Delete operation result:', deleteResult);
      console.log('=== DELETE SESSIONS API DEBUG END ===');

      return NextResponse.json({
        message: `Session '${sessionId}' deleted successfully`,
        data: {
          sessionId: sessionId,
          deletedCount: deleteResult.deletedCount,
          totalStudentsDeleted: studentCount,
          operationTimestamp: new Date().toISOString()
        }
      });
    }

    // If no sessionId provided, delete all sessions
    console.log('Deleting all sessions');

    // Get count before deletion for reporting
    const sessionCountBefore = await Session.countDocuments();
    console.log('Sessions to be deleted:', sessionCountBefore);

    if (sessionCountBefore === 0) {
      return NextResponse.json({
        message: 'No sessions found to delete',
        data: {
          deletedCount: 0,
          totalStudentsDeleted: 0
        }
      });
    }

    // Calculate total students before deletion
    const allSessions = await Session.find({}, { students: 1 });
    const totalStudentsCount = allSessions.reduce((total, session) => {
      return total + (session.students ? session.students.length : 0);
    }, 0);

    console.log('Total students to be deleted:', totalStudentsCount);

    // Delete all sessions
    const deleteResult = await Session.deleteMany({});

    console.log('Delete operation result:', deleteResult);
    console.log('=== DELETE SESSIONS API DEBUG END ===');

    return NextResponse.json({
      message: 'All sessions deleted successfully',
      data: {
        deletedCount: deleteResult.deletedCount,
        totalStudentsDeleted: totalStudentsCount,
        operationTimestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error deleting sessions:', error);
    return NextResponse.json(
      { 
        message: 'Internal Server Error', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}