const express = require('express');
const router = express.Router();
const User = require('../models/user');
const ensureSignedIn = require('../middleware/ensure-signed-in');

// GET /users - List all users (admin only)
router.get('/', ensureSignedIn, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect('/');
  }
  const users = await User.find({ _id: { $ne: req.user._id } });
  res.render('users/index', { title: 'All Users', users });
});

// DELETE /users/:id - Delete a user (admin only)
router.delete('/:id', ensureSignedIn, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect('/');
  }
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/users');
});

module.exports = router;
