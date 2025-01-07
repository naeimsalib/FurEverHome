const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Pet = require('../models/pet');
const Comment = require('../models/comment');
const bcrypt = require('bcrypt');
const ensureSignedIn = require('../middleware/ensure-signed-in');

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation regex
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/;

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
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.redirect('/error');
    }

    // Delete all pets related to the user
    await Pet.deleteMany({ owner: user._id });

    // Delete all comments related to the user
    await Comment.deleteMany({ user: user._id });

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.redirect('/users');
  } catch (err) {
    console.error(err);
    res.redirect('/error');
  }
});

// GET /users/edit - Show form to edit user information
router.get('/edit', ensureSignedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.render('users/edit', { title: 'Edit Profile', user, error: null });
  } catch (err) {
    console.error(err);
    res.redirect('/error');
  }
});

// POST /users/edit - Update user information
router.post('/edit', ensureSignedIn, async (req, res) => {
  const { name, email, password, 'confirm-password': confirmPassword } = req.body;

  // Validate email
  if (!emailRegex.test(email)) {
    return res.render('users/edit', {
      title: 'Edit Profile',
      user: req.user,
      error: 'Invalid email format',
    });
  }

  // Validate password if provided
  if (password && !passwordRegex.test(password)) {
    return res.render('users/edit', {
      title: 'Edit Profile',
      user: req.user,
      error: 'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character',
    });
  }

  if (password && password !== confirmPassword) {
    return res.render('users/edit', {
      title: 'Edit Profile',
      user: req.user,
      error: 'Passwords do not match',
    });
  }

  try {
    const user = await User.findById(req.user._id);
    user.name = name;
    user.email = email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.redirect('/');
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error
      return res.render('users/edit', {
        title: 'Edit Profile',
        user: req.user,
        error: 'Email already exists',
      });
    }
    console.error(err);
    res.redirect('/error');
  }
});

// GET /users/:id/edit - Show form to edit user information (admin only)
router.get('/:id/edit', ensureSignedIn, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect('/');
  }
  try {
    const user = await User.findById(req.params.id);
    res.render('users/admin-edit', { title: 'Edit User', user, error: null });
  } catch (err) {
    console.error(err);
    res.redirect('/error');
  }
});

// POST /users/:id/edit - Update user information (admin only)
router.post('/:id/edit', ensureSignedIn, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.redirect('/');
  }
  try {
    const user = await User.findById(req.params.id);
    user.name = req.body.name;
    user.email = req.body.email;

    if (req.body.password) {
      if (req.body.password !== req.body['confirm-password']) {
        return res.render('users/admin-edit', {
          title: 'Edit User',
          user,
          error: 'Passwords do not match',
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();
    res.redirect('/users');
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error
      return res.render('users/admin-edit', {
        title: 'Edit User',
        user,
        error: 'Email already exists',
      });
    }
    console.error(err);
    res.redirect('/error');
  }
});

module.exports = router;