const jwt = require('jsonwebtoken');
require('dotenv').config();
const  logSecurityEvent  = require("../utils/securityLogger"); // Import the logSecurityEvent function from src/utils/logger.js to log security-related events such as unauthorized access attempts, which can help in monitoring and auditing security incidents in the application.
const authenticate = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, process.env.secret_key); //note: use only jwt.verify() to verify the token and decode its payload. Do not use jwt.decode() as it does not verify the token's signature and can be easily tampered with.
    req.user = decoded;

    next();

  } catch (error) {

  logSecurityEvent(
    "Invalid JWT token detected",
    null,
    req.ip
  );

  return res.status(401).json({
    message: "Invalid or expired token"
  });

}

};

const authorize = (...allowedRoles) => {
  return (req,res,next) => {

    if (!allowedRoles.includes(req.user.role)) {
      //log the unauthorized access attempt with details such as the attempted URL, user ID (if available), and IP address to help identify potential security threats and monitor for suspicious activity in the application.
      logSecurityEvent(
      `Unauthorized access attempt to ${req.originalUrl}`,
       req.user.userId,
       req.ip
      );
      return res.status(403).json({
        message: "Access denied"
      });
    }

    next();
  };
};






module.exports = {authenticate, authorize}; // Export the middleware functions so they can be imported and used in the routes (src/routes/auth.routes.js) to protect specific routes and apply rate limiting to the login route.