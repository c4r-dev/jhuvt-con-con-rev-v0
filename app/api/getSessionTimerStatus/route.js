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