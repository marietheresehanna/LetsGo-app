const express = require('express');
const router = express.Router();
const Place = require('../models/Place');

// GET place by ID
router.get('/:id', async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Not found' });
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

router.get('/:id', async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    res.json(place);
  } catch (err) {
    res.status(404).json({ message: 'Place not found' });
  }
});

router.get('/', async (req, res) => {
  const places = await Place.find();
  res.json(places);
});


module.exports = router;
