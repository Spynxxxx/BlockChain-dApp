const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/debug", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//POST /api/users/register
router.post("/register", async (req, res) => {
  const { walletAddress, username, courseCode } = req.body;

  if (!walletAddress || !username || !courseCode) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existing = await User.findOne({ walletAddress });
    if (existing) {
      return res.status(200).json(existing);
    }

    const user = new User({ walletAddress, username, courseCode });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET /api/users/:walletAddress
router.get("/:walletAddress", async (req, res) => {
  try {
    const user = await User.findOne({
      walletAddress: req.params.walletAddress,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
