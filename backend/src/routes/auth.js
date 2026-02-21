const { Router } = require('express');
const { sendOTP, verifyOTP, updateProfile, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
