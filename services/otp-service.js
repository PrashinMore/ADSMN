const { User } = require('../models');
const { encryptUserId } = require('../utils/encryption');
const { verifyOTP } = require('../services/otp-service');
const moment = require('moment');

exports.sendOTP = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
    }

    const otp = '1234';
    const expiryTime = new Date(Date.now() + 60000);

    const { OTP } = require('../models');
    await OTP.create({
      mobileNo: mobile,
      code: otp,
      expiresAt: expiryTime,
      isUsed: false
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Error in sendOTP:', error);
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { phone, name, dob, email, otp } = req.body;

    if (!phone || !name || !dob || !email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const otpVerification = await verifyOTP(phone, otp);

    if (!otpVerification.valid) {
      return res.status(400).json({
        success: false,
        message: otpVerification.message
      });
    }

    let user = await User.findOne({ where: { phone } });

    const isNewRegistration = !user || !user.name;

    if (!isNewRegistration) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered'
      });
    }

    if (!user) {
      user = await User.create({
        phone,
        name,
        dob: new Date(dob),
        email
      });
    } else {
      await user.update({
        name,
        dob: new Date(dob),
        email
      });
    }

    const userId = user.id;
    const encryptedUserId = await encryptUserId(userId);

    return res.status(200).json({
      success: true,
      message: 'Registration successful',
      userId: encryptedUserId
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};
