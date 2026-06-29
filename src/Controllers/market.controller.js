import { getAllStocks, getStockById, searchStocks, compareStocks } from '../Services/market.service.js';

// GET /api/market/stocks?limit=20&offset=0
export const listStocks = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const result = await getAllStocks({ limit, offset });
    res.status(200).json({
      success: true,
      data: result,
      message: 'Stocks fetched successfully.',
    });
  } catch (err) {
    res.status(500).json({ success: false, data: null, message: err.message });
  }
};

// GET /api/market/stocks/:id
export const stockDetails = async (req, res) => {
  try {
    const stock = await getStockById(req.params.id);
    res.status(200).json({
      success: true,
      data: stock,
      message: 'Stock details fetched successfully.',
    });
  } catch (err) {
    res.status(404).json({ success: false, data: null, message: err.message });
  }
};

// GET /api/market/search?query=...&limit=20&offset=0
export const search = async (req, res) => {
  try {
    const { query, limit, offset } = req.query;
    const result = await searchStocks({ query, limit, offset });
    res.status(200).json({
      success: true,
      data: result,
      message: `Search results for "${query}".`,
    });
  } catch (err) {
    res.status(400).json({ success: false, data: null, message: err.message });
  }
};

// GET /api/market/compare?s1=COMI&s2=TMGH
export const compare = async (req, res) => {
  try {
    const { s1, s2 } = req.query;
    const result = await compareStocks(s1, s2);
    res.status(200).json({
      success: true,
      data: result,
      message: `Comparison between ${s1?.toUpperCase()} and ${s2?.toUpperCase()}.`,
    });
  } catch (err) {
    res.status(400).json({ success: false, data: null, message: err.message });
  }
};
