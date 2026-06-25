import { getUserPortfolio, executeTrade } from '../Services/portfolio.service.js';

// GET /api/portfolio
export const getPortfolio = async (req, res) => {
  try {
    const data = await getUserPortfolio(req.user.id);
    res.status(200).json({ message: 'Portfolio fetched ✅', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/portfolio/trade
export const trade = async (req, res) => {
  try {
    const { stock_id, type, quantity } = req.body;
    const result = await executeTrade(req.user.id, { stock_id, type, quantity });
    res.status(200).json({ message: `${type} executed successfully ✅`, data: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
