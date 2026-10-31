const router = require('express').Router();
const ctrl = require('../controllers/complaint.controller');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadPhotos } = require('../middleware/upload');
const v = require('../validators/complaint.validator');
const { ROLES } = require('../config/constants');

router.use(protect);

router
  .route('/')
  .get(validate(v.list, 'query'), ctrl.list)
  .post(restrictTo(ROLES.CITIZEN), uploadPhotos, validate(v.create), ctrl.create);

router.get('/:id', ctrl.getOne);
router.patch('/:id/status', restrictTo(ROLES.STAFF, ROLES.ADMIN), validate(v.updateStatus), ctrl.updateStatus);
router.patch('/:id/assign', restrictTo(ROLES.STAFF, ROLES.ADMIN), validate(v.assign), ctrl.assign);

module.exports = router;
