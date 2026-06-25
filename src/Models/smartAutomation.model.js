import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';

const SmartAutomation = sequelize.define('SmartAutomation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  stock_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  action_type: {
    type: DataTypes.ENUM('BUY', 'SELL'),
    allowNull: false,
  },
  trigger_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'TRIGGERED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
}, {
  tableName: 'smart_automations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default SmartAutomation;
