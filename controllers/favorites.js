const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Pet = require('../models/pet');
const ensureSignedIn = require('../middleware/ensure-signed-in');

// GET /favorites - Show user's favorite pets
router.get('/', ensureSignedIn, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  const totalPets = await Pet.countDocuments({
    _id: { $in: req.user.favorites },
  });
  const pets = await Pet.find({ _id: { $in: req.user.favorites } })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalPets / limit);

  res.render('favorites/index', {
    title: 'Favorites',
    pets,
    user: req.user,
    currentPage: page,
    totalPages,
  });
});

// POST /favorites/:petId - Add a pet to favorites
router.post('/:petId', ensureSignedIn, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.favorites.includes(req.params.petId)) {
    user.favorites.push(req.params.petId);
    await user.save();
  }
  res.redirect(`/pets/${req.params.petId}`);
});

// DELETE /favorites/:petId - Remove a pet from favorites
router.delete('/:petId', ensureSignedIn, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.favorites = user.favorites.filter(
    (fav) => !fav.equals(req.params.petId)
  );
  await user.save();
  res.redirect('/favorites');
});

module.exports = router;
