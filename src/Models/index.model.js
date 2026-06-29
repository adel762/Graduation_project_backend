// Central model registry — import ALL models here so associations are defined once.
import User from './user.model.js';
import Stock from './stock.model.js';
import StockPrice from './stockPrice.model.js';
import UserPortfolio from './userPortfolio.model.js';
import AiSignal from './aiSignal.model.js';
import Transaction from './transaction.model.js';
import SmartAutomation from './smartAutomation.model.js';
import NotificationSetting from './notificationSetting.model.js';
import UserPreference from './userPreference.model.js';
import TokenBlacklist from './tokenBlacklist.model.js';

// ─── Associations ──────────────────────────────────────────────────────────────

// Stock  ↔  StockPrice  (1:N)
Stock.hasMany(StockPrice,     { foreignKey: 'stock_id', as: 'prices',       onDelete: 'CASCADE' });
StockPrice.belongsTo(Stock,   { foreignKey: 'stock_id', as: 'stock' });

// Stock  ↔  AiSignal  (1:N)
Stock.hasMany(AiSignal,       { foreignKey: 'stock_id', as: 'signals',      onDelete: 'CASCADE' });
AiSignal.belongsTo(Stock,     { foreignKey: 'stock_id', as: 'stock' });

// User   ↔  UserPortfolio  (1:N)
User.hasMany(UserPortfolio,   { foreignKey: 'user_id',  as: 'portfolio',    onDelete: 'CASCADE' });
UserPortfolio.belongsTo(User, { foreignKey: 'user_id',  as: 'user' });

// Stock  ↔  UserPortfolio  (1:N)
Stock.hasMany(UserPortfolio,        { foreignKey: 'stock_id', as: 'portfolioItems', onDelete: 'CASCADE' });
UserPortfolio.belongsTo(Stock,      { foreignKey: 'stock_id', as: 'stock' });

// User   ↔  Transaction  (1:N)
User.hasMany(Transaction,           { foreignKey: 'user_id',  as: 'transactions',  onDelete: 'CASCADE' });
Transaction.belongsTo(User,         { foreignKey: 'user_id',  as: 'user' });

// Stock  ↔  Transaction  (1:N, nullable)
Stock.hasMany(Transaction,          { foreignKey: 'stock_id', as: 'transactions',  onDelete: 'SET NULL' });
Transaction.belongsTo(Stock,        { foreignKey: 'stock_id', as: 'stock' });

// User   ↔  SmartAutomation  (1:N)
User.hasMany(SmartAutomation,       { foreignKey: 'user_id',  as: 'automations',   onDelete: 'CASCADE' });
SmartAutomation.belongsTo(User,     { foreignKey: 'user_id',  as: 'user' });

// Stock  ↔  SmartAutomation  (1:N)
Stock.hasMany(SmartAutomation,      { foreignKey: 'stock_id', as: 'automations',   onDelete: 'CASCADE' });
SmartAutomation.belongsTo(Stock,    { foreignKey: 'stock_id', as: 'stock' });

// User   ↔  NotificationSetting  (1:1)
User.hasOne(NotificationSetting,    { foreignKey: 'user_id', as: 'notificationSettings', onDelete: 'CASCADE' });
NotificationSetting.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User   ↔  UserPreference  (1:1)
User.hasOne(UserPreference,         { foreignKey: 'user_id', as: 'preferences', onDelete: 'CASCADE' });
UserPreference.belongsTo(User,      { foreignKey: 'user_id', as: 'user' });

// ─── Exports ───────────────────────────────────────────────────────────────────
export {
  User,
  Stock,
  StockPrice,
  UserPortfolio,
  AiSignal,
  Transaction,
  SmartAutomation,
  NotificationSetting,
  UserPreference,
  TokenBlacklist,
};
