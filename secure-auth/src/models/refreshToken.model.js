const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Use ObjectId to reference the User model
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800   // Set the document to expire after 7 days
  }
});

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);