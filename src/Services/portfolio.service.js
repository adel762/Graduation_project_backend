import sequelize from '../config/db.js';
import { User, Stock, StockPrice, UserPortfolio, Transaction } from '../Models/index.model.js';

// ─── Get Portfolio ─────────────────────────────────────────────────────────────
export const getUserPortfolio = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found.');

  const holdings = await UserPortfolio.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Stock,
        as: 'stock',
        attributes: ['id', 'symbol', 'name_en', 'name_ar'],
        include: [
          {
            model: StockPrice,
            as: 'prices',
            limit: 1,
            order: [['updated_at', 'DESC']],
            attributes: ['current_price', 'change_percentage', 'is_positive'],
          },
        ],
      },
    ],
  });

  let stocksValue = 0;
  const portfolioItems = holdings.map((item) => {
    const currentPrice = parseFloat(item.stock.prices[0]?.current_price || 0);
    const quantity      = parseFloat(item.quantity);
    const avgBuyPrice   = parseFloat(item.average_buy_price);
    const currentValue  = quantity * currentPrice;
    const costBasis     = quantity * avgBuyPrice;
    const profitLoss    = currentValue - costBasis;
    const profitLossPct = costBasis > 0 ? ((profitLoss / costBasis) * 100).toFixed(2) : '0.00';

    stocksValue += currentValue;

    return {
      id:                item.id,
      stock:             item.stock,
      quantity,
      average_buy_price: avgBuyPrice,
      current_price:     currentPrice,
      current_value:     parseFloat(currentValue.toFixed(2)),
      profit_loss:       parseFloat(profitLoss.toFixed(2)),
      profit_loss_pct:   parseFloat(profitLossPct),
    };
  });

  const walletBalance = parseFloat(user.balance);
  const netWorth      = parseFloat((walletBalance + stocksValue).toFixed(2));

  return {
    wallet_balance: walletBalance,
    stocks_value:   parseFloat(stocksValue.toFixed(2)),
    net_worth:      netWorth,
    holdings:       portfolioItems,
  };
};

// ─── Execute Trade ─────────────────────────────────────────────────────────────
export const executeTrade = async (userId, { stock_id, type, quantity }) => {
  if (!['BUY', 'SELL'].includes(type)) throw new Error('type must be BUY or SELL.');
  if (!quantity || quantity <= 0)      throw new Error('quantity must be greater than 0.');

  // Use a transaction for atomicity
  const result = await sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!user) throw new Error('User not found.');

    const stock = await Stock.findByPk(stock_id, { transaction: t });
    if (!stock) throw new Error('Stock not found.');

    // Get current price
    const priceRecord = await StockPrice.findOne({
      where: { stock_id },
      order: [['updated_at', 'DESC']],
      transaction: t,
    });
    if (!priceRecord) throw new Error('No price data available for this stock.');

    const currentPrice = parseFloat(priceRecord.current_price);
    const totalCost    = parseFloat((currentPrice * quantity).toFixed(2));

    if (type === 'BUY') {
      if (parseFloat(user.balance) < totalCost) {
        throw new Error(`Insufficient balance. Required: ${totalCost} EGP, Available: ${user.balance} EGP.`);
      }

      // Deduct balance
      user.balance = parseFloat((parseFloat(user.balance) - totalCost).toFixed(2));
      await user.save({ transaction: t });

      // Upsert portfolio
      const existing = await UserPortfolio.findOne({ where: { user_id: userId, stock_id }, transaction: t });
      if (existing) {
        const totalQty   = parseFloat(existing.quantity) + parseFloat(quantity);
        const totalCostAll = (parseFloat(existing.quantity) * parseFloat(existing.average_buy_price)) + totalCost;
        existing.quantity         = totalQty;
        existing.average_buy_price = parseFloat((totalCostAll / totalQty).toFixed(2));
        await existing.save({ transaction: t });
      } else {
        await UserPortfolio.create({
          user_id: userId, stock_id, quantity, average_buy_price: currentPrice,
        }, { transaction: t });
      }

      // Record transaction
      await Transaction.create({
        user_id: userId, stock_id, type: 'BUY', status: 'COMPLETED',
        quantity, price_per_share: currentPrice, amount: totalCost,
      }, { transaction: t });

    } else { // SELL
      const holding = await UserPortfolio.findOne({ where: { user_id: userId, stock_id }, transaction: t });
      if (!holding) throw new Error('You do not own this stock.');
      if (parseFloat(holding.quantity) < parseFloat(quantity)) {
        throw new Error(`Insufficient shares. You own ${holding.quantity}, trying to sell ${quantity}.`);
      }

      // Credit balance
      user.balance = parseFloat((parseFloat(user.balance) + totalCost).toFixed(2));
      await user.save({ transaction: t });

      // Update or remove portfolio holding
      const newQty = parseFloat(holding.quantity) - parseFloat(quantity);
      if (newQty === 0) {
        await holding.destroy({ transaction: t });
      } else {
        holding.quantity = newQty;
        await holding.save({ transaction: t });
      }

      // Record transaction
      await Transaction.create({
        user_id: userId, stock_id, type: 'SELL', status: 'COMPLETED',
        quantity, price_per_share: currentPrice, amount: totalCost,
      }, { transaction: t });
    }

    return {
      type,
      stock:           { id: stock.id, symbol: stock.symbol, name_en: stock.name_en },
      quantity:        parseFloat(quantity),
      price_per_share: currentPrice,
      total_amount:    totalCost,
      new_balance:     user.balance,
    };
  });

  return result;
};
