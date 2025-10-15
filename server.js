const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://sravan:123@cluster0.iskt5ms.mongodb.net/ckhiring?retryWrites=true&w=majority';

let db = null;
let isConnected = false;

// Connect to MongoDB
async function connectToDatabase() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db('ckhiring');
        isConnected = true;
        console.log('✅ MongoDB Connected Successfully!');
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        isConnected = false;
    }
}

// Initialize connection
connectToDatabase();

// Routes

// Get all jobs
app.get('/api/jobs', async (req, res) => {
    try {
        if (!isConnected) {
            return res.json([]);
        }
        const jobs = await db.collection('jobs').find().sort({ postedDate: -1 }).toArray();
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.json([]);
    }
});

// Create new job
app.post('/api/jobs', async (req, res) => {
    try {
        if (!isConnected) {
            return res.status(500).json({ error: 'Database not connected' });
        }
        
        const jobData = {
            ...req.body,
            postedDate: new Date()
        };
        
        const result = await db.collection('jobs').insertOne(jobData);
        res.status(201).json({ ...jobData, _id: result.insertedId });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete job
// FIXED DELETE Route - Add this to your server.js
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    console.log('🗑️ Attempting to delete job:', jobId);
    
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ Database not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }

    // Use mongoose's built-in ID validation
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      console.log('❌ Invalid job ID format:', jobId);
      return res.status(400).json({ message: 'Invalid job ID format' });
    }

    // Delete the job
    const deletedJob = await Job.findByIdAndDelete(jobId);
    
    if (!deletedJob) {
      console.log('❌ Job not found:', jobId);
      return res.status(404).json({ message: 'Job not found' });
    }
    
    console.log('✅ Job deleted successfully:', jobId);
    res.json({ message: 'Job deleted successfully' });
    
  } catch (error) {
    console.error('❌ Error in DELETE route:', error);
    res.status(500).json({ 
      message: 'Internal server error: ' + error.message 
    });
  }
});

// Test MongoDB connection
app.get('/test-mongo', async (req, res) => {
    try {
        if (isConnected) {
            await db.command({ ping: 1 });
            res.json({ 
                status: 'SUCCESS', 
                message: 'MongoDB is connected and working!',
                database: 'ckhiring'
            });
        } else {
            res.json({ 
                status: 'FAILED', 
                message: 'MongoDB is not connected'
            });
        }
    } catch (error) {
        res.json({ 
            status: 'ERROR', 
            message: 'MongoDB test failed',
            error: error.message
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        database: isConnected ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

// Root
app.get('/', (req, res) => {
    res.json({
        message: 'CK Hiring Solutions API - Updated Version',
        database: isConnected ? 'Connected' : 'Disconnected',
        status: 'Running'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 MongoDB: ${isConnected ? 'Connected' : 'Disconnected'}`);
});