import { Router } from 'express';
import { cronSecret } from '../config/env.js';
import { scanAndEscalate } from '../services/sla.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import authRoutes from './auth.routes.js';
import complaintRoutes from './complaint.routes.js';
import opsRoutes from './ops.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, service: 'ringfix-api', time: new Date() }));

// Vercel Cron target (node-cron can't run on serverless). Vercel sends
// "Authorization: Bearer <CRON_SECRET>" automatically when CRON_SECRET is set.
router.get(
  '/cron/sla',
  asyncHandler(async (req, res) => {
    if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) throw ApiError.unauthorized();
    res.json({ success: true, data: await scanAndEscalate() });
  })
);

router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/', opsRoutes);

export default router;
