const express = require('express');
const router = express.Router();
const Pet = require('../models/pet');
const ensureSignedIn = require('../middleware/ensure-signed-in');

// POST /pets/:id/comments - Add a comment to a pet
router.post('/:id/comments', ensureSignedIn, async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  pet.comments.push({
    text: req.body.text,
    author: req.user._id,
  });
  await pet.save();
  res.redirect(`/pets/${req.params.id}`);
});

// GET /pets/:id/comments/:commentId/edit - Show form to edit a comment
router.get(
  '/:id/comments/:commentId/edit',
  ensureSignedIn,
  async (req, res) => {
    const pet = await Pet.findById(req.params.id);
    const comment = pet.comments.id(req.params.commentId);
    if (!comment.author.equals(req.user._id)) {
      return res.redirect(`/pets/${req.params.id}`);
    }
    res.render('comments/edit', { title: 'Edit Comment', pet, comment });
  }
);

// PUT /pets/:id/comments/:commentId - Update a comment
router.put('/:id/comments/:commentId', ensureSignedIn, async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  const comment = pet.comments.id(req.params.commentId);
  if (!comment.author.equals(req.user._id)) {
    return res.redirect(`/pets/${req.params.id}`);
  }
  comment.text = req.body.text;
  await pet.save();
  res.redirect(`/pets/${req.params.id}`);
});

// DELETE /pets/:id/comments/:commentId - Delete a comment
router.delete('/:id/comments/:commentId', ensureSignedIn, async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  const comment = pet.comments.id(req.params.commentId);
  if (
    comment.author.equals(req.user._id) ||
    pet.owner.equals(req.user._id) ||
    req.user.isAdmin
  ) {
    pet.comments.pull(comment._id);
    await pet.save();
  }
  res.redirect(`/pets/${req.params.id}`);
});

module.exports = router;
