const jwt = require('jsonwebtoken');

module.exports= (req, res, next) => {
  const token = req.header('x-auth-token');

  // Check if token is present
  if (!token) {
    return res.status(401).end('No token, authorization denied');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch(e) {
    return res.status(400).end('Token is invalid');
  }
}
