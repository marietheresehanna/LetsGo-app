const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  username: String,
  comment: String,
  rating: Number,
  pointsMultiplier: {
    type: Number,
    default: 1, // 1x points by default
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: String, // image URL
  rating: {
    type: Number,
    default: 0,
  },
  location: String, // for now, a string like "Beirut, Lebanon"
  type: [String], // ['cafe', 'restaurant', 'pub']
  tags: [String], // ['romantic', 'indoor', 'outdoor', etc.]
  reviews: [reviewSchema],
});

module.exports = mongoose.model('Place', placeSchema);
