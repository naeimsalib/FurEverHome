const express = require('express');
const router = express.Router();
const Pet = require('../models/pet');
const AdoptionRequest = require('../models/adoptionRequest');
const ensureSignedIn = require('../middleware/ensure-signed-in');

// POST /pets/:id/adopt - Create an adoption request
router.post('/pets/:id/adopt', ensureSignedIn, async (req, res) => {
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

// GET /adoption-requests - View adoption requests for the logged-in user
router.get('/', ensureSignedIn, async (req, res) => {
  const adoptionRequests = await AdoptionRequest.find({
    requester: req.user._id,
  }).populate('pet');
  res.render('adoptionRequests/index', {
    title: 'Your Adoption Requests',
    adoptionRequests,
  });
});

// GET /adoption-requests/:id - View a specific adoption request
router.get('/:id', ensureSignedIn, async (req, res) => {
  const adoptionRequest = await AdoptionRequest.findById(
    req.params.id
  ).populate('pet requester');
  if (adoptionRequest.requester.equals(req.user._id)) {
    adoptionRequest.seenByRequester = true;
  }
  if (adoptionRequest.pet.owner.equals(req.user._id)) {
    adoptionRequest.seenByOwner = true;
  }
  await adoptionRequest.save();
  res.render('adoptionRequests/view', {
    title: 'Adoption Request',
    adoptionRequest,
  });
});

// POST /adoption-requests/:id/approve - Approve an adoption request
router.post('/:id/approve', ensureSignedIn, async (req, res) => {
  const adoptionRequest = await AdoptionRequest.findById(
    req.params.id
  ).populate('pet');
  if (adoptionRequest.pet.owner.equals(req.user._id)) {
    adoptionRequest.status = 'Approved';
    adoptionRequest.seenByRequester = false;
    adoptionRequest.seenByOwner = true;
    await adoptionRequest.save();
  }
  res.redirect(`/pets/${adoptionRequest.pet._id}`);
});

// POST /adoption-requests/:id/reject - Reject an adoption request
router.post('/:id/reject', ensureSignedIn, async (req, res) => {
  const adoptionRequest = await AdoptionRequest.findById(
    req.params.id
  ).populate('pet');
  if (adoptionRequest.pet.owner.equals(req.user._id)) {
    adoptionRequest.status = 'Rejected';
    adoptionRequest.seenByRequester = false;
    adoptionRequest.seenByOwner = true;
    await adoptionRequest.save();
  }
  res.redirect(`/pets/${adoptionRequest.pet._id}`);
});

// POST /adoption-requests/:id/update - Update an adoption request status
router.post('/:id/update', ensureSignedIn, async (req, res) => {
  const adoptionRequest = await AdoptionRequest.findById(req.params.id).populate('pet');
  if (adoptionRequest.pet.owner.equals(req.user._id)) {
    adoptionRequest.status = req.body.status;
    adoptionRequest.seenByRequester = false;
    adoptionRequest.seenByOwner = true;
    await adoptionRequest.save();
  }
  res.redirect(`/pets/${adoptionRequest.pet._id}`);
});

module.exports = router;