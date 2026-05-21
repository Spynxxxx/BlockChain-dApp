const mongoose = require("mongoose");

const savedNoteSchema = new mongoose.Schema({
  walletAddress: {
    type:     String,
    required: true,
  },
  ipfsHash: {
    type:     String,
    required: true,
  },
  title: {
    type: String,
    default: "Untitled",
  },
  subject: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  uploader: {
    type: String,
    default: "Anonymous",
  },
  fileType: {
    type: String,
    default: "",
  },
  courseCode: {
    type: String,
    default: "",
  },
  savedAt: {
    type:    Date,
    default: Date.now,
  },
});

// prevent duplicate saves — one user can only save a file once
savedNoteSchema.index({ walletAddress: 1, ipfsHash: 1 }, { unique: true });

module.exports = mongoose.model("SavedNote", savedNoteSchema);
