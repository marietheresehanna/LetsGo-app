const mongoose = require('mongoose');

const pointsHistorySchema = new mongoose.Schema({
  type: String,
  placeId: String,
  pointsEarned: Number,
  timestamp: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  email: String,
  password: String,
  phone: String,
  gender: String,
  birthdate: Date,
  favorites: [String],
  points: { type: Number, default: 0 }, 
  checkedInPlaces: [String],            
  pointsHistory: [pointsHistorySchema], 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
