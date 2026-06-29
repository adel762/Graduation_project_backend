import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';

const TokenBlacklist = sequelize.define('TokenBlacklist', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  token: {
    type: DataTypes.STRING(512),
    allowNull: false,
    unique: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'blacklisted_tokens',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default TokenBlacklist;
