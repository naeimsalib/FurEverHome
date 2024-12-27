const express = require('express');
const router = express.Router();
const Pet = require('../models/pet');
const Comment = require('../models/comment'); // Ensure Comment model is imported
const ensureSignedIn = require('../middleware/ensure-signed-in');

module.exports = router;
