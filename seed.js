/**
 * seed.js — Populates the Aura AI database with realistic EGX mock data.
 * Run: node seed.js
 */

import sequelize from './src/config/db.js';
import './src/Models/index.model.js';
import { Stock, StockPrice, AiSignal } from './src/Models/index.model.js';
import dotenv from 'dotenv';
dotenv.config();

const stocks = [
  {
    symbol: 'COMI',
    name_en: 'Commercial International Bank',
    name_ar: 'البنك التجاري الدولي',
    market_cap: '85.2B EGP',
    pe_ratio: 7.42,
    div_yield: 3.15,
    avg_volume: '4.5M',
    description_en: 'CIB is Egypt\'s largest private-sector bank by assets, offering retail, corporate, and investment banking services.',
    description_ar: 'البنك التجاري الدولي هو أكبر بنك خاص في مصر من حيث الأصول، ويقدم خدمات التجزئة والشركات والاستثمار.',
  },
  {
    symbol: 'TMGH',
    name_en: 'Talaat Moustafa Group Holding',
    name_ar: 'مجموعة طلعت مصطفى القابضة',
    market_cap: '42.7B EGP',
    pe_ratio: 12.30,
    div_yield: 1.80,
    avg_volume: '3.1M',
    description_en: 'TMGH is Egypt\'s leading real estate developer, known for mega-projects like Madinaty and Al Rehab City.',
    description_ar: 'مجموعة طلعت مصطفى هي شركة التطوير العقاري الرائدة في مصر، وتشتهر بمشاريعها الضخمة مثل مدينتي والرحاب.',
  },
  {
    symbol: 'HRHO',
    name_en: 'EFG Hermes Holding',
    name_ar: 'هيرميس القابضة',
    market_cap: '22.5B EGP',
    pe_ratio: 10.85,
    div_yield: 0.95,
    avg_volume: '2.8M',
    description_en: 'EFG Hermes is the leading investment bank in the MENA region, providing brokerage, asset management, and research services.',
    description_ar: 'هيرميس هي بنك الاستثمار الرائد في منطقة الشرق الأوسط وشمال أفريقيا، وتقدم خدمات الوساطة وإدارة الأصول والبحوث.',
  },
  {
    symbol: 'EKHO',
    name_en: 'Edita Food Industries',
    name_ar: 'إيديتا للصناعات الغذائية',
    market_cap: '18.3B EGP',
    pe_ratio: 20.10,
    div_yield: 2.40,
    avg_volume: '1.2M',
    description_en: 'Edita is a leading Egyptian snack food manufacturer producing baked goods and confectionery distributed across MENA.',
    description_ar: 'إيديتا هي شركة مصنّعة رائدة للوجبات الخفيفة في مصر، تنتج المخبوزات والحلويات الموزعة في منطقة الشرق الأوسط وشمال أفريقيا.',
  },
  {
    symbol: 'ORWE',
    name_en: 'Oriental Weavers',
    name_ar: 'المصرية للمنسوجات (أوريانتال ويفرز)',
    market_cap: '9.8B EGP',
    pe_ratio: 6.50,
    div_yield: 4.20,
    avg_volume: '800K',
    description_en: 'Oriental Weavers is the world\'s largest machine-made carpet manufacturer, exporting to over 130 countries.',
    description_ar: 'أوريانتال ويفرز هي أكبر مصنّعة للسجاد المعمول بالآلة في العالم، وتصدر إلى أكثر من 130 دولة.',
  },
];

const prices = [
  { symbol: 'COMI',  current_price: 72.50,  change_percentage:  2.35, is_positive: true },
  { symbol: 'TMGH',  current_price: 22.80,  change_percentage: -1.12, is_positive: false },
  { symbol: 'HRHO',  current_price: 38.45,  change_percentage:  0.85, is_positive: true },
  { symbol: 'EKHO',  current_price: 49.10,  change_percentage:  3.70, is_positive: true },
  { symbol: 'ORWE',  current_price: 14.25,  change_percentage: -0.50, is_positive: false },
];

const signals = [
  { symbol: 'COMI', signal_type: 'Strong Buy',  confidence_score: 88, market_mood: 'Bullish',  reason_en: 'Strong Q3 earnings, rising NIM, and positive sector momentum support an aggressive buy.', reason_ar: 'أرباح قوية للربع الثالث وارتفاع هامش صافي الفائدة وزخم القطاع الإيجابي يدعمان الشراء.' },
  { symbol: 'TMGH', signal_type: 'Hold',        confidence_score: 62, market_mood: 'Neutral',  reason_en: 'Current valuations are fair. Await Q4 delivery numbers before adding new positions.', reason_ar: 'التقييمات الحالية معقولة. انتظر أرقام تسليم الربع الرابع قبل فتح مراكز جديدة.' },
  { symbol: 'HRHO', signal_type: 'Buy',         confidence_score: 75, market_mood: 'Bullish',  reason_en: 'Regional expansion and new fintech arm driving growth above sector average.', reason_ar: 'التوسع الإقليمي وذراع التكنولوجيا المالية الجديدة يدفعان النمو فوق متوسط القطاع.' },
  { symbol: 'EKHO', signal_type: 'Buy',         confidence_score: 71, market_mood: 'Bullish',  reason_en: 'Export revenue surge and cost efficiencies improving margins significantly this year.', reason_ar: 'ارتفاع إيرادات التصدير وكفاءات التكلفة تحسن الهوامش بشكل ملحوظ هذا العام.' },
  { symbol: 'ORWE', signal_type: 'Sell',        confidence_score: 58, market_mood: 'Bearish',  reason_en: 'Rising raw material costs and weakening export demand signal short-term downside pressure.', reason_ar: 'ارتفاع تكاليف المواد الخام وتراجع الطلب على الصادرات يشيران إلى ضغط هبوطي قصير الأجل.' },
];

async function seed() {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ DB synced');

    // Seed stocks
    const createdStocks = {};
    for (const s of stocks) {
      const [stock] = await Stock.findOrCreate({ where: { symbol: s.symbol }, defaults: s });
      createdStocks[s.symbol] = stock;
      console.log(`📈 Stock: ${stock.symbol}`);
    }

    // Seed prices
    for (const p of prices) {
      const stock = createdStocks[p.symbol];
      if (!stock) continue;
      await StockPrice.create({ stock_id: stock.id, ...p });
      console.log(`💰 Price for ${p.symbol}: ${p.current_price} EGP`);
    }

    // Seed AI signals
    for (const sig of signals) {
      const stock = createdStocks[sig.symbol];
      if (!stock) continue;
      await AiSignal.create({ stock_id: stock.id, ...sig });
      console.log(`🤖 Signal for ${sig.symbol}: ${sig.signal_type} (${sig.confidence_score}%)`);
    }

    console.log('\n✅ Seeding complete! Aura AI is ready to test.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
