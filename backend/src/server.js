import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';

import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import homeRoutes from './routes/homeRoutes.js';
import residentRoutes from './routes/residentRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import medicalCampRoutes from './routes/medicalCampRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import homeStatusRoutes from './routes/homeStatusRoutes.js';

import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', (req, res) => {
  res.status(404).json({ success: false, message: 'Upload not found' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SevaSethu API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/homes', homeRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/medical-camps', medicalCampRoutes);
app.use('/api', eventRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/home-status', homeStatusRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  connectDB();
  app.listen(PORT, () => console.log(`SevaSethu server running on port ${PORT}`));
};

startServer();

export default app;
