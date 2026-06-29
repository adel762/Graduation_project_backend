import { UserPreference } from '../Models/index.model.js';

const VALID_RISK   = ['Low', 'Medium', 'High'];
const VALID_GOALS  = ['Growth', 'Dividends', 'Capital Preservation'];

// ─── Set / Update Preferences ─────────────────────────────────────────────────
export const setPreferences = async (userId, data) => {
  const { risk_tolerance, primary_goal } = data;

  if (risk_tolerance && !VALID_RISK.includes(risk_tolerance)) {
    throw new Error(`Invalid risk_tolerance. Must be one of: ${VALID_RISK.join(', ')}.`);
  }
  if (primary_goal && !VALID_GOALS.includes(primary_goal)) {
    throw new Error(`Invalid primary_goal. Must be one of: ${VALID_GOALS.join(', ')}.`);
  }

  const [prefs, created] = await UserPreference.findOrCreate({
    where: { user_id: userId },
    defaults: {
      user_id: userId,
      risk_tolerance: risk_tolerance || 'Medium',
      primary_goal:   primary_goal   || 'Growth',
    },
  });

  if (!created) {
    if (risk_tolerance) prefs.risk_tolerance = risk_tolerance;
    if (primary_goal)   prefs.primary_goal   = primary_goal;
    await prefs.save();
  }

  return prefs;
};

// ─── Get Preferences ──────────────────────────────────────────────────────────
export const getPreferences = async (userId) => {
  let prefs = await UserPreference.findOne({ where: { user_id: userId } });

  // Auto-create defaults if not set yet
  if (!prefs) {
    prefs = await UserPreference.create({
      user_id:        userId,
      risk_tolerance: 'Medium',
      primary_goal:   'Growth',
    });
  }

  return prefs;
};
