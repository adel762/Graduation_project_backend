import express from 'express';
import { getPortfolio, trade } from '../Controllers/portfolio.controller.js';
import { authenticateJWT } from '../Middleware/auth.middleware.js';

const router = express.Router();

// All portfolio routes require auth
router.use(authenticateJWT);

router.get('/',      getPortfolio);
router.post('/trade', trade);

export default router;
