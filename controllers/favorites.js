const express = require('express');
const router = express.Router();

// Middleware to protect selected routes
const ensureSignedIn = require('../middleware/ensure-signed-in');

// All routes start with '/pets'

// GET /pets (index functionality) UN-PROTECTED - all users can access
router.get('/', (req, res) => {
  res.send('All Favorite Pets are here!');
});

module.exports = router;
