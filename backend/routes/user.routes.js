const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Place = require('../models/Place');  

// Check-in Route
router.post('/check-in', async (req, res) => {
  console.log('🧩 Incoming Check-In:', req.body);
  const { userId, placeId } = req.body;
  if (!userId) {
    return res.status(401).json({ message: 'User not logged in!' });
  }

  try {
    const user = await User.findById(userId);
    const place = await Place.findById(placeId);  // ✅ Ensure place exists

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }
    // Cooldown logic: Check if user checked in within last 24 hours
    // Per-place cooldown logic
    const lastCheckInAtPlace = user.placeCheckIns?.get(placeId.toString());
    const now = new Date();

    if (lastCheckInAtPlace && now - lastCheckInAtPlace < 24 * 60 * 60 * 1000) {
      return res.status(400).json({ message: 'You can only check in at this place once every 24 hours!' });
    }


    // Add points and update checked-in places
    const pointsToAdd = 10;
    user.points += pointsToAdd;
    user.checkedInPlaces.push(placeId);

    if (!user.placeCheckIns) {
      user.placeCheckIns = new Map();
    }
    user.placeCheckIns.set(placeId.toString(), now);
    

    // 🎁 Reward logic when reaching 180 points
    if (user.points >= 180 && user.checkedInPlaces.length > 0) {
      const randomIndex = Math.floor(Math.random() * user.checkedInPlaces.length);
      const randomPlaceId = user.checkedInPlaces[randomIndex];
      const randomRewardPlace = await Place.findById(randomPlaceId).select('name');

      if (randomRewardPlace) {
        user.rewards.push(`20% Discount at ${randomRewardPlace.name}`);
      }

      user.points = 0;  // Reset points
    }

    // Add to points history
    user.pointsHistory.push({
      type: 'Place Check-in',
      placeId: placeId,
      pointsEarned: pointsToAdd,
      timestamp: new Date()
    });

    await user.save();

    res.status(200).json({ 
      message: 'Check-in successful!', 
      pointsEarned: pointsToAdd, 
      rewardGiven: user.points === 0  // Reward was given if points reset
    });
    
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get User Points and History
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('points pointsHistory');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
