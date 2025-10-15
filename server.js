const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://sravan:123@cluster0.iskt5ms.mongodb.net/ckhiring?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Job Schema
const jobSchema = new mongoose.Schema({
  title: String,
  location: String,
  description: String,
  postedDate: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', jobSchema);

// Routes

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedDate: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new job
app.post('/api/jobs', async (req, res) => {
  try {
    const newJob = new Job(req.body);
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE job - FIXED VERSION
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    console.log('Deleting job:', jobId);

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    const deletedJob = await Job.findByIdAndDelete(jobId);
    
    if (!deletedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'CK Hiring Solutions API',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    status: 'Running'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});