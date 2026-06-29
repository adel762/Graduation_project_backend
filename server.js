import express from 'express';
import dotenv from 'dotenv';

import sequelize from './src/config/db.js';

// Import model index to register all models & associations
import './src/Models/index.model.js';

// Routes
import authRoutes         from './src/Routes/auth.routes.js';
import userRoutes         from './src/Routes/user.routes.js';
import userProfileRoutes  from './src/Routes/userProfile.routes.js';
import marketRoutes       from './src/Routes/market.routes.js';
import portfolioRoutes    from './src/Routes/portfolio.routes.js';
import automationRoutes   from './src/Routes/automation.routes.js';
import notificationRoutes from './src/Routes/notification.routes.js';

dotenv.config();

const app = express();

app.use(express.json());

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, data: { version: '2.0.0' }, message: '🚀 Aura AI API is running!' });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/user',          userProfileRoutes);
app.use('/api/market',        marketRoutes);
app.use('/api/portfolio',     portfolioRoutes);
app.use('/api/automations',   automationRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, data: null, message: 'Route not found.' });
});

// ─── DB Connection & Server Start ─────────────────────────────────────────────
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('✅ DB Connected & Synced');
    app.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Aura AI Server v2.0.0 running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.error('❌ DB Connection failed:', err.message);
  });