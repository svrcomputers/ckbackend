const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware with CORS fix
app.use(cors({
  origin: ['https://ckhiringsol.netlify.app', 'http://localhost:3000', 'https://ckhiringsol.onrender.com'],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection - FIXED
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sravan:123@cluster0.iskt5ms.mongodb.net/ckhiring?retryWrites=true&w=majority';

console.log('🔗 Attempting MongoDB connection to:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  retryWrites: true
}).then(() => {
  console.log('✅ MongoDB database connection established successfully');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Job Schema
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  postedDate: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', jobSchema);

// Routes

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    console.log('📋 Fetching jobs from database...');
    const jobs = await Job.find().sort({ postedDate: -1 });
    console.log(`✅ Found ${jobs.length} jobs`);
    res.json(jobs);
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new job
app.post('/api/jobs', async (req, res) => {
  try {
    console.log('📝 Creating new job:', req.body);
    const newJob = new Job({
      title: req.body.title,
      location: req.body.location,
      description: req.body.description
    });

    const savedJob = await newJob.save();
    console.log('✅ Job created successfully:', savedJob._id);
    res.status(201).json(savedJob);
  } catch (error) {
    console.error('❌ Error creating job:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete job
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Root route
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({ 
    message: 'CK Hiring Solutions Backend API is running!',
    database: dbStatus,
    status: 'Active',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({ 
    status: 'OK',
    database: dbStatus,
    readyState: mongoose.connection.readyState,
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const jobCount = await Job.countDocuments();
    res.json({ 
      database: 'Connected ✅',
      jobCount: jobCount,
      readyState: mongoose.connection.readyState,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      database: 'Error ❌',
      error: error.message,
      readyState: mongoose.connection.readyState
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
  console.log(`📊 Database status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  console.log(`🔗 API: https://ckhiringsol.onrender.com/api/jobs`);
  console.log(`❤️  Health: https://ckhiringsol.onrender.com/health`);
  console.log(`🛠️  Test DB: https://ckhiringsol.onrender.com/test-db`);
});