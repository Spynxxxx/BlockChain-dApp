const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", require("./routes/users"));

app.get("/", (req, res) => {
  res.json({ message: "ShareEthNotes API is running! ✅" });
});

const URI = process.env.MONGODB_URI;
console.log("Your URI is:", process.env.MONGODB_URI);
console.log("Connecting to MongoDB...");

mongoose
  .connect(URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
