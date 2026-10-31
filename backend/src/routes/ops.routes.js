const router = require('express').Router();
const ctrl = require('../controllers/ops.controller');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const authV = require('../validators/auth.validator');
const complaintV = require('../validators/complaint.validator');
const { ROLES } = require('../config/constants');

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

module.exports = router;
