import mongoose, { Schema } from 'mongoose';

// Student Schema
const studentSchema = new Schema(
  {
    studentId: {
      type: String,
      required: true
    },
    option: {
      type: String,
      enum: ['Set this experiment aside.', 'Compromise option 1.', 'Compromise option 2.', 'Other.'],
      required: false
    },
    response: {
      type: String,
      required: false
    },
    withinTimer: {
      type: Boolean,
      default: true
    },
    limitExplanation: {
      type: String,
      required: false
    },
    // Object that can contain any number of dynamic fields like limitExplanation1, limitExplanation2, etc.
    limitExplanations: {
      type: Schema.Types.Mixed,
      default: {}
    },
    customOption: {
      type: String,
      required: false // Only populated when option is "Other."
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

// Session Schema (main document)
const sessionSchema = new Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  sessionType: {
    type: String,
    enum: ['individual', 'group'],
    required: true
  },
  students: [studentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
sessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create model or use existing one
const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

export default Session;