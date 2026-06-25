import express from 'express';
import { createUserAutomation, listUserAutomations } from '../Controllers/automation.controller.js';
import { authenticateJWT } from '../Middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateJWT);

router.post('/', createUserAutomation);
router.get('/',  listUserAutomations);

export default router;
