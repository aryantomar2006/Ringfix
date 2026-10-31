import { Router } from 'express';
import * as ctrl from '../controllers/complaint.controller.js';
import validate from '../middleware/validate.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { uploadMedia } from '../middleware/upload.js';
import * as v from '../validators/complaint.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(validate(v.list, 'query'), ctrl.list)
  .post(restrictTo(ROLES.CITIZEN), uploadMedia, validate(v.create), ctrl.create);

router.get('/:id', ctrl.getOne);
router.patch('/:id/status', restrictTo(ROLES.STAFF, ROLES.ADMIN), validate(v.updateStatus), ctrl.updateStatus);
router.patch('/:id/assign', restrictTo(ROLES.STAFF, ROLES.ADMIN), validate(v.assign), ctrl.assign);

export default router;
