const { decryptUserId } = require('../utils/encryption');
const { User } = require('../models');

exports.authenticateUser = async (req, res, next) => {
  try {
    const userId = req.body?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID is required'
      });
    }

    try {
      const decryptedUserId = decryptUserId(userId);
      
      const user = await User.findByPk(decryptedUserId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.log("File: middleware/auth.js, Func: authenticateUser. Error: ", error);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
  } catch (error) {
    next(error);
  }
};
