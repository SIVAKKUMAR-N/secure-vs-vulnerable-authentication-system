const fs = require("fs");
const path = require("path");
const winston = require("winston");

// Write logs to the project-level `/logs` folder (not `src/logs`).
const logPath = path.join(__dirname, "../../logs/security.log");
const logDir = path.dirname(logPath);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const securityLogger = winston.createLogger({
  level: "warn",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: logPath
    })
  ]
});

const logSecurityEvent = (event, userId, ip) => {
  securityLogger.warn({
    service: "secure-auth",
    event,
    userId: userId || "unknown",
    ip
  });
};

module.exports = logSecurityEvent;