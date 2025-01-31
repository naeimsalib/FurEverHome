const express = require('express');
const router = express.Router();
const axios = require('axios');
const Pet = require('../models/pet');
const PetStory = require('../models/petStory');
const Comment = require('../models/comment');
const AdoptionRequest = require('../models/adoptionRequest'); // Import the AdoptionRequest model
const ensureSignedIn = require('../middleware/ensure-signed-in');
const multer = require('multer');
const path = require('path');
require('dotenv').config(); // Load environment variables

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// GET /pets/new (new functionality) - show form to add a new pet
router.get('/new', ensureSignedIn, (req, res) => {
  res.render('pets/new', {
    title: 'Add a New Pet',
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    errorMessage: null,
  });
});

// POST /pets - Add a new pet
router.post(
  '/',
  ensureSignedIn,
  upload.array('images', 10),
  async (req, res) => {
    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    const location = req.body.location;

    // Validate location using Google Maps Geocoding API
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      location
    )}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    try {
      const response = await axios.get(geocodeUrl);
      const geocodeData = response.data;

      if (geocodeData.status !== 'OK') {
        return res.render('pets/new', {
          title: 'Add a New Pet',
          googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
          errorMessage: 'Invalid location. Please provide a valid location.',
        });
      }

      const pet = new Pet({
        name: req.body.name,
        breed: req.body.breed,
        type: req.body.type,
        age: req.body.age,
        vaccination: req.body.vaccination,
        imageUrls: imageUrls,
        location: location,
        owner: req.user._id,
      });
      await pet.save();
      res.redirect(`/pets/${pet._id}`);
    } catch (error) {
      console.error('Error validating location:', error);
      res.status(500).send('An error occurred while validating the location.');
    }
  }
);

// POST /pets/:id/images - Add images to an existing pet
router.post(
  '/:id/images',
  ensureSignedIn,
  upload.array('images', 10),
  async (req, res) => {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.redirect('/');
    }
    if (!req.user._id.equals(pet.owner._id) && !req.user.isAdmin) {
      return res.redirect(`/pets/${pet._id}`);
    }
    const newImageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    pet.imageUrls.push(...newImageUrls);
    await pet.save();
    res.redirect(`/pets/${pet._id}`);
  }
);

// GET /pets/yourPets (your pets functionality) - show pets created by the logged-in user
router.get('/yourPets', ensureSignedIn, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  const totalPets = await Pet.countDocuments({ owner: req.user._id });
  const pets = await Pet.find({ owner: req.user._id }).skip(skip).limit(limit);

  const totalPages = Math.ceil(totalPets / limit);

  res.render('pets/yourPets', {
    title: 'Your Pets',
    pets,
    user: req.user,
    currentPage: page,
    totalPages,
  });
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
    .populate('story')
    .populate('adoptionRequests'); // Ensure adoption requests are populated
  if (!pet) {
    return res.redirect('/');
  }
  res.render('pets/show', {
    title: 'Pet Profile',
    pet,
    user: req.user,
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  });
});

// POST /pets/:id/adopt - Create an adoption request
router.post('/:id/adopt', ensureSignedIn, async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  const adoptionRequest = new AdoptionRequest({
    pet: pet._id,
    requester: req.user._id,
    message: req.body.message,
  });
  await adoptionRequest.save();
  pet.adoptionRequests.push(adoptionRequest._id);
  await pet.save();
  res.redirect(`/pets/${pet._id}`);
});

// GET /pets/:id/edit - Show form to edit a pet
router.get('/:id/edit', ensureSignedIn, async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  res.render('pets/edit', {
    title: 'Edit Pet',
    pet,
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    errorMessage: null,
  });
});

// PUT /pets/:id - Update a pet
router.put('/:id', ensureSignedIn, async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet || (!req.user._id.equals(pet.owner._id) && !req.user.isAdmin)) {
    return res.redirect(`/pets/${req.params.id}`);
  }

  const location = req.body.location;

  // Validate location using Google Maps Geocoding API
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    location
  )}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  try {
    const response = await axios.get(geocodeUrl);
    const geocodeData = response.data;

    if (geocodeData.status !== 'OK') {
      return res.render('pets/edit', {
        title: 'Edit Pet',
        pet,
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
        errorMessage: 'Invalid location. Please provide a valid location.',
      });
    }

    pet.name = req.body.name;
    pet.breed = req.body.breed;
    pet.type = req.body.type;
    pet.age = req.body.age;
    pet.vaccination = req.body.vaccination;
    pet.location = location;
    await pet.save();
    res.redirect(`/pets/${pet._id}`);
  } catch (error) {
    console.error('Error validating location:', error);
    res.status(500).send('An error occurred while validating the location.');
  }
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

// DELETE /pets/:id - Delete a pet
router.delete('/:id', ensureSignedIn, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.redirect('/error');
    }

    // Delete all comments related to the pet
    await Comment.deleteMany({ pet: pet._id });

    // Delete the pet
    await Pet.findByIdAndDelete(req.params.id);

    res.redirect('/pets/yourPets');
  } catch (err) {
    res.redirect('/error');
  }
});

// POST /pets/:id/comments - Add a comment to a pet
router.post('/:id/comments', ensureSignedIn, async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  const comment = new Comment({
    text: req.body.text,
    author: req.user._id,
  });
  await comment.save();
  pet.comments.push(comment._id);
  await pet.updateOne({ $push: { comments: comment._id } });
  res.redirect(`/pets/${req.params.id}`);
});

// GET /pets/:id/comments/:commentId/edit - Show form to edit a comment
router.get(
  '/:id/comments/:commentId/edit',
  ensureSignedIn,
  async (req, res) => {
    const pet = await Pet.findById(req.params.id);
    const comment = await Comment.findById(req.params.commentId);
    if (!comment.author.equals(req.user._id)) {
      return res.redirect(`/pets/${req.params.id}`);
    }
    res.render('comments/edit', { title: 'Edit Comment', pet, comment });
  }
);

// PUT /pets/:id/comments/:commentId - Update a comment
router.put('/:id/comments/:commentId', ensureSignedIn, async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment.author.equals(req.user._id)) {
    return res.redirect(`/pets/${req.params.id}`);
  }
  comment.text = req.body.text;
  await comment.save();
  res.redirect(`/pets/${req.params.id}`);
});

// DELETE /pets/:id/comments/:commentId - Delete a comment
router.delete('/:id/comments/:commentId', ensureSignedIn, async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  const comment = await Comment.findById(req.params.commentId);
  if (
    comment.author.equals(req.user._id) ||
    pet.owner.equals(req.user._id) ||
    req.user.isAdmin
  ) {
    await comment.deleteOne();
    await pet.updateOne({ $pull: { comments: comment._id } });
  }
  res.redirect(`/pets/${req.params.id}`);
});

module.exports = router;
