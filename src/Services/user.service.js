import { User, NotificationSetting } from '../Models/index.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ─── Register ──────────────────────────────────────────────────────────────────
export const registerUser = async (data) => {
  const { username, email, password, accepted_terms } = data;

  if (!accepted_terms) {
    throw new Error('You must accept the terms and conditions.');
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new Error('Email already registered.');
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password_hash,
    accepted_terms: true,
    auth_provider: 'local',
  });

  // Create default notification settings for new user
  await NotificationSetting.create({ user_id: user.id });

  return { id: user.id, username: user.username, email: user.email };
};

// ─── Login ─────────────────────────────────────────────────────────────────────
export const loginUser = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('User not found.');
  if (!user.password_hash) throw new Error('This account uses social login. Please use OAuth.');

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new Error('Invalid password.');

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    user: { id: user.id, username: user.username, email: user.email },
    token,
  };
};

// ─── OAuth (Google / Apple) ─────────────────────────────────────────────────
export const oauthLogin = async (data) => {
  const { username, email, auth_provider } = data;

  if (!['google', 'apple'].includes(auth_provider)) {
    throw new Error('Invalid auth_provider. Must be "google" or "apple".');
  }

  // Upsert: find existing or create new user
  let user = await User.findOne({ where: { email } });

  if (!user) {
    user = await User.create({
      username,
      email,
      password_hash: null,
      accepted_terms: true,
      auth_provider,
    });
    // Default notification settings
    await NotificationSetting.create({ user_id: user.id });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    user: { id: user.id, username: user.username, email: user.email },
    token,
  };
};

// ─── Deposit ────────────────────────────────────────────────────────────────
export const depositFunds = async (userId, amount) => {
  if (!amount || amount <= 0) throw new Error('Deposit amount must be greater than 0.');

  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found.');

  user.balance = parseFloat(user.balance) + parseFloat(amount);
  await user.save();

  return { balance: user.balance };
};