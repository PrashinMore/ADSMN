const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';
console.log('JWT Secret available:', SECRET_KEY);

exports.encryptUserId = (userId) => {
  console.log('Encrypting userId:', userId, 'Type:', typeof userId);
  
  try {
    const id = Number(userId);
    console.log('Converted userId:', id, 'Type:', typeof id);
    
    if (isNaN(id)) {
      throw new Error('Invalid user ID - not a number');
    }
    
    const payload = { userId: id };
    console.log('JWT payload:', payload);
    
    const token = jwt.sign(
      payload,
      SECRET_KEY,
      { expiresIn: '30d' }
    );
    
    console.log('Token generated successfully');
    return token;
  } catch (error) {
    console.error('Error in encryptUserId:', error);
    throw error;
  }
};

exports.decryptUserId = (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded.userId;
  } catch (err) {
    console.error('Error in decryptUserId:', err);
    throw new Error('Invalid token');
  }
};