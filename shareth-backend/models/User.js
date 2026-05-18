const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  walletAddress: {
    type:     String,
    required: true,
    unique:   true,
    trim:     true,
  },
  username: {
    type:     String,
    required: true,
    trim:     true,
  },
  courseCode: {
    type:     String,
    required: true,
    enum:     ["CIT-CS", "CIT-CE", "CIT-IT", "CIT-NURSING"],
  },
  createdAt: {
    type:    Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
