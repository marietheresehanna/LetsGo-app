const express = require('express');
const router = express.Router();
const Place = require('../models/Place');

// GET all places
router.get('/', async (req, res) => {
  try {
    const places = await Place.find();
    res.json(places);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching places' });
  }
});
// POST a new place
router.post('/', async (req, res) => {
    const { name, image, rating, location } = req.body;
  
    if (!name || !image || !rating || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      const newPlace = await Place.create({ name, image, rating, location });
      res.status(201).json(newPlace);
    } catch (err) {
      res.status(500).json({ message: 'Failed to add place' });
    }
  });
  

module.exports = router;
