const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// Connect DB
connectDB();

// ✅ CORS - explicit origins, no wildcard with credentials
const allowedOrigins = [
  'https://profound-gratitude-production-8e76.up.railway.app',
  'http://localhost:3000',
  'http://localhost:4200',
  'http://localhost:5173',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Handle preflight for all routes
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/answers',   require('./routes/answerRoutes'));
app.use('/api/votes',     require('./routes/voteRoutes'));
app.use('/api/comments',  require('./routes/commentRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Campus Doubt API running' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
