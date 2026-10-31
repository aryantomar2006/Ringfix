import { Router } from 'express';
import * as ctrl from '../controllers/ops.controller.js';
import validate from '../middleware/validate.js';
import { protect, restrictTo } from '../middleware/auth.js';
import * as authV from '../validators/auth.validator.js';
import * as complaintV from '../validators/complaint.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

// ---- Public (no auth): transparency portal + heatmap
router.get('/public/stats', ctrl.publicStats);
router.get('/public/heatmap', ctrl.heatmap);

// ---- Authenticated
router.use(protect);
router.get('/notifications', ctrl.myNotifications);
router.patch('/notifications/read', ctrl.markNotificationsRead);
router.patch('/notifications/:id/read', ctrl.markNotificationsRead);

// Reports (citizens get only their own complaints; scoped in service)
router.get('/reports/csv', validate(complaintV.list, 'query'), ctrl.exportCsv);
router.get('/reports/pdf', validate(complaintV.list, 'query'), ctrl.exportPdf);

// ---- Staff / admin
router.get('/staff', restrictTo(ROLES.STAFF, ROLES.ADMIN), ctrl.listStaff);
router.get('/analytics/areas', restrictTo(ROLES.STAFF, ROLES.ADMIN), ctrl.areaDensity);

// ---- Admin only
router.post('/staff', restrictTo(ROLES.ADMIN), validate(authV.createStaff), ctrl.createStaff);
router.post('/sla/scan', restrictTo(ROLES.ADMIN), ctrl.runSlaScan);

export default router;
