const cron = require('node-cron');
const Place = require('../models/Place');

// Schedule: Runs every day at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  try {
    // Reset all places to normal points (1x)
    await Place.updateMany({}, { pointsMultiplier: 1 });

    // Fetch all places
    const places = await Place.find();
    if (places.length === 0) return;

    // Pick a random place
    const randomIndex = Math.floor(Math.random() * places.length);
    const randomPlace = places[randomIndex];

    // Set double points (2x) for the random place
    await Place.findByIdAndUpdate(randomPlace._id, { pointsMultiplier: 2 });

    console.log(`🚀 Daily bonus set for: ${randomPlace.name}`);
  } catch (error) {
    console.error('❌ Error setting daily bonus:', error);
  }
});
