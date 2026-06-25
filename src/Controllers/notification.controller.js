import { NotificationSetting } from '../Models/index.model.js';

// GET /api/notifications/settings
export const getSettings = async (req, res) => {
  try {
    let settings = await NotificationSetting.findOne({ where: { user_id: req.user.id } });

    // Auto-create defaults if row doesn't exist yet
    if (!settings) {
      settings = await NotificationSetting.create({ user_id: req.user.id });
    }

    res.status(200).json({ message: 'Notification settings fetched ✅', data: settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/notifications/settings
export const updateSettings = async (req, res) => {
  try {
    const { ai_alerts, price_volatility, market_news } = req.body;

    let settings = await NotificationSetting.findOne({ where: { user_id: req.user.id } });
    if (!settings) {
      settings = await NotificationSetting.create({ user_id: req.user.id });
    }

    // Only update provided fields
    if (ai_alerts      !== undefined) settings.ai_alerts       = ai_alerts;
    if (price_volatility !== undefined) settings.price_volatility = price_volatility;
    if (market_news    !== undefined) settings.market_news     = market_news;

    await settings.save();

    res.status(200).json({ message: 'Notification settings updated ✅', data: settings });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
