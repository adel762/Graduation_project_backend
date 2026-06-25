import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';

const StockPrice = sequelize.define('StockPrice', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  stock_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  current_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  change_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  is_positive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'stock_prices',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
});

export default StockPrice;
