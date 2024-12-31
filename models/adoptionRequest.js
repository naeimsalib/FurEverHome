const mongoose = require('mongoose');

const adoptionRequestSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Available'],
    default: 'Pending',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AdoptionRequest', adoptionRequestSchema);
