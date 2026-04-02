const jwt = require('jsonwebtoken');
const rateLimit = require("express-rate-limit");
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


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts

  standardHeaders: true,
  legacyHeaders: false,
 // When the limit is exceeded, log the event and respond with a 429 status code and a message indicating that there have been too many login attempts, advising the user to try again later. This helps to mitigate brute-force attacks by limiting the number of login attempts from a single IP address within a specified time frame.
  handler: (req, res) => {

    logSecurityEvent(
      "Brute force login attempt detected",
      null,
      req.ip
    );

    res.status(429).json({
      message: "Too many login attempts. Try again later."
    });

  }
});



module.exports = {authenticate, authorize, loginLimiter}; // Export the middleware functions so they can be imported and used in the routes (src/routes/auth.routes.js) to protect specific routes and apply rate limiting to the login route.