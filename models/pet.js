const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  breed: { type: String, required: true },
  type: { type: String, required: true },
  age: { type: String, required: true }, // Change age to String
  vaccination: { type: String, required: true },
  imageUrls: [String],
  location: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;
