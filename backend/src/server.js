const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: '../.env' });

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
// Update server.js to include WebSocket
const http = require('http');

const server = http.createServer(app);

const Websocket = require('./websocket');
const wssInstance = new Websocket(server);

// Store WebSocket server instance globally
global.wss = wssInstance;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX // limit each IP to 100 requests per windowMs
});

// Apply rate limiter to all routes
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
console.log('Database URL:', process.env.DB_USER);