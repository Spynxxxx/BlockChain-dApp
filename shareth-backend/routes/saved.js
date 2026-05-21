const express   = require("express");
const router    = express.Router();
const SavedNote = require("../models/SavedNote");

// ── GET /api/saved/:walletAddress ────────────────────────────
// Get all saved notes for a user
router.get("/:walletAddress", async (req, res) => {
  try {
    const notes = await SavedNote.find({
      walletAddress: req.params.walletAddress,
    }).sort({ savedAt: -1 }); // newest first
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/saved ──────────────────────────────────────────
// Save a note (favorite it)
router.post("/", async (req, res) => {
  const { walletAddress, ipfsHash, title, subject, description, uploader, fileType, courseCode } = req.body;

  if (!walletAddress || !ipfsHash) {
    return res.status(400).json({ message: "walletAddress and ipfsHash are required." });
  }

  try {
    const note = new SavedNote({
      walletAddress,
      ipfsHash,
      title,
      subject,
      description,
      uploader,
      fileType,
      courseCode,
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    // duplicate key error — already saved
    if (err.code === 11000) {
      return res.status(400).json({ message: "Already saved." });
    }
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/saved ────────────────────────────────────────
// Unsave a note (unfavorite it)
router.delete("/", async (req, res) => {
  const { walletAddress, ipfsHash } = req.body;

  if (!walletAddress || !ipfsHash) {
    return res.status(400).json({ message: "walletAddress and ipfsHash are required." });
  }

  try {
    await SavedNote.deleteOne({ walletAddress, ipfsHash });
    res.json({ message: "Note unsaved." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/saved/check/:walletAddress/:ipfsHash ────────────
// Check if a specific note is saved by a user
router.get("/check/:walletAddress/:ipfsHash", async (req, res) => {
  try {
    const note = await SavedNote.findOne({
      walletAddress: req.params.walletAddress,
      ipfsHash:      req.params.ipfsHash,
    });
    res.json({ saved: !!note });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
