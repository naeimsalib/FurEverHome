const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const petSchema = new Schema({
  name: {
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
    type: Number,
  },
  imageurl: {
    type: String,
  },
  location: {
    type: String,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Pet', petSchema);
