const express = require("express");
const router = express.Router();

// Example API routes
router.get("/", (req, res) => {
  res.json({ message: "Welcome to the API!" });
});

router.get("/example", (req, res) => {
  res.json({ message: "This is an example endpoint." });
});

module.exports = router;
