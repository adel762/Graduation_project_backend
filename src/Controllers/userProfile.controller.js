import { setPreferences, getPreferences } from '../Services/userProfile.service.js';

// POST /api/user/preferences
export const upsertPreferences = async (req, res) => {
  try {
    const prefs = await setPreferences(req.user.id, req.body);
    res.status(200).json({
      success: true,
      data: prefs,
      message: 'Investment preferences saved successfully.',
    });
  } catch (err) {
    res.status(400).json({ success: false, data: null, message: err.message });
  }
};

// GET /api/user/preferences
export const fetchPreferences = async (req, res) => {
  try {
    const prefs = await getPreferences(req.user.id);
    res.status(200).json({
      success: true,
      data: prefs,
      message: 'Investment preferences fetched successfully.',
    });
  } catch (err) {
    res.status(500).json({ success: false, data: null, message: err.message });
  }
};
