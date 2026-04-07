const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/user'); // Import the User model from src/models/user.js, which defines the schema and methods for interacting with user documents in the MongoDB database.
const RefreshToken = require("../models/refreshToken.model");
const logSecurityEvent  = require("../utils/securityLogger"); // Import the logSecurityEvent function from src/utils/logger.js to log security-related events such as unauthorized access attempts, which can help in monitoring and auditing security incidents in the application.
// The signup function handles user registration by validating the input data, checking for existing users, hashing the password, and creating a new user document in the database. It returns appropriate responses based on the success or failure of the registration process.
const signup = async (req,res) =>{
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password?.trim();
  const role = req.body.role?.trim().toLowerCase() || 'user'; // Default role is 'user' if not provided, and normalize it to lowercase for consistency.

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password required"
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format"
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters"
    });
  }

  try {

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password,12);

    await User.create({
      name,
      email,
      passwordHash,
      role
    });

    return res.status(201).json({
      message: "User created successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// The login function handles user authentication by verifying the provided email and password against the stored user data in the database. It generates a JWT access token and a refresh token upon successful authentication, and sets the refresh token in an HTTP-only cookie for secure storage on the client side.
const login = async (req,res) => {
    const email = req.body.email?.trim();
    const password = req.body.password?.trim();
    // Validate that both email and password are provided in the request body. If either is missing, return a 400 Bad Request response with an appropriate message.
    if (!email || !password) {
    return res.status(400).json({
      message: "Email and password required"
   });
}

//check if email and password are strings to prevent NoSQL injection attacks, where an attacker might try to inject malicious queries by sending non-string values in the email or password fields. By ensuring that both email and password are strings, we can mitigate this type of attack and enhance the security of our authentication system.
if (typeof email !== "string" || typeof password !== "string") {
  return res.status(400).json({ message: "Invalid input" });
}

     // Normalize the email by converting it to lowercase and trimming whitespace, ensuring consistent formatting for database queries and comparisons.
    try{
        const user = await User.findOne({email});
if (!user) {
  logSecurityEvent(
   "Login attempt with non-existing email",
   null,
   req.ip
  );

  return res.status(401).json({
    message: "Invalid credentials"
  });
}
const isMatch = await bcrypt.compare(password, user.passwordHash);

if (!isMatch) {

  logSecurityEvent(
    "Wrong password attempt",
    user._id,
    req.ip
  );

  return res.status(401).json({
    message: "Invalid credentials"
  });
}
        const accesstoken = jwt.sign({userId : user._id,  role: user.role},process.env.secret_key,{expiresIn:"15m"});  //jwt.sign(payload, secret, options)

        const refreshToken = jwt.sign({userId : user._id},process.env.refresh_secret_key,{expiresIn:"7d"});

        // Store the refresh token in the database with a reference to the user and an expiration time, allowing us to manage and invalidate refresh tokens as needed for security purposes.
        await RefreshToken.create({
        token: refreshToken,
        userId: user._id
      });

        // Set the refresh token in an HTTP-only cookie to enhance security by preventing client-side scripts from accessing it, and configure the cookie with appropriate options for security and cross-site request handling.
        res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, // Set to true in production to ensure cookies are only sent over HTTPS connections, enhancing security by preventing token interception over unsecured connections.
        sameSite: "strict"
       });
        res.json({accesstoken});    
    }catch(error){
        res.status(500).json({message: error.message});
    }
};
const profile = async (req,res) => {
   try{

        const user = await User.findById(req.user.userId).select("-passwordHash");

        res.json({
            message: "This is a protected route",
            user
        });

    }catch(error){
        res.status(500).json({message: error.message});
    }
};
const adminDashboard = async (req,res) => {

  res.json({
    message: "Admin dashboard",
    userId: req.user.userId,
    role: req.user.role
  });

};
const teamPanel = async (req,res) => {

  res.json({
    message: "Team leader panel",
    role: req.user.role
  });

};
 const userPanel = async (req,res) => {
 res.json({
    message: "User panel",
    role: req.user.role
  });
};


// refesh checks the validity of refresh token and checks db for the token, if valid it creates new access token and refresh token and sends to client and also updates db with new refresh token and deletes old one. This ensures that refresh tokens are single-use and can be invalidated if compromised, enhancing the security of the authentication system.
const refresh = async (req, res) => {

  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {

    const decoded = jwt.verify(token, process.env.refresh_secret_key); //do not use jwt.decode() as it does not verify the token's signature and can be easily tampered with. Always use jwt.verify() to ensure the token is valid and has not been altered.

    const storedToken = await RefreshToken.findOne({ token });

    if (!storedToken) {
      return res.status(403).json({ message: "Refresh token reused or invalid" });
    }

    // remove old token
    await RefreshToken.deleteOne({ token });

    // create new refresh token
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId },
      process.env.refresh_secret_key,
      { expiresIn: "7d" }
    );

    await RefreshToken.create({
      token: newRefreshToken,
      userId: decoded.userId
    });

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.secret_key,
      { expiresIn: "15m" }
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: false
    });

    res.json({ accessToken: newAccessToken });

  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

// The logout function handles user logout by deleting the refresh token from the database and clearing the refresh token cookie from the client's browser, effectively invalidating the user's session and preventing further use of the refresh token for obtaining new access tokens.
const logout = async (req,res) => {

  const token = req.cookies.refreshToken;

  if(token){
    await RefreshToken.deleteOne({ token });
  }

  res.clearCookie("refreshToken");

  res.json({message:"Logged out"});
};

module.exports = {signup, login, profile, adminDashboard, teamPanel, userPanel, refresh, logout}; // Export the signup function so it can be imported and used in route definitions, such as in src/routes/auth.routes.js where it is used to handle POST requests to /signup.