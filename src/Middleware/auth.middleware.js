import jwt from 'jsonwebtoken';
import { User, TokenBlacklist } from '../Models/index.model.js';

export const authenticateJWT = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, data: null, message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify JWT signature & expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check blacklist (stateful logout support)
    const isBlacklisted = await TokenBlacklist.findOne({ where: { token } });
    if (isBlacklisted) {
      return res.status(401).json({ success: false, data: null, message: 'Token has been invalidated. Please log in again.' });
    }

    // 4. Find user in DB for security
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, data: null, message: 'User not found.' });
    }

    // 5. Attach user to request
    req.user  = { id: user.id, username: user.username, email: user.email };
    req.token = token;  // carry token forward for logout use
    next();
  } catch (error) {
    return res.status(401).json({ success: false, data: null, message: 'Invalid or expired token.' });
  }
};