const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/send-otp', authController.sendOTP);
router.post('/register', authController.register);

module.exports = router;
