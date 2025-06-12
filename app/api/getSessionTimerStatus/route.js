import { NextResponse } from "next/server";
import connectMongoDB from "../libs/mongodb";
import Timer from "../models/timer"; // Import the new Timer model

// Revalidate this route's response every 10 seconds
export const revalidate = 10;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionID = searchParams.get('sessionID');

    if (!sessionID) {
      return NextResponse.json({ message: "Missing sessionID parameter." }, { status: 400 });
    }

    // Optional: Add log to see when the function actually runs vs. serving cache
    console.log(`[API Timer Status] Executing GET for ${sessionID}`);

    await connectMongoDB();

    const sessionData = await Timer.findOne({ sessionID }).exec();

    if (!sessionData || !sessionData.timerStartTime) {
      // No session found or timer hasn't started
      return NextResponse.json({
        isActive: false,
        startTime: null,
        durationSeconds: sessionData?.timerDurationSeconds || 90, // Return default or stored duration
      }, { status: 200 });
    }

    // Timer has started, calculate remaining time
    const startTimeMs = sessionData.timerStartTime.getTime();
    const durationMs = (sessionData.timerDurationSeconds || 90) * 1000;
    const elapsedMs = Date.now() - startTimeMs;
    const remainingMs = durationMs - elapsedMs;
    const isActive = remainingMs > 0;

    return NextResponse.json({
      isActive: isActive,
      startTime: sessionData.timerStartTime,
      durationSeconds: sessionData.timerDurationSeconds || 90,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching session timer status:", error);
    return NextResponse.json({ message: "Error fetching session timer status.", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionID = searchParams.get('sessionID');

    if (!sessionID) {
      return NextResponse.json({ message: "Missing sessionID parameter." }, { status: 400 });
    }

    console.log(`[API Timer Delete] Resetting timer for ${sessionID}`);

    await connectMongoDB();

    // Find the session and reset the timer start time to null
    const updatedSession = await Timer.findOneAndUpdate(
      { sessionID },
      { 
        $unset: { timerStartTime: "" } // This removes the field entirely
        // Alternatively, you can use: $set: { timerStartTime: null }
      },
      { 
        new: true, // Return the updated document
        upsert: false // Don't create if it doesn't exist
      }
    ).exec();

    if (!updatedSession) {
      return NextResponse.json({ message: "Session not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Timer reset successfully.",
      sessionID: sessionID,
      isActive: false,
      startTime: null,
      durationSeconds: updatedSession.timerDurationSeconds || 90
    }, { status: 200 });

  } catch (error) {
    console.error("Error resetting session timer:", error);
    return NextResponse.json({ message: "Error resetting session timer.", error: error.message }, { status: 500 });
  }
}

//to delete a session:
// run these 2 api's: 
// 1 -> http://localhost:3001/api/controls?sessionID={sessionId}&confirm=true
//2 ->  http://localhost:3001/api/getSessionTimerStatus?sessionID={sessionID}&confirm=true

