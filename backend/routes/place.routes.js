const express = require('express');
const router = express.Router();
const Place = require('../models/Place');

// GET all places (optionally filter by category/type)
router.get('/', async (req, res) => {
  try {
    const filter = {};

    if (req.query.type) {
      // Case-insensitive exact match on array field
      filter.type = {
        $elemMatch: {
          $regex: new RegExp(`^${req.query.type}$`, 'i'),
        },
      };
    }

    const places = await Place.find(filter);
    res.json(places);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching places' });
  }
});

// GET place by ID
router.get('/:id', async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    res.json(place);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving place' });
  }
});

// POST a new place
router.post('/', async (req, res) => {
  try {
    const newPlace = new Place(req.body);
    await newPlace.save();
    res.status(201).json(newPlace);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add place', error: err.message });
  }
});

// POST a review to a place
router.post('/:id/reviews', async (req, res) => {
  try {
    const { comment, rating, username } = req.body;
    const place = await Place.findById(req.params.id);

    if (!place) return res.status(404).json({ message: 'Place not found' });

    const review = {
      comment,
      rating,
      username,
      createdAt: new Date(),
    };

    place.reviews.push(review);

    // Update average rating
    const total = place.reviews.reduce((sum, r) => sum + r.rating, 0);
    place.rating = (total / place.reviews.length).toFixed(1);

    await place.save();

    const updatedPlace = await Place.findById(req.params.id);
    res.json({ place: updatedPlace }); // ✅ frontend expects { place: ... }

  } catch (err) {
    res.status(400).json({ message: 'Failed to add review', error: err.message });
  }
});

module.exports = router;
