import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';

const NotificationSetting = sequelize.define('NotificationSetting', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  ai_alerts: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  price_volatility: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  market_news: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'notification_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default NotificationSetting;
