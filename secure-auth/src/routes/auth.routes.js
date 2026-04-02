const express = require('express');
const router = express.Router();
const {authenticate,authorize,loginLimiter} = require("../middleware/auth.middleware");
const {signup, login, profile, adminDashboard, teamPanel, userPanel, refresh, logout} = require('../controllers/auth.controller');


router.post("/signup",signup);
router.post("/login",loginLimiter,login);
router.get("/profile",authenticate,profile);
router.get("/adminDashboard",authenticate,authorize('admin'),adminDashboard);
router.get("/teamPanel",authenticate,authorize('teamlead','admin'),teamPanel);
router.get("/userPanel",authenticate,authorize('user','teamlead','admin'),userPanel);
router.post("/refresh",refresh);
router.post("/logout",logout);

module.exports = router; // Export the router so it can be imported and used in the main application file (src/app.js) to handle authentication-related routes.