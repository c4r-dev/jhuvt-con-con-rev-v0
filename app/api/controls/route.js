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
export async function PATCH(req) {
  try {
    await connectMongoDB();

    const body = await req.json();
    const { sessionId, studentId, limitExplanation } = body;

    // Validate required fields
    if (!sessionId || !studentId) {
      return NextResponse.json(
        { message: 'Missing required fields: sessionId and studentId are required' },
        { status: 400 }
      );
    }

    // Validate limitExplanation
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

    // Update the limitExplanation
    session.students[studentIndex].limitExplanation = limitExplanation.trim() || null;
    session.students[studentIndex].timestamp = new Date();

    // Mark the students array as modified for Mongoose
    session.markModified('students');

    // Save the session
    await session.save();

    const updatedStudent = session.students[studentIndex];

    return NextResponse.json(
      {
        message: 'Limit explanation updated successfully',
        data: {
          sessionId,
          studentId,
          student: {
            studentId: updatedStudent.studentId,
            option: updatedStudent.option,
            response: updatedStudent.response,
            withinTimer: updatedStudent.withinTimer,
            limitExplanation: updatedStudent.limitExplanation,
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
    const sessionId = searchParams.get('sessionId');
    const studentId = searchParams.get('studentId');

    // Validate required sessionId
    if (!sessionId) {
      return NextResponse.json(
        { message: 'Missing required parameter: sessionId is required' },
        { status: 400 }
      );
    }

    // Find the session
    const session = await Session.findOne({ sessionId });

    if (!session) {
      return NextResponse.json(
        { message: `Session with sessionId '${sessionId}' not found` },
        { status: 404 }
      );
    }

    // If studentId is provided, return only that student's data
    if (studentId) {
      const student = session.students.find(s => s.studentId === studentId);
      
      if (!student) {
        return NextResponse.json(
          { message: `Student with studentId '${studentId}' not found in session '${sessionId}'` },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: 'Student data retrieved successfully',
          data: {
            sessionId: session.sessionId,
            sessionType: session.sessionType,
            student: {
              studentId: student.studentId,
              option: student.option,
              response: student.response,
              withinTimer: student.withinTimer,
              limitExplanation: student.limitExplanation,
              customOption: student.customOption,
              timestamp: student.timestamp
            },
            sessionCreatedAt: session.createdAt,
            sessionUpdatedAt: session.updatedAt
          }
        },
        { status: 200 }
      );
    }

    // Return full session data with all students
    return NextResponse.json(
      {
        message: 'Session data retrieved successfully',
        data: {
          sessionId: session.sessionId,
          sessionType: session.sessionType,
          totalStudents: session.students.length,
          students: session.students.map(student => ({
            studentId: student.studentId,
            option: student.option,
            response: student.response,
            withinTimer: student.withinTimer,
            limitExplanation: student.limitExplanation,
            customOption: student.customOption,
            timestamp: student.timestamp
          })),
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error retrieving session data:', error);

    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}