import { getUserPortfolio, executeTrade } from '../Services/portfolio.service.js';

// GET /api/portfolio?limit=50&offset=0
export const getPortfolio = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const data = await getUserPortfolio(req.user.id, { limit, offset });
    res.status(200).json({
      success: true,
      data,
      message: 'Portfolio fetched successfully.',
    });
  } catch (err) {
    res.status(500).json({ success: false, data: null, message: err.message });
  }
};

// POST /api/portfolio/trade
export const trade = async (req, res) => {
  try {
    const { stock_id, type, quantity } = req.body;
    const result = await executeTrade(req.user.id, { stock_id, type, quantity });
    res.status(200).json({
      success: true,
      data: result,
      message: `${type} trade executed successfully.`,
    });
  } catch (err) {
    res.status(400).json({ success: false, data: null, message: err.message });
  }
};
