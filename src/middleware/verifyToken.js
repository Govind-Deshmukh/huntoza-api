const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Get auth header
  const authHeader = req.headers.authorization;
  
  // Check if auth header exists and has correct format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication invalid'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user to request object
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    return res.status(401).json({
      success: false,
      message: 'Authentication invalid',
      error: error.message
    });
  }
};

module.exports = verifyToken;