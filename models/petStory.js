const mongoose = require('mongoose');

const petStorySchema = new mongoose.Schema({
  text: String,
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
});

module.exports = mongoose.model('PetStory', petStorySchema);
