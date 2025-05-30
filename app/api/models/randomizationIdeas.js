import mongoose, { Schema } from "mongoose";

// Define the schema for saving randomization ideas
const randomizationIdeasSchema = new Schema(
  {
    // Array of idea strings
    ideas: [{ type: String, required: true }],
    // Session identifier
    sessionID: { type: String, required: true },
    // Timestamp is automatically handled by timestamps: true
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create and export the Mongoose model
// Checks if the model already exists before creating it to prevent overwrite errors during hot-reloading
export default mongoose.models.RandomizationIdeas || mongoose.model("RandomizationIdeas", randomizationIdeasSchema); 