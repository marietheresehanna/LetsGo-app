const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Place = require('../models/Place');
const authMiddleware = require('../middleware/auth'); // For profile route

// SIGN UP
router.post('/signup', async (req, res) => {
  const { firstName, lastName, username, email, password, phone, gender, birthdate } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: 'Username already taken' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      phone,
      gender,
      birthdate,
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});


// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// GET USER BY ID (if needed separately)
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('firstName lastName email');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET PROFILE (token required)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Don't send password
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/update-username', authMiddleware, async (req, res) => {
  const { username } = req.body;

  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Username already taken' });

    const user = await User.findByIdAndUpdate(req.user.id, { username }, { new: true });
    res.json({ message: 'Username updated successfully', username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/update-password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 12);
    user.password = hashed;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/delete-account', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/favorites/:placeId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const placeId = req.params.placeId;

    if (!user.favorites.includes(placeId)) {
      user.favorites.push(placeId);
      await user.save();
    }

    res.json({ message: 'Added to favorites' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add favorite' });
  }
});
router.delete('/favorites/:placeId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter(
      (id) => id.toString() !== req.params.placeId
    );
    await user.save();

    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove favorite' });
  }
});
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
});


module.exports = router;
