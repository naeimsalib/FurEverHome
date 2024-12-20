const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

// GET /auth/sign-in - Show sign-in form
router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in', { title: 'Sign In', user: req.user });
});

// POST /auth/sign-in - Handle sign-in
router.post('/sign-in', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.userId = user._id;
    res.redirect('/');
  } else {
    res.render('auth/sign-in', {
      title: 'Sign In',
      error: 'Invalid email or password',
      user: req.user,
    });
  }
});

// GET /auth/sign-up - Show sign-up form
router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up', { title: 'Sign Up', user: req.user });
});

// POST /auth/sign-up - Handle sign-up
router.post('/sign-up', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = new User({ name, email, password: hashedPassword });
  await user.save();
  req.session.userId = user._id;
  res.redirect('/');
});

// GET /auth/sign-out - Handle sign-out
router.get('/sign-out', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
