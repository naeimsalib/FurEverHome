const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const petSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  breed: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
  },
  vaccination: {
    type: String,
  },
  imageUrls: [String], // Update to support multiple image URLs
  location: {
    type: String,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  story: {
    type: Schema.Types.ObjectId,
    ref: 'PetStory',
  },
});

petSchema.index({ name: 'text', breed: 'text', type: 'text' });

module.exports = mongoose.model('Pet', petSchema);
