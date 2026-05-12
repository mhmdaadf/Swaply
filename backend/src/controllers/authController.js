const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const emailService = require('../services/emailService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    await emailService.sendWelcomeEmail(user);

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

exports.googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'Google ID Token is required' });

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (user) {
      // User exists with this email. Link account if not already linked.
      if (!user.googleId) {
        user.googleId = googleId;
        // Keep authType as 'local' if they signed up locally, but allow google login
        // Actually, let's mark it as linked
        if (picture && !user.profilePic) user.profilePic = picture;
        await user.save();
      } else if (user.googleId !== googleId) {
        return res.status(400).json({ message: 'Google account mismatch' });
      }
    } else {
      // Create new user
      let username = name.replace(/\s+/g, '').toLowerCase().substring(0, 20);
      const exists = await User.findOne({ username });
      if (exists) username = `${username}${Math.floor(Math.random() * 1000)}`;

      user = await User.create({
        username,
        email,
        googleId,
        authType: 'google',
        profilePic: picture,
      });
      await emailService.sendWelcomeEmail(user);
    }

    const tokens = generateTokens(user._id);
    res.json({ user, ...tokens });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ message: 'Invalid Google token' });
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

exports.updateProfile = async (req, res, next) => {
  try {
    const { username, email, wishlistCategories } = req.body;
    const user = await User.findById(req.user.id);

    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) return res.status(409).json({ message: 'Username already taken' });
      user.username = username;
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ message: 'Email already in use' });
      user.email = email;
    }

    if (wishlistCategories) user.wishlistCategories = wishlistCategories;

    await user.save();
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'No user found with that email' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await emailService.sendPasswordResetEmail(user, resetUrl);

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username profilePic trustScore totalRatings completedTrades cancelledTrades isVerified createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};
