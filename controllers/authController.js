const moment = require('moment');
const { User } = require('../models');
const { encryptUserId } = require('../utils/encryption');

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
    const otpExpiry = moment().add(1, 'minute').toDate();

    let user = await User.findOne({ where: { phone: mobile } });

    if (user) {
      await user.update({
        otp,
        otpExpiry
      });
    } else {
      user = await User.build({
        phone: mobile,
        otp,
        otpExpiry,
        name: '',
        email: '',
        dob: new Date()
      });
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
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

    // Validate phone number (basic 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Must be 10 digits.'
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format.'
      });
    }

    // Validate Date of Birth (DOB)
    const dobDate = moment(dob, 'YYYY-MM-DD', true);
    if (!dobDate.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date of birth format. Use YYYY-MM-DD.'
      });
    }

    if (dobDate.isAfter(moment())) {
      return res.status(400).json({
        success: false,
        message: 'Date of birth cannot be a future date.'
      });
    }

    const user = await User.findOne({ where: { phone } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please send OTP first.'
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (moment().isAfter(user.otpExpiry)) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new OTP.'
      });
    }

    const isNewRegistration = !user.name;

    if (!isNewRegistration) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered'
      });
    }

    await user.update({
      name,
      dob: dobDate.toDate(),
      email,
      otp: null,
      otpExpiry: null
    });

    const encryptedUserId = encryptUserId(user.id);

    return res.status(200).json({
      success: true,
      message: 'Registration successful',
      userId: encryptedUserId
    });
  } catch (error) {
    next(error);
  }
};