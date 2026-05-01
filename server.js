require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');

const app = express();

// Ensure uploads folder exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Serve uploaded CVs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/register', require('./routes/register'));
app.use('/api/track',    require('./routes/track'));
app.use('/api/admin',    require('./routes/admin'));

// Serve frontend static files
const staticFiles = [
  'index.html', 'admin.html',
  'style.css', 'admin.css',
  'script.js', 'admin.js', 'config.js'
];

staticFiles.forEach(file => {
  app.get(`/${file}`, (req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
});

// Serve main frontend pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Redirect any other unknown routes to index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
// Connect MongoDB then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(process.env.PORT || 3000, () => {
      console.log(`🚀  Server running → http://localhost:${process.env.PORT || 3000}`);
      console.log(`📋  Batch size     → ${process.env.BATCH_SIZE || 20} applicants per batch`);
    });
  })
  .catch(err => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });
