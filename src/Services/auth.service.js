import jwt from 'jsonwebtoken';
import { User, UserPreference, TokenBlacklist } from '../Models/index.model.js';

// ─── Get Current User (GET /api/auth/me) ──────────────────────────────────────
export const getMe = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password_hash'] },
    include: [
      {
        model: UserPreference,
        as: 'preferences',
        attributes: ['risk_tolerance', 'primary_goal'],
      },
    ],
  });
  if (!user) throw new Error('User not found.');
  return user;
};

// ─── Logout (POST /api/auth/logout) ───────────────────────────────────────────
export const logoutUser = async (token) => {
  // Decode to get expiry without throwing on expired tokens
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.exp) throw new Error('Invalid token payload.');

  const expiresAt = new Date(decoded.exp * 1000); // exp is in seconds

  // Insert into blacklist (ignore duplicate — token already blacklisted)
  await TokenBlacklist.findOrCreate({
    where: { token },
    defaults: { token, expires_at: expiresAt },
  });
};
