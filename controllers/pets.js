const express = require('express');
const router = express.Router();
const Pet = require('../models/pet');
const ensureSignedIn = require('../middleware/ensure-signed-in');

// GET /pets (index functionality) - show all pets
router.get('/', ensureSignedIn, async (req, res) => {
  const pets = await Pet.find().populate('owner');
  res.render('pets/index', { title: 'All Pets', pets });
});

// GET /pets/new (new functionality) - show form to add a new pet
router.get('/new', ensureSignedIn, (req, res) => {
  res.render('pets/new', { title: 'Add a New Pet' });
});

// POST /pets (create functionality) - add a new pet
router.post('/', ensureSignedIn, async (req, res) => {
  try {
    const pet = new Pet({
      ...req.body,
      owner: req.user._id,
    });
    await pet.save();
    res.redirect('/pets');
  } catch (e) {
    console.log(e);
    res.render('pets/new', { title: 'Add a New Pet', error: e.message });
  }
});

module.exports = router;
