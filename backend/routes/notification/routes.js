const express = require('express'); 
const router = express.Router();
const User = require('../../models/User');
const Place = require('../../models/Place');
const { Expo } = require('expo-server-sdk');
const authMiddleware = require('../../middleware/auth'); 

let expo = new Expo();

// Route 1: Save push token
router.post('/register-token', authMiddleware, async (req, res) => {
  const { pushToken } = req.body;

  if (!pushToken) {
    return res.status(400).json({ message: 'Push token is required' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { pushToken },
      { new: true }
    );
    res.json({ message: 'Push token saved', pushToken: user.pushToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save push token' });
  }
});

// Route 2: Update user location and send notification if near a place
router.post('/update-location', authMiddleware, async (req, res) => {
  if (!req.body || !req.body.latitude || !req.body.longitude) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }
  
  const { latitude, longitude } = req.body;
  
  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Location required' });
  }

  try {
    const places = await Place.find({
      latitude: { $exists: true },
      longitude: { $exists: true },
    });

    // Check if user is near any place (within 500 meters)
    const nearbyPlace = places.find((place) => {
      const distance = getDistance(latitude, longitude, place.latitude, place.longitude);
      return distance <= 500; // meters
    });

    if (nearbyPlace) {
      const user = await User.findById(req.user.id);

      if (user?.pushToken && Expo.isExpoPushToken(user.pushToken)) {
        await expo.sendPushNotificationsAsync([{
          to: user.pushToken,
          sound: 'default',
          title: 'You’re nearby!',
          body: `👋 You're near ${nearbyPlace.name}! Check in now and earn points!`,
        }]);
      }
    }

    res.json({ message: 'Location processed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Distance calculation (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000; // Earth’s radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = router;
