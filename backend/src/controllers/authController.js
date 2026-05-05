const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });
  return { accessToken, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, wishlistCategories } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({
        message: existingUser.email === email ? 'Email already in use' : 'Username already taken',
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      wishlistCategories: wishlistCategories || [],
    });

    const tokens = generateTokens(user._id);
    res.status(201).json({ user, ...tokens });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const tokens = generateTokens(user._id);
    user.password = undefined;
    res.json({ user, ...tokens });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user._id);
    res.json(tokens);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};
