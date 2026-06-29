import { getMe, logoutUser } from '../Services/auth.service.js';

// GET /api/auth/me
export const me = async (req, res) => {
  try {
    const user = await getMe(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
      message: 'User profile fetched successfully.',
    });
  } catch (err) {
    res.status(404).json({ success: false, data: null, message: err.message });
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    await logoutUser(req.token);
    res.status(200).json({
      success: true,
      data: null,
      message: 'Logged out successfully. Token has been invalidated.',
    });
  } catch (err) {
    res.status(400).json({ success: false, data: null, message: err.message });
  }
};
