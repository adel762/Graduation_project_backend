import express from 'express';
import { listStocks, stockDetails } from '../Controllers/market.controller.js';

const router = express.Router();

// Public routes — no auth needed to browse the market
router.get('/stocks',     listStocks);
router.get('/stocks/:id', stockDetails);

export default router;
