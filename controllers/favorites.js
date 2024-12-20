const express = require('express');
const router = express.Router();
const ensureSignedIn = require('../middleware/ensure-signed-in');

// GET /favorites (index functionality) - show all favorite pets
router.get('/', ensureSignedIn, (req, res) => {
  // Assuming you have a way to get favorite pets
  res.render('favorites/index', { title: 'Favorite Pets' });
});

module.exports = router;
