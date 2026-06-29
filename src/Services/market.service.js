import { Op } from 'sequelize';
import { Stock, StockPrice, AiSignal } from '../Models/index.model.js';

// ─── Shared eager-load config ─────────────────────────────────────────────────
const latestPrice = {
  model: StockPrice,
  as: 'prices',
  limit: 1,
  order: [['updated_at', 'DESC']],
  attributes: ['current_price', 'change_percentage', 'is_positive', 'updated_at'],
};

const latestSignal = {
  model: AiSignal,
  as: 'signals',
  limit: 1,
  order: [['created_at', 'DESC']],
  attributes: ['signal_type', 'confidence_score', 'market_mood'],
};

// ─── Get All Stocks (paginated) ───────────────────────────────────────────────
export const getAllStocks = async ({ limit = 20, offset = 0 } = {}) => {
  const { count, rows } = await Stock.findAndCountAll({
    include: [latestPrice, latestSignal],
    limit:  parseInt(limit),
    offset: parseInt(offset),
    distinct: true,
  });
  return { total: count, limit: parseInt(limit), offset: parseInt(offset), stocks: rows };
};

// ─── Get Single Stock (full details) ─────────────────────────────────────────
export const getStockById = async (id) => {
  const stock = await Stock.findByPk(id, {
    include: [
      {
        model: StockPrice,
        as: 'prices',
        order: [['updated_at', 'DESC']],   // full price history, no limit
        attributes: ['id', 'current_price', 'change_percentage', 'is_positive', 'updated_at'],
      },
      {
        model: AiSignal,
        as: 'signals',
        order: [['created_at', 'DESC']],   // full AI signal history, no limit
        attributes: ['id', 'signal_type', 'confidence_score', 'market_mood', 'reason_en', 'reason_ar', 'created_at'],
      },
    ],
  });
  if (!stock) throw new Error('Stock not found.');
  return stock;
};

// ─── Search Stocks (EN symbol / EN name / AR name) ────────────────────────────
export const searchStocks = async ({ query, limit = 20, offset = 0 }) => {
  if (!query || query.trim() === '') throw new Error('Search query cannot be empty.');

  const pattern = `%${query.trim()}%`;

  const { count, rows } = await Stock.findAndCountAll({
    where: {
      [Op.or]: [
        { symbol:  { [Op.like]: pattern } },
        { name_en: { [Op.like]: pattern } },
        { name_ar: { [Op.like]: pattern } },
      ],
    },
    include: [latestPrice, latestSignal],
    limit:  parseInt(limit),
    offset: parseInt(offset),
    distinct: true,
  });

  return { total: count, limit: parseInt(limit), offset: parseInt(offset), stocks: rows };
};

// ─── Compare Two Stocks ────────────────────────────────────────────────────────
export const compareStocks = async (symbol1, symbol2) => {
  if (!symbol1 || !symbol2) throw new Error('Both s1 and s2 query parameters are required.');
  if (symbol1.toUpperCase() === symbol2.toUpperCase()) {
    throw new Error('s1 and s2 must be different stock symbols.');
  }

  const fetchStock = async (symbol) => {
    const stock = await Stock.findOne({
      where: { symbol: symbol.toUpperCase() },
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
          attributes: ['signal_type', 'confidence_score', 'market_mood', 'reason_en', 'reason_ar'],
        },
      ],
    });
    if (!stock) throw new Error(`Stock with symbol "${symbol.toUpperCase()}" not found.`);
    return stock;
  };

  const [stock1, stock2] = await Promise.all([fetchStock(symbol1), fetchStock(symbol2)]);
  return { stock_1: stock1, stock_2: stock2 };
};
