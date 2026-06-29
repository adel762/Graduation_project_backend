import express from 'express';
import { me, logout } from '../Controllers/auth.controller.js';
import { authenticateJWT } from '../Middleware/auth.middleware.js';

const router = express.Router();

// All auth routes are protected
router.get('/me',     authenticateJWT, me);
router.post('/logout', authenticateJWT, logout);

export default router;
