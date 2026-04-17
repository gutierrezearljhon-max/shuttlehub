const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "shuttlehub_db"
});

// Routes
app.get('/', (req,res) =>{
    res.send("API running...")
})
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tournaments', require('./routes/tournamentRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/courts', require('./routes/courtRoutes'));
app.use('/api/queue', require('./routes/queueRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Socket.io for real-time queue updates
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('join-queue', (data) => {
    socket.join(`queue-${data.courtId}`);
  });
  
  socket.on('queue-update', (data) => {
    io.to(`queue-${data.courtId}`).emit('queue-updated', data);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));