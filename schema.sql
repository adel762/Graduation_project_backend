-- ============================================================
--  Aura AI - Full Database Schema (EGX Stock Market App)
--  MySQL 8.x Compatible
-- ============================================================

CREATE DATABASE IF NOT EXISTS Auro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE Auro;

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    username       VARCHAR(100) NOT NULL,
    email          VARCHAR(150) UNIQUE NOT NULL,
    password_hash  VARCHAR(255) NULL,                            -- NULL for OAuth users
    balance        DECIMAL(15, 2) NOT NULL DEFAULT 0.00,         -- wallet/trading balance
    accepted_terms BOOLEAN NOT NULL DEFAULT FALSE,
    auth_provider  ENUM('local', 'google', 'apple') DEFAULT 'local',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Stocks ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stocks (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    symbol         VARCHAR(20) UNIQUE NOT NULL,
    name_en        VARCHAR(100) NOT NULL,
    name_ar        VARCHAR(100) NOT NULL,
    market_cap     VARCHAR(50),
    pe_ratio       DECIMAL(10, 2),
    div_yield      DECIMAL(5, 2),
    avg_volume     VARCHAR(50),
    description_en TEXT,
    description_ar TEXT
);

-- ─── Stock Prices (Real-time / Current) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_prices (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    stock_id          INT NOT NULL,
    current_price     DECIMAL(10, 2) NOT NULL,
    change_percentage DECIMAL(5, 2),
    is_positive       BOOLEAN DEFAULT TRUE,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
);

-- ─── User Portfolio ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_portfolio (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL,
    stock_id         INT NOT NULL,
    quantity         DECIMAL(10, 4) NOT NULL,
    average_buy_price DECIMAL(10, 2) NOT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
);

-- ─── AI Signals (XGBoost Predictions) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_signals (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    stock_id         INT NOT NULL,
    signal_type      ENUM('Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell') NOT NULL,
    confidence_score INT NOT NULL,
    market_mood      ENUM('Bullish', 'Bearish', 'Neutral') NOT NULL,
    reason_en        TEXT,
    reason_ar        TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
);

-- ─── Transactions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    stock_id        INT NULL,                                    -- NULL for DEPOSIT transactions
    type            ENUM('BUY', 'SELL', 'DEPOSIT') NOT NULL,
    status          ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'COMPLETED',
    quantity        DECIMAL(10, 4) NULL,                         -- NULL for DEPOSIT transactions
    price_per_share DECIMAL(10, 2) NULL,                         -- NULL for DEPOSIT transactions
    amount          DECIMAL(15, 2) NOT NULL,                     -- total cost or deposit amount
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE SET NULL
);

-- ─── Smart Automations ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smart_automations (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    stock_id      INT NOT NULL,
    action_type   ENUM('BUY', 'SELL') NOT NULL,
    trigger_price DECIMAL(10, 2) NOT NULL,
    quantity      DECIMAL(10, 4) NOT NULL,
    status        ENUM('PENDING', 'TRIGGERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
);

-- ─── Notification Settings ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_settings (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL UNIQUE,
    ai_alerts        BOOLEAN NOT NULL DEFAULT TRUE,
    price_volatility BOOLEAN NOT NULL DEFAULT TRUE,
    market_news      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
