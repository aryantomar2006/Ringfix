const router = require('express').Router();

router.get('/health', (_req, res) => res.json({ success: true, service: 'ringfix-api', time: new Date() }));
router.use('/auth', require('./auth.routes'));
router.use('/complaints', require('./complaint.routes'));
router.use('/', require('./ops.routes'));

module.exports = router;
