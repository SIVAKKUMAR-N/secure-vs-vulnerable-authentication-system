const express = require('express');
const app = express();
const authRoutes = require('./routes/auth.routes'); // Import the authentication routes from src/routes/auth.routes.js, which contains the route definitions for user signup and login.
const cookieParser = require('cookie-parser'); // Import the cookie-parser middleware to parse cookies from incoming requests, allowing us to handle refresh tokens stored in cookies for authentication purposes.



//middleware
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',authRoutes);// Use the authentication routes for any requests that start with /api/auth, allowing us to handle user signup and login functionality defined in auth.routes.js.

module.exports = app;