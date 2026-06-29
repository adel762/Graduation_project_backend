-- ============================================================
--  Aura AI - Schema Extensions (Technical Audit)
--  Run AFTER the base schema.sql
--  MySQL 8.x Compatible
-- ============================================================

USE Auro;

-- ─── User Preferences ────────────────────────────────────────────────────────
-- Stores per-user investment profile settings (risk & goal).
CREATE TABLE IF NOT EXISTS user_preferences (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT NOT NULL UNIQUE,
    risk_tolerance ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
    primary_goal   ENUM('Growth', 'Dividends', 'Capital Preservation') NOT NULL DEFAULT 'Growth',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Blacklisted Tokens (Stateful Logout) ─────────────────────────────────────
-- Stores invalidated JWT tokens; checked on every protected request.
-- Expired tokens should be purged periodically via a scheduled cleanup job.
CREATE TABLE IF NOT EXISTS blacklisted_tokens (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    token      VARCHAR(512) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_expires_at (expires_at)  -- speeds up cleanup queries
);

-- ─── Already Existing Tables (Included for Audit Completeness) ────────────────

-- transactions: History of user trades (Buy, Sell) and deposits.
-- Already created in base schema.sql — shown here for reference.
/*
CREATE TABLE IF NOT EXISTS transactions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    stock_id        INT NULL,                                    -- NULL for DEPOSIT transactions
    type            ENUM('BUY', 'SELL', 'DEPOSIT') NOT NULL,
    status          ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'COMPLETED',
    quantity        DECIMAL(10, 4) NULL,
    price_per_share DECIMAL(10, 2) NULL,
    amount          DECIMAL(15, 2) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE SET NULL
);
*/

-- smart_automations: User-defined price triggers for BUY/SELL actions.
-- Already created in base schema.sql — shown here for reference.
/*
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
*/

-- notification_settings: User toggles for AI Alerts, Price Volatility, Market News.
-- Already created in base schema.sql — shown here for reference.
/*
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
*/
