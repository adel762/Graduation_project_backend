import express from 'express';
import { getSettings, updateSettings } from '../Controllers/notification.controller.js';
import { authenticateJWT } from '../Middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateJWT);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
