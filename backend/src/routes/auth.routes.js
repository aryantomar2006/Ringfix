import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller.js';
import validate from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import * as v from '../validators/auth.validator.js';

const router = Router();

router.post('/register', validate(v.register), ctrl.register);
router.post('/verify-otp', validate(v.verifyOtp), ctrl.verifyOtp);
router.post('/resend-otp', validate(v.resendOtp), ctrl.resendOtp);
router.post('/login', validate(v.login), ctrl.login);
router.get('/me', protect, ctrl.me);

export default router;
