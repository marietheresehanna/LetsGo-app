const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: String,
  image: String,
  rating: Number,
  location: String,
});

module.exports = mongoose.model('Place', placeSchema);
