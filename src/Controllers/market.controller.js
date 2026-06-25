import { getAllStocks, getStockById } from '../Services/market.service.js';

// GET /api/market/stocks
export const listStocks = async (req, res) => {
  try {
    const stocks = await getAllStocks();
    res.status(200).json({ message: 'Stocks fetched successfully ✅', count: stocks.length, data: stocks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/market/stocks/:id
export const stockDetails = async (req, res) => {
  try {
    const stock = await getStockById(req.params.id);
    res.status(200).json({ message: 'Stock details fetched successfully ✅', data: stock });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
