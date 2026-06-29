import express from 'express';
import { upsertPreferences, fetchPreferences } from '../Controllers/userProfile.controller.js';
import { authenticateJWT } from '../Middleware/auth.middleware.js';

const router = express.Router();

// All user profile routes are protected
router.use(authenticateJWT);

router.post('/preferences', upsertPreferences);
router.get('/preferences',  fetchPreferences);

export default router;
