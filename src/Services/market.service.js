import { Stock, StockPrice, AiSignal } from '../Models/index.model.js';

// Get all stocks with current price + latest AI signal
export const getAllStocks = async () => {
  const stocks = await Stock.findAll({
    include: [
      {
        model: StockPrice,
        as: 'prices',
        limit: 1,
        order: [['updated_at', 'DESC']],
        attributes: ['current_price', 'change_percentage', 'is_positive', 'updated_at'],
      },
      {
        model: AiSignal,
        as: 'signals',
        limit: 1,
        order: [['created_at', 'DESC']],
        attributes: ['signal_type', 'confidence_score', 'market_mood'],
      },
    ],
  });
  return stocks;
};

// Get a single stock by ID with full details
export const getStockById = async (id) => {
  const stock = await Stock.findByPk(id, {
    include: [
      {
        model: StockPrice,
        as: 'prices',
        limit: 1,
        order: [['updated_at', 'DESC']],
      },
      {
        model: AiSignal,
        as: 'signals',
        limit: 1,
        order: [['created_at', 'DESC']],
      },
    ],
  });

  if (!stock) throw new Error('Stock not found.');
  return stock;
};
