const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection - USE YOUR SUCCESSFUL CONNECTION STRING
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sravan:123@cluster0.iskt5ms.mongodb.net/ckhiring?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('✅ MongoDB database connection established successfully');
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
    const jobs = await Job.find().sort({ postedDate: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new job
app.post('/api/jobs', async (req, res) => {
  try {
    const newJob = new Job({
      title: req.body.title,
      location: req.body.location,
      description: req.body.description
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
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
  res.json({ message: 'CK Hiring Solutions Backend API is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
  console.log(`📊 Database: MongoDB Atlas`);
  console.log(`🔗 API: http://localhost:${PORT}/api/jobs`);
});