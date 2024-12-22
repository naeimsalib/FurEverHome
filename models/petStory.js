const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const petStorySchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  pet: {
    type: Schema.Types.ObjectId,
    ref: 'Pet',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PetStory', petStorySchema);
