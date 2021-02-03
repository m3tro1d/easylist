const jwt = require('jsonwebtoken');

// Authorization middleware
module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) { // Check if token is present
    sendJsonResponse(res, 401, {
      message: 'No token, authorization denied'
    });
  } else { // Proceed and decode the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch(e) {
      sendJsonResponse(res, 400, {
        message: 'Token is invalid'
      });
    }
  }
}


// Some useful functions
// Ends res with given status and json content
function sendJsonResponse(res, status, content) {
  res.status(status).json(content);
}
