const express   = require('express');
const cors      = require('cors');
const dotenv    = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const app = express();
connectDB();

// CORS — allow localhost for dev and Railway URLs for production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4200',
  'http://localhost:5173',
];

// Add production URLs from env if set
if (process.env.FRONTEND_URL)  allowedOrigins.push(process.env.FRONTEND_URL);
if (process.env.ADMIN_URL)     allowedOrigins.push(process.env.ADMIN_URL);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/answers',   require('./routes/answerRoutes'));
app.use('/api/votes',     require('./routes/voteRoutes'));
app.use('/api/comments',  require('./routes/commentRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));

app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', message: 'Sharez API running' })
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
