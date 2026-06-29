import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';

const UserPreference = sequelize.define('UserPreference', {
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
  risk_tolerance: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    allowNull: false,
    defaultValue: 'Medium',
  },
  primary_goal: {
    type: DataTypes.ENUM('Growth', 'Dividends', 'Capital Preservation'),
    allowNull: false,
    defaultValue: 'Growth',
  },
}, {
  tableName: 'user_preferences',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default UserPreference;
