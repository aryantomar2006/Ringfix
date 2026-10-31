const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const v = require('../validators/auth.validator');

router.post('/register', validate(v.register), ctrl.register);
router.post('/login', validate(v.login), ctrl.login);
router.get('/me', protect, ctrl.me);

module.exports = router;
