import { NextResponse } from "next/server";
import connectMongoDB from "../libs/mongodb";
import RandomizationIdeas from "../models/randomizationIdeas";
import Timer from "../models/timer"; // Import the new Timer model

export async function POST(request) {
  try {
    // Ensure database connection
    await connectMongoDB();

    // Parse the request body
    const { ideas, sessionID } = await request.json();

    // Enhanced validation
    if (!ideas || !Array.isArray(ideas)) {
      return NextResponse.json({ message: "Invalid ideas data provided." }, { status: 400 });
    }
    if (!sessionID || sessionID.trim() === '') {
      return NextResponse.json({ message: "Missing or invalid sessionID." }, { status: 400 });
    }

    // --- Timer Logic --- 
    const now = new Date();
    const defaultDurationSeconds = 90; // Define default duration

    // First check if the session already exists to prevent duplicate key errors
    let session = await Timer.findOne({ sessionID });
    
    if (session) {
      // If session exists, update it if needed
      if (!session.timerStartTime) {
        // Only update timerStartTime if it doesn't exist yet
        session = await Timer.findOneAndUpdate(
          { sessionID },
          { 
            $set: { 
              timerStartTime: now,
              updatedAt: now 
            } 
          },
          { new: true }
        );
      }
    } else {
      // Create new session if it doesn't exist
      try {
        session = await Timer.create({
          sessionID,
          timerStartTime: now,
          timerDurationSeconds: defaultDurationSeconds,
          createdAt: now,
          updatedAt: now
        });
      } catch (error) {
        console.error("Failed to create session:", error);
        return NextResponse.json({ 
          message: "Failed to create session record.", 
          error: error.message 
        }, { status: 500 });
      }
    }

    // Check if timer has expired *before* saving ideas
    // if (session.timerStartTime) {
    //   const startTimeMs = session.timerStartTime.getTime();
    //   const durationMs = (session.timerDurationSeconds || defaultDurationSeconds) * 1000;
    //   const elapsedMs = now.getTime() - startTimeMs;
    //   if (elapsedMs > durationMs) {
    //     return NextResponse.json({ message: "Submission time has expired." }, { status: 403 }); // 403 Forbidden
    //   }
    // }
    // --- End Timer Logic ---

    // --- Save Ideas Logic --- 
    // Save or update the ideas for this sessionID.
    try {
      // First, get existing ideas for this session
      const existingIdeas = await RandomizationIdeas.findOne({ sessionID });
      
      if (existingIdeas) {
        // If ideas exist, append new ones while avoiding duplicates
        const combinedIdeas = [...new Set([...existingIdeas.ideas, ...ideas])];
        await RandomizationIdeas.findOneAndUpdate(
          { sessionID },
          { $set: { ideas: combinedIdeas } },
          { new: true }
        );
      } else {
        // If no existing ideas, create new document
        await RandomizationIdeas.create({
          sessionID,
          ideas
        });
      }
    } catch (error) {
      console.error("Failed to save randomization ideas:", error);
      return NextResponse.json({ 
        message: "Failed to save randomization ideas.", 
        error: error.message 
      }, { status: 500 });
    }
    // --- End Save Ideas Logic --- 

    return NextResponse.json({ 
      message: "Randomization ideas saved successfully.",
      timerStarted: session.timerStartTime?.getTime() === now.getTime(), // Inform client if this save started the timer
      timerStartTime: session.timerStartTime
    }, { status: 201 });

  } catch (error) {
    console.error("Error saving randomization ideas:", error);
    // Return an error response
    return NextResponse.json({ message: "Error saving randomization ideas.", error: error.message }, { status: 500 });
  }
} 