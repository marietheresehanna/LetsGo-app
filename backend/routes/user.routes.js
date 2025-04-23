const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Check-in Route
router.post('/check-in', async (req, res) => {
  const { userId, placeId } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'User not logged in!' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already checked in
    if (user.checkedInPlaces.includes(placeId)) {
      return res.status(400).json({ message: 'Already checked in!' });
    }

    // Add points and update checked-in places
    const pointsToAdd = 10;
    user.points += pointsToAdd;
    user.checkedInPlaces.push(placeId);

    // Add to points history
    user.pointsHistory.push({
      type: 'Place Check-in',
      placeId: placeId,
      pointsEarned: pointsToAdd,
      timestamp: new Date()
    });

    await user.save();

    res.status(200).json({ message: 'Check-in successful!', pointsEarned: pointsToAdd });
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