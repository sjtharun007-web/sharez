const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// Connect DB
connectDB();

// ✅ CORS (correct)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.options("*", cors());

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/answers',   require('./routes/answerRoutes'));
app.use('/api/votes',     require('./routes/voteRoutes'));
app.use('/api/comments',  require('./routes/commentRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

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