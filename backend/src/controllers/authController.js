import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ROLES } from '../config/roles.js';
import { AppError } from '../middleware/errorHandler.js';
import { OAuth2Client } from 'google-auth-library';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) throw new AppError('Email already registered', 400);

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || ROLES.DONOR,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) throw new AppError('Account deactivated', 403);

    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        home: user.home,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('home', 'name type slug');
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const verifyGoogleIdentity = async (req, res, next) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) throw new AppError('Google sign-in is not configured', 503);
    if (!req.body.credential) throw new AppError('Google identity token is required', 400);
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken: req.body.credential, audience: process.env.GOOGLE_CLIENT_ID });
    const profile = ticket.getPayload();
    if (!profile?.email_verified) throw new AppError('Google email is not verified', 401);
    const verificationToken = jwt.sign(
      { purpose: 'guardian_application', name: profile.name, email: profile.email },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );
    res.json({ success: true, data: { name: profile.name, email: profile.email, picture: profile.picture, verificationToken } });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    console.error('Google token verification failed:', error.message);
    return next(new AppError(`Google sign-in could not be verified: ${error.message}`, 401));
  }
};
