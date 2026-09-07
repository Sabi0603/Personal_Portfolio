import { Router } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();

router.get('/', (req, res) => {
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const status = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    status: 'ok',
    database: dbStatusMap[mongoose.connection.readyState] || 'unknown',
  };

  return sendSuccess(res, 'Server is healthy', status);
});

export default router;
