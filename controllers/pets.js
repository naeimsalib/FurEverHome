const express = require('express');
const router = express.Router();

// Middleware to protect selected routes
const ensureSignedIn = require('../middleware/ensure-signed-in');

// All routes start with '/pets'

// GET /pets (index functionality) UN-PROTECTED - all users can access
router.get('/', (req, res) => {
  res.render('pets/index.ejs', { title: 'Pets Page' });
});

// GET /pets/new (new functionality) PROTECTED - only signed in users can access
router.get('/new', ensureSignedIn, (req, res) => {
  res.send('Add a Pet!');
});

module.exports = router;
