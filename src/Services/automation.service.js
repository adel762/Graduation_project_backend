import { SmartAutomation, Stock } from '../Models/index.model.js';

// Create automation
export const createAutomation = async (userId, data) => {
  const { stock_id, action_type, trigger_price, quantity } = data;

  const stock = await Stock.findByPk(stock_id);
  if (!stock) throw new Error('Stock not found.');

  if (!['BUY', 'SELL'].includes(action_type)) throw new Error('action_type must be BUY or SELL.');
  if (!trigger_price || trigger_price <= 0)   throw new Error('trigger_price must be greater than 0.');
  if (!quantity || quantity <= 0)              throw new Error('quantity must be greater than 0.');

  const automation = await SmartAutomation.create({
    user_id: userId,
    stock_id,
    action_type,
    trigger_price,
    quantity,
    status: 'PENDING',
  });

  return automation;
};

// Get all automations for user
export const getUserAutomations = async (userId) => {
  const automations = await SmartAutomation.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Stock,
        as: 'stock',
        attributes: ['id', 'symbol', 'name_en', 'name_ar'],
      },
    ],
    order: [['created_at', 'DESC']],
  });
  return automations;
};
