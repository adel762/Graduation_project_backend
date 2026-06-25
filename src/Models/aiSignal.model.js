import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';

const AiSignal = sequelize.define('AiSignal', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  stock_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  signal_type: {
    type: DataTypes.ENUM('Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'),
    allowNull: false,
  },
  confidence_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  market_mood: {
    type: DataTypes.ENUM('Bullish', 'Bearish', 'Neutral'),
    allowNull: false,
  },
  reason_en: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reason_ar: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'ai_signals',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default AiSignal;
