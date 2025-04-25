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
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Place' }],
  points: { type: Number, default: 0 }, 
  checkedInPlaces: [String],   
  rewards: { type: [String], default: [] },         
  pointsHistory: [pointsHistorySchema], 
  pushToken: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
