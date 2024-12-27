const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
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

// GET /users/edit - Show form to edit user information
router.get('/edit', ensureSignedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.render('users/edit', { title: 'Edit Profile', user });
  } catch (err) {
    console.error(err);
    res.redirect('/error');
  }
});

// POST /users/edit - Update user information
router.post('/edit', ensureSignedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.name = req.body.name;
    user.email = req.body.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/error');
  }
});

module.exports = router;