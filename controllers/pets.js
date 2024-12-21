const express = require('express');
const router = express.Router();
const Pet = require('../models/pet');
const ensureSignedIn = require('../middleware/ensure-signed-in');

// GET /pets (index functionality) - show all pets
router.get('/', ensureSignedIn, async (req, res) => {
  const pets = await Pet.find().populate('owner');
  res.render('pets/index', { title: 'Pets Available For Adoption', pets });
});

// GET /pets/new (new functionality) - show form to add a new pet
router.get('/new', ensureSignedIn, (req, res) => {
  res.render('pets/new', { title: 'Add a New Pet' });
});

// GET /yourPets (your pets functionality) - show pets created by the logged-in user
router.get('/yourPets', ensureSignedIn, async (req, res) => {
  const pets = await Pet.find({ owner: req.user._id }).populate('owner');
  res.render('pets/yourPets', { title: 'Your Pets', pets });
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

// GET /pets/:id (show functionality) - show a single pet's profile
router.get('/:id', ensureSignedIn, async (req, res) => {
  const pet = await Pet.findById(req.params.id)
    .populate('owner')
    .populate('comments.author');
  if (!pet) {
    return res.redirect('/pets');
  }
  res.render('pets/show', { title: 'Pet Profile', pet, user: req.user });
});

// GET /pets/:id/edit (edit functionality) - show form to edit a pet
router.get('/:id/edit', ensureSignedIn, async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    return res.redirect('/pets');
  }
  res.render('pets/edit', { title: 'Edit Pet', pet });
});

// PUT /pets/:id (update functionality) - update a pet
router.put('/:id', ensureSignedIn, async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.redirect(`/pets/${pet._id}`);
  } catch (e) {
    console.log(e);
    res.render('pets/edit', {
      title: 'Edit Pet',
      error: e.message,
      pet: req.body,
    });
  }
});

// DELETE /pets/:id (delete functionality) - delete a pet
router.delete('/:id', ensureSignedIn, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (req.user.isAdmin || pet.owner.equals(req.user._id)) {
      await pet.remove();
    }
    res.redirect('/pets');
  } catch (e) {
    console.log(e);
    res.redirect('/pets');
  }
});

module.exports = router;
