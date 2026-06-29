import { SmartAutomation, Stock } from '../Models/index.model.js';

const VALID_ACTIONS = ['BUY', 'SELL'];

// ─── Create Automation ────────────────────────────────────────────────────────
export const createAutomation = async (userId, data) => {
  const { stock_id, action_type, trigger_price, quantity } = data;

  const stock = await Stock.findByPk(stock_id);
  if (!stock) throw new Error('Stock not found.');
  if (!VALID_ACTIONS.includes(action_type)) throw new Error('action_type must be BUY or SELL.');
  if (!trigger_price || trigger_price <= 0) throw new Error('trigger_price must be greater than 0.');
  if (!quantity || quantity <= 0)           throw new Error('quantity must be greater than 0.');

  const automation = await SmartAutomation.create({
    user_id: userId, stock_id, action_type, trigger_price, quantity, status: 'PENDING',
  });

  return automation;
};

// ─── Get All User Automations (paginated) ─────────────────────────────────────
export const getUserAutomations = async (userId, { limit = 20, offset = 0 } = {}) => {
  const { count, rows } = await SmartAutomation.findAndCountAll({
    where: { user_id: userId },
    include: [{ model: Stock, as: 'stock', attributes: ['id', 'symbol', 'name_en', 'name_ar'] }],
    order: [['created_at', 'DESC']],
    limit:  parseInt(limit),
    offset: parseInt(offset),
  });
  return { total: count, limit: parseInt(limit), offset: parseInt(offset), automations: rows };
};

// ─── Get Single Automation ────────────────────────────────────────────────────
export const getAutomationById = async (userId, automationId) => {
  const automation = await SmartAutomation.findOne({
    where: { id: automationId, user_id: userId },
    include: [{ model: Stock, as: 'stock', attributes: ['id', 'symbol', 'name_en', 'name_ar'] }],
  });
  if (!automation) throw new Error('Automation not found or does not belong to you.');
  return automation;
};

// ─── Update Automation ────────────────────────────────────────────────────────
export const updateAutomation = async (userId, automationId, data) => {
  const { action_type, trigger_price, quantity } = data;

  const automation = await SmartAutomation.findOne({ where: { id: automationId, user_id: userId } });
  if (!automation) throw new Error('Automation not found or does not belong to you.');
  if (automation.status === 'TRIGGERED') throw new Error('Cannot update an already-triggered automation.');
  if (automation.status === 'CANCELLED') throw new Error('Cannot update a cancelled automation.');

  if (action_type) {
    if (!VALID_ACTIONS.includes(action_type)) throw new Error('action_type must be BUY or SELL.');
    automation.action_type = action_type;
  }
  if (trigger_price !== undefined) {
    if (trigger_price <= 0) throw new Error('trigger_price must be greater than 0.');
    automation.trigger_price = trigger_price;
  }
  if (quantity !== undefined) {
    if (quantity <= 0) throw new Error('quantity must be greater than 0.');
    automation.quantity = quantity;
  }

  await automation.save();

  // Re-fetch with stock association for full response
  return getAutomationById(userId, automationId);
};

// ─── Delete Automation ────────────────────────────────────────────────────────
export const deleteAutomation = async (userId, automationId) => {
  const automation = await SmartAutomation.findOne({ where: { id: automationId, user_id: userId } });
  if (!automation) throw new Error('Automation not found or does not belong to you.');

  await automation.destroy();
  return { deleted_id: parseInt(automationId) };
};
