const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: String,
  breed: String,
  type: String,
  age: String,
  vaccination: String,
  imageUrls: [String],
  location: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  adoptionRequests: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'AdoptionRequest' },
  ],
  story: { type: mongoose.Schema.Types.ObjectId, ref: 'PetStory' },
});

module.exports = mongoose.model('Pet', petSchema);
