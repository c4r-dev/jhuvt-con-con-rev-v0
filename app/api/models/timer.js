import mongoose, { Schema } from "mongoose";

const timerSchema = new Schema(
  {
    sessionID: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true,
      validate: {
        validator: function(v) {
          return v !== null && v.trim() !== '';
        },
        message: 'SessionID cannot be null or empty'
      }
    },
    timerStartTime: { 
      type: Date, 
      default: null 
    },
    timerDurationSeconds: { 
      type: Number, 
      default: 90 
    },
    isSummarizing: { type: Boolean, default: false },
    summarizedIdeas: [{ type: String }],
    // You could potentially add other session-specific data here if needed
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Drop any existing incorrect indexes before model creation
// This only runs once during app initialization
mongoose.connection.on('connected', async () => {
  try {
    // Only do this if the collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some(c => c.name === 'sessions');
    
    if (collectionExists) {
      console.log('Checking Session collection indexes...');
      const indexes = await mongoose.connection.db.collection('sessions').indexes();
      
      // Look for indexes with incorrect casing (sessionId vs sessionID)
      const incorrectCaseIndex = indexes.find(idx => 
        idx.key && idx.key.sessionId !== undefined && idx.key.sessionID === undefined
      );
      
      if (incorrectCaseIndex) {
        console.log('Found incorrect case index, dropping...');
        await mongoose.connection.db.collection('sessions').dropIndex(incorrectCaseIndex.name);
        console.log('Index dropped, will be recreated with correct case.');
      }
    }
  } catch (err) {
    console.error('Error checking/fixing Session indexes:', err);
  }
});

// Create and export the Mongoose model
// Checks if the model already exists before creating it to prevent overwrite errors during hot-reloading
export default mongoose.models.Timer || mongoose.model("Timer", timerSchema); 