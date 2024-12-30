const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: String,
  breed: String,
  type: String,
  age: Number,
  vaccination: String,
  imageUrls: [String],
  location: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  adoptionRequests: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'AdoptionRequest' },
  ], // New field
});

module.exports = mongoose.model('Pet', petSchema);
