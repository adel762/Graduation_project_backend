import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';

const Stock = sequelize.define('Stock', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  symbol: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  name_en: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  name_ar: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  market_cap: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  pe_ratio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  div_yield: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  avg_volume: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  description_en: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description_ar: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'stocks',
  timestamps: false,
});

export default Stock;
