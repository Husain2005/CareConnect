import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes (assuming they exist or will be created)
import userRoutes from './routes/userRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to CareConnect Appointment Booking API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;
