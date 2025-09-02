// Script to identify and remove single-word responses (keysmash) from all sessions
// This script will connect directly to MongoDB and clean up the data

const { MongoClient } = require('mongodb');

// Configuration - adjust as needed
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name';
const DATABASE_NAME = process.env.DATABASE_NAME || 'test'; // Adjust based on your setup
const COLLECTION_NAME = 'sessions';

// Function to check if a response is a single word (likely keysmash)
function isSingleWordResponse(text) {
    if (!text || typeof text !== 'string') return false;
    
    const trimmed = text.trim();
    
    // Check if it's a single word (no spaces)
    const words = trimmed.split(/\s+/).filter(word => word.length > 0);
    
    // Consider it keysmash if:
    // 1. It's a single word AND
    // 2. It's shorter than 4 characters OR has no vowels (common keysmash pattern)
    if (words.length === 1) {
        const word = words[0].toLowerCase();
        const hasVowels = /[aeiou]/.test(word);
        const isVeryShort = word.length < 4;
        const isLikelyKeysmash = !hasVowels || isVeryShort;
        
        return isLikelyKeysmash;
    }
    
    return false;
}

async function cleanupSingleWordResponses() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Connected to MongoDB successfully');
        
        const db = client.db(DATABASE_NAME);
        const collection = db.collection(COLLECTION_NAME);
        
        // Find all sessions
        console.log('Fetching all sessions...');
        const sessions = await collection.find({}).toArray();
        console.log(`Found ${sessions.length} sessions`);
        
        let totalProcessed = 0;
        let totalRemoved = 0;
        let sessionsModified = 0;
        
        for (const session of sessions) {
            let sessionModified = false;
            console.log(`\nProcessing session: ${session.sessionId}`);
            
            if (session.students && Array.isArray(session.students)) {
                console.log(`  - Found ${session.students.length} students`);
                
                const originalCount = session.students.length;
                
                // Filter out students with single-word responses
                session.students = session.students.filter(student => {
                    totalProcessed++;
                    
                    // Check if the response is a single word (keysmash)
                    const hasKeysmashResponse = isSingleWordResponse(student.response);
                    
                    if (hasKeysmashResponse) {
                        console.log(`  - Removing keysmash response: "${student.response}" from student ${student.studentId}`);
                        totalRemoved++;
                        return false; // Remove this student
                    }
                    
                    return true; // Keep this student
                });
                
                const newCount = session.students.length;
                
                if (originalCount !== newCount) {
                    sessionModified = true;
                    console.log(`  - Reduced students from ${originalCount} to ${newCount}`);
                    
                    // Update the session in the database
                    await collection.updateOne(
                        { _id: session._id },
                        { 
                            $set: { 
                                students: session.students,
                                updatedAt: new Date()
                            } 
                        }
                    );
                }
            }
            
            if (sessionModified) {
                sessionsModified++;
            }
        }
        
        console.log('\n=== CLEANUP SUMMARY ===');
        console.log(`Total student entries processed: ${totalProcessed}`);
        console.log(`Single-word responses removed: ${totalRemoved}`);
        console.log(`Sessions modified: ${sessionsModified}`);
        console.log('Cleanup completed successfully!');
        
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
}

// Run the cleanup
if (require.main === module) {
    cleanupSingleWordResponses().catch(console.error);
}

module.exports = { cleanupSingleWordResponses, isSingleWordResponse };