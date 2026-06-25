import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  accepted_terms: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  auth_provider: {
    type: DataTypes.ENUM('local', 'google', 'apple'),
    defaultValue: 'local',
  },
}, {
  tableName: 'users',
  timestamps: false, // 'created_at' is managed by MySQL DEFAULT CURRENT_TIMESTAMP
});

export default User;