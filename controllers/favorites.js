const express = require('express');
const router = express.Router();

// Middleware to protect selected routes
const ensureSignedIn = require('../middleware/ensure-signed-in');

// All routes start with '/pets'

// GET /pets (index functionality) UN-PROTECTED - all users can access
router.get('/', (req, res) => {
  res.render('favorites/index.ejs', { title: 'Favorites Page' });
});

module.exports = router;
