import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';

const Transaction = sequelize.define('Transaction', {
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
    allowNull: true, // NULL for deposits
  },
  type: {
    type: DataTypes.ENUM('BUY', 'SELL', 'DEPOSIT'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED'),
    allowNull: false,
    defaultValue: 'COMPLETED',
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true, // NULL for deposits
  },
  price_per_share: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true, // NULL for deposits
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false, // quantity * price_per_share OR deposit amount
  },
}, {
  tableName: 'transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default Transaction;
