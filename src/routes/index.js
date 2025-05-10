const express = require("express");
const searchController = require("../controllers/searchController");
const appController = require("../controllers/appController");
const analyzeController = require("../controllers/analyzeController");

const router = express.Router();

// Search for apps route
router.get("/search", searchController.searchApps);

// Get app details route
router.get("/app/:appId", appController.getAppDetails);

// Analyze an app idea
router.post("/analyze", analyzeController.analyzeIdea);

module.exports = router;
