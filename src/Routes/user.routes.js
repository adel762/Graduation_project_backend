import express from 'express';
import { register, login, oauth, deposit } from '../Controllers/user.controller.js';
import { authenticateJWT } from '../Middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login',    login);
router.post('/oauth',    oauth);

// Protected routes
router.post('/deposit', authenticateJWT, deposit);

export default router;