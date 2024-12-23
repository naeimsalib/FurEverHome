const express = require('express');
const router = express.Router();
const Pet = require('../models/pet');
const PetStory = require('../models/petStory'); // Ensure PetStory model is imported
const ensureSignedIn = require('../middleware/ensure-signed-in');

// GET /pets/new (new functionality) - show form to add a new pet
router.get('/new', ensureSignedIn, (req, res) => {
  res.render('pets/new', { title: 'Add a New Pet' });
});

// GET /pets/yourPets (your pets functionality) - show pets created by the logged-in user
router.get('/yourPets', ensureSignedIn, async (req, res) => {
  const pets = await Pet.find({ owner: req.user._id }).populate('owner');
  res.render('pets/yourPets', { title: 'Your Pets', pets });
});

// GET /pets/:id (show functionality) - show a single pet's profile
router.get('/:id', ensureSignedIn, async (req, res) => {
  const pet = await Pet.findById(req.params.id)
    .populate('owner')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        model: 'User',
      },
    })
    .populate('story');
  if (!pet) {
    return res.redirect('/pets');
  }
  res.render('pets/show', { title: 'Pet Profile', pet, user: req.user });
});

// POST /pets/:id/story - Add a story to a pet
router.post('/:id/story', ensureSignedIn, async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    return res.redirect('/pets');
  }
  const story = new PetStory({
    text: req.body.text,
    pet: pet._id,
  });
  await story.save();
  pet.story = story._id;
  await pet.save();
  res.redirect(`/pets/${req.params.id}`);
});

// GET /pets/:id/story/edit - Show form to edit a pet story
router.get('/:id/story/edit', ensureSignedIn, async (req, res) => {
  const pet = await Pet.findById(req.params.id).populate('story');
  if (
    !pet ||
    !pet.story ||
    (!req.user._id.equals(pet.owner._id) && !req.user.isAdmin)
  ) {
    return res.redirect(`/pets/${req.params.id}`);
  }
  res.render('pets/editStory', { title: 'Edit Pet Story', pet });
});

// PUT /pets/:id/story - Update a pet story
router.put('/:id/story', ensureSignedIn, async (req, res) => {
  const pet = await Pet.findById(req.params.id).populate('story');
  if (
    !pet ||
    !pet.story ||
    (!req.user._id.equals(pet.owner._id) && !req.user.isAdmin)
  ) {
    return res.redirect(`/pets/${req.params.id}`);
  }
  pet.story.text = req.body.text;
  await pet.story.save();
  res.redirect(`/pets/${req.params.id}`);
});

// DELETE /pets/:id/story - Delete a pet story
router.delete('/:id/story', ensureSignedIn, async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (
    !pet ||
    !pet.story ||
    (!req.user._id.equals(pet.owner._id) && !req.user.isAdmin)
  ) {
    return res.redirect(`/pets/${req.params.id}`);
  }
  await PetStory.findByIdAndDelete(pet.story);
  pet.story = null;
  await pet.save();
  res.redirect(`/pets/${req.params.id}`);
});

module.exports = router;
