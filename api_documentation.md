# Aura AI — API Documentation
**Base URL:** `http://localhost:3000`
**Version:** 1.0.0
**Content-Type:** `application/json` (all requests & responses)

---

## 🔐 Authentication

Protected endpoints require a **Bearer JWT token** in the `Authorization` header.

```
Authorization: Bearer <your_jwt_token>
```

Obtain a token via [Login](#2-login-user) or [OAuth](#3-oauth-login-googleapple).

---

## Table of Contents

| # | Module | Method | Endpoint |
|---|--------|--------|----------|
| 1 | Auth | `POST` | [`/api/users/register`](#1-register-user) |
| 2 | Auth | `POST` | [`/api/users/login`](#2-login-user) |
| 3 | Auth | `POST` | [`/api/users/oauth`](#3-oauth-login-googleapple) |
| 4 | Auth | `POST` | [`/api/users/deposit`](#4-deposit-funds-🔒-protected) |
| 5 | Market | `GET` | [`/api/market/stocks`](#5-get-all-stocks) |
| 6 | Market | `GET` | [`/api/market/stocks/:id`](#6-get-stock-by-id) |
| 7 | Portfolio | `GET` | [`/api/portfolio`](#7-get-user-portfolio--net-worth-🔒-protected) |
| 8 | Portfolio | `POST` | [`/api/portfolio/trade`](#8-execute-trade-buysel-🔒-protected) |
| 9 | Automations | `POST` | [`/api/automations`](#9-create-smart-automation-🔒-protected) |
| 10 | Automations | `GET` | [`/api/automations`](#10-get-user-automations-🔒-protected) |
| 11 | Notifications | `GET` | [`/api/notifications/settings`](#11-get-notification-settings-🔒-protected) |
| 12 | Notifications | `PUT` | [`/api/notifications/settings`](#12-update-notification-settings-🔒-protected) |

---

## 🔐 Auth Endpoints

---

### 1. Register User

Creates a new local user account with email/password.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | `/api/users/register` |
| **Authorization** | ❌ Not required |

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "username": "Ahmed Hassan",
  "email": "ahmed.hassan@example.com",
  "password": "SecurePass@123",
  "accepted_terms": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | `string` | ✅ | Display name of the user |
| `email` | `string` | ✅ | Unique email address |
| `password` | `string` | ✅ | Plaintext password (hashed server-side with bcrypt) |
| `accepted_terms` | `boolean` | ✅ | Must be `true` — registration blocked otherwise |

#### ✅ Success Response — `201 Created`
```json
{
  "message": "User registered successfully ✅",
  "user": {
    "id": 1,
    "username": "Ahmed Hassan",
    "email": "ahmed.hassan@example.com"
  }
}
```

#### ❌ Error Responses

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `400` | `accepted_terms` is `false` or missing | `{ "message": "You must accept the terms and conditions." }` |
| `400` | Email already registered | `{ "message": "Email already registered." }` |
| `400` | Missing required field | `{ "message": "notNull Violation: ..." }` |

---

### 2. Login User

Authenticates a local user and returns a JWT token.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | `/api/users/login` |
| **Authorization** | ❌ Not required |

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "ahmed.hassan@example.com",
  "password": "SecurePass@123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | ✅ | Registered email address |
| `password` | `string` | ✅ | Account password |

#### ✅ Success Response — `200 OK`
```json
{
  "message": "Login successful ✅",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "Ahmed Hassan",
    "email": "ahmed.hassan@example.com"
  }
}
```

> [!TIP]
> Store the returned `token` and pass it as `Authorization: Bearer <token>` on all protected endpoints.

#### ❌ Error Responses

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `401` | Email not found | `{ "message": "User not found." }` |
| `401` | Wrong password | `{ "message": "Invalid password." }` |
| `401` | OAuth account (no password) | `{ "message": "This account uses social login. Please use OAuth." }` |

---

### 3. OAuth Login (Google/Apple)

Logs in or auto-registers a user via a social provider. No password required.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | `/api/users/oauth` |
| **Authorization** | ❌ Not required |

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "username": "Sara Kamal",
  "email": "sara.kamal@gmail.com",
  "auth_provider": "google"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | `string` | ✅ | Display name from provider |
| `email` | `string` | ✅ | Email verified by provider |
| `auth_provider` | `string` | ✅ | Must be `"google"` or `"apple"` |

#### ✅ Success Response — `200 OK`
```json
{
  "message": "OAuth login successful ✅",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "Sara Kamal",
    "email": "sara.kamal@gmail.com"
  }
}
```

> [!NOTE]
> If the email doesn't exist yet, a new account is created automatically with `password_hash: null` and `accepted_terms: true`. Default notification settings are also created.

#### ❌ Error Responses

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `400` | `auth_provider` is not `google` or `apple` | `{ "message": "Invalid auth_provider. Must be \"google\" or \"apple\"." }` |
| `400` | Missing required field | `{ "message": "notNull Violation: ..." }` |

---

### 4. Deposit Funds 🔒 Protected

Adds funds to the authenticated user's trading wallet balance.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | `/api/users/deposit` |
| **Authorization** | ✅ Required — Bearer JWT token |

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Request Body
```json
{
  "amount": 50000.00
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | `number` | ✅ | Deposit amount in EGP. Must be greater than `0` |

#### ✅ Success Response — `200 OK`
```json
{
  "message": "Deposit successful ✅",
  "balance": 50000.00
}
```

#### ❌ Error Responses

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `401` | No or invalid token | `{ "message": "No token provided." }` |
| `401` | Expired token | `{ "message": "Invalid or expired token." }` |
| `400` | `amount` is `0` or negative | `{ "message": "Deposit amount must be greater than 0." }` |
| `400` | `amount` is missing | `{ "message": "Deposit amount must be greater than 0." }` |

---

## 📈 Market Endpoints

---

### 5. Get All Stocks

Returns all EGX-listed stocks with their **current price** and **latest AI signal**.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/api/market/stocks` |
| **Authorization** | ❌ Not required |

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
_None_

#### ✅ Success Response — `200 OK`
```json
{
  "message": "Stocks fetched successfully ✅",
  "count": 5,
  "data": [
    {
      "id": 1,
      "symbol": "COMI",
      "name_en": "Commercial International Bank",
      "name_ar": "البنك التجاري الدولي",
      "market_cap": "85.2B EGP",
      "pe_ratio": "7.42",
      "div_yield": "3.15",
      "avg_volume": "4.5M",
      "description_en": "CIB is Egypt's largest private-sector bank...",
      "description_ar": "البنك التجاري الدولي هو أكبر بنك خاص في مصر...",
      "prices": [
        {
          "current_price": "72.50",
          "change_percentage": "2.35",
          "is_positive": true,
          "updated_at": "2026-06-24T12:00:00.000Z"
        }
      ],
      "signals": [
        {
          "signal_type": "Strong Buy",
          "confidence_score": 88,
          "market_mood": "Bullish"
        }
      ]
    }
  ]
}
```

#### ❌ Error Responses

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `500` | Database error | `{ "message": "<error details>" }` |

---

### 6. Get Stock by ID

Returns full details for a single stock including bilingual descriptions, financials, current price, and the latest AI signal with reasons (EN/AR).

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/api/market/stocks/:id` |
| **Authorization** | ❌ Not required |

#### Request Headers
```
Content-Type: application/json
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `integer` | ✅ | The stock ID (e.g., `1` for COMI) |

#### Request Body
_None_

#### ✅ Success Response — `200 OK`
```json
{
  "message": "Stock details fetched successfully ✅",
  "data": {
    "id": 1,
    "symbol": "COMI",
    "name_en": "Commercial International Bank",
    "name_ar": "البنك التجاري الدولي",
    "market_cap": "85.2B EGP",
    "pe_ratio": "7.42",
    "div_yield": "3.15",
    "avg_volume": "4.5M",
    "description_en": "CIB is Egypt's largest private-sector bank by assets, offering retail, corporate, and investment banking services.",
    "description_ar": "البنك التجاري الدولي هو أكبر بنك خاص في مصر من حيث الأصول، ويقدم خدمات التجزئة والشركات والاستثمار.",
    "prices": [
      {
        "id": 1,
        "stock_id": 1,
        "current_price": "72.50",
        "change_percentage": "2.35",
        "is_positive": true,
        "updated_at": "2026-06-24T12:00:00.000Z"
      }
    ],
    "signals": [
      {
        "id": 1,
        "stock_id": 1,
        "signal_type": "Strong Buy",
        "confidence_score": 88,
        "market_mood": "Bullish",
        "reason_en": "Strong Q3 earnings, rising NIM, and positive sector momentum support an aggressive buy.",
        "reason_ar": "أرباح قوية للربع الثالث وارتفاع هامش صافي الفائدة وزخم القطاع الإيجابي يدعمان الشراء.",
        "created_at": "2026-06-24T12:00:00.000Z"
      }
    ]
  }
}
```

#### ❌ Error Responses

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `404` | Stock ID not found | `{ "message": "Stock not found." }` |

---

## 💼 Portfolio Endpoints

---

### 7. Get User Portfolio & Net Worth 🔒 Protected

Returns the authenticated user's holdings with dynamically calculated current values, profit/loss per stock, and overall net worth.

> **Net Worth Formula:**
> `Net Worth = Wallet Balance + Σ (quantity × current_price)`

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/api/portfolio` |
| **Authorization** | ✅ Required — Bearer JWT token |

#### Request Headers
```
Authorization: Bearer <token>
```

#### Request Body
_None_

#### ✅ Success Response — `200 OK`
```json
{
  "message": "Portfolio fetched ✅",
  "data": {
    "wallet_balance": 49275.00,
    "stocks_value": 725.00,
    "net_worth": 50000.00,
    "holdings": [
      {
        "id": 1,
        "stock": {
          "id": 1,
          "symbol": "COMI",
          "name_en": "Commercial International Bank",
          "name_ar": "البنك التجاري الدولي",
          "prices": [
            {
              "current_price": "72.50",
              "change_percentage": "2.35",
              "is_positive": true
            }
          ]
        },
        "quantity": 10,
        "average_buy_price": 72.50,
        "current_price": 72.50,
        "current_value": 725.00,
        "profit_loss": 0.00,
        "profit_loss_pct": 0.00
      }
    ]
  }
}
```

| Response Field | Description |
|----------------|-------------|
| `wallet_balance` | Uninvested cash in EGP |
| `stocks_value` | Total current market value of all holdings |
| `net_worth` | `wallet_balance + stocks_value` |
| `holdings[].current_value` | `quantity × current_price` |
| `holdings[].profit_loss` | `current_value - (quantity × average_buy_price)` |
| `holdings[].profit_loss_pct` | Percentage gain/loss relative to cost basis |

#### ❌ Error Responses

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `401` | Missing/invalid token | `{ "message": "No token provided." }` |
| `500` | Database error | `{ "message": "<error details>" }` |

---

### 8. Execute Trade (BUY/SELL) 🔒 Protected

Executes a stock trade atomically. Updates wallet balance, portfolio holdings, and records a transaction — all in a single database transaction.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | `/api/portfolio/trade` |
| **Authorization** | ✅ Required — Bearer JWT token |

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Request Body
```json
{
  "stock_id": 1,
  "type": "BUY",
  "quantity": 10
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `stock_id` | `integer` | ✅ | ID of the stock to buy/sell |
| `type` | `string` | ✅ | `"BUY"` or `"SELL"` |
| `quantity` | `number` | ✅ | Number of shares. Must be greater than `0` |

#### ✅ Success Response — `200 OK` (BUY)
```json
{
  "message": "BUY executed successfully ✅",
  "data": {
    "type": "BUY",
    "stock": {
      "id": 1,
      "symbol": "COMI",
      "name_en": "Commercial International Bank"
    },
    "quantity": 10,
    "price_per_share": 72.50,
    "total_amount": 725.00,
    "new_balance": 49275.00
  }
}
```

#### ✅ Success Response — `200 OK` (SELL)
```json
{
  "message": "SELL executed successfully ✅",
  "data": {
    "type": "SELL",
    "stock": {
      "id": 1,
      "symbol": "COMI",
      "name_en": "Commercial International Bank"
    },
    "quantity": 5,
    "price_per_share": 72.50,
    "total_amount": 362.50,
    "new_balance": 49637.50
  }
}
```

#### BUY Logic
1. Validates user has sufficient `balance` ≥ `quantity × current_price`
2. Deducts total cost from user `balance`
3. Creates or updates portfolio holding (recalculates `average_buy_price`)
4. Inserts a `COMPLETED` `BUY` transaction record

#### SELL Logic
1. Validates user owns the stock and has enough shares
2. Credits `quantity × current_price` to user `balance`
3. Reduces or removes portfolio holding
4. Inserts a `COMPLETED` `SELL` transaction record

#### ❌ Error Responses

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `401` | Missing/invalid token | `{ "message": "No token provided." }` |
| `400` | `type` is not `BUY` or `SELL` | `{ "message": "type must be BUY or SELL." }` |
| `400` | `quantity` ≤ 0 | `{ "message": "quantity must be greater than 0." }` |
| `400` | Stock ID not found | `{ "message": "Stock not found." }` |
| `400` | No price data for stock | `{ "message": "No price data available for this stock." }` |
| `400` | BUY — insufficient balance | `{ "message": "Insufficient balance. Required: 725.00 EGP, Available: 100.00 EGP." }` |
| `400` | SELL — stock not in portfolio | `{ "message": "You do not own this stock." }` |
| `400` | SELL — not enough shares | `{ "message": "Insufficient shares. You own 3.0000, trying to sell 10." }` |

---

## ⚙️ Automations Endpoints

---

### 9. Create Smart Automation 🔒 Protected

Creates a new price-triggered automation rule. When the stock reaches the `trigger_price`, the system will execute the defined `BUY` or `SELL` action.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | `/api/automations` |
| **Authorization** | ✅ Required — Bearer JWT token |

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Request Body
```json
{
  "stock_id": 1,
  "action_type": "BUY",
  "trigger_price": 68.00,
  "quantity": 20
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `stock_id` | `integer` | ✅ | ID of the target stock |
| `action_type` | `string` | ✅ | `"BUY"` or `"SELL"` |
| `trigger_price` | `number` | ✅ | Price in EGP at which the action triggers. Must be > `0` |
| `quantity` | `number` | ✅ | Number of shares to trade when triggered. Must be > `0` |

#### ✅ Success Response — `201 Created`
```json
{
  "message": "Automation created ✅",
  "data": {
    "id": 1,
    "user_id": 1,
    "stock_id": 1,
    "action_type": "BUY",
    "trigger_price": "68.00",
    "quantity": "20.0000",
    "status": "PENDING",
    "created_at": "2026-06-24T12:30:00.000Z",
    "updated_at": "2026-06-24T12:30:00.000Z"
  }
}
```

| `status` value | Meaning |
|----------------|---------|
| `PENDING` | Waiting for price to reach trigger |
| `TRIGGERED` | Rule has been executed |
| `CANCELLED` | Manually cancelled by user |

#### ❌ Error Responses

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `401` | Missing/invalid token | `{ "message": "No token provided." }` |
| `400` | Stock ID not found | `{ "message": "Stock not found." }` |
| `400` | `action_type` invalid | `{ "message": "action_type must be BUY or SELL." }` |
| `400` | `trigger_price` ≤ 0 | `{ "message": "trigger_price must be greater than 0." }` |
| `400` | `quantity` ≤ 0 | `{ "message": "quantity must be greater than 0." }` |

---

### 10. Get User Automations 🔒 Protected

Returns all automation rules created by the authenticated user, including the associated stock details.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/api/automations` |
| **Authorization** | ✅ Required — Bearer JWT token |

#### Request Headers
```
Authorization: Bearer <token>
```

#### Request Body
_None_

#### ✅ Success Response — `200 OK`
```json
{
  "message": "Automations fetched ✅",
  "count": 1,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "stock_id": 1,
      "action_type": "BUY",
      "trigger_price": "68.00",
      "quantity": "20.0000",
      "status": "PENDING",
      "created_at": "2026-06-24T12:30:00.000Z",
      "updated_at": "2026-06-24T12:30:00.000Z",
      "stock": {
        "id": 1,
        "symbol": "COMI",
        "name_en": "Commercial International Bank",
        "name_ar": "البنك التجاري الدولي"
      }
    }
  ]
}
```

#### ❌ Error Responses

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `401` | Missing/invalid token | `{ "message": "No token provided." }` |
| `500` | Database error | `{ "message": "<error details>" }` |

---

## 🔔 Notifications Endpoints

---

### 11. Get Notification Settings 🔒 Protected

Returns the authenticated user's notification preferences. If no preferences exist yet, defaults (`all enabled`) are auto-created.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/api/notifications/settings` |
| **Authorization** | ✅ Required — Bearer JWT token |

#### Request Headers
```
Authorization: Bearer <token>
```

#### Request Body
_None_

#### ✅ Success Response — `200 OK`
```json
{
  "message": "Notification settings fetched ✅",
  "data": {
    "id": 1,
    "user_id": 1,
    "ai_alerts": true,
    "price_volatility": true,
    "market_news": true,
    "created_at": "2026-06-24T12:00:00.000Z",
    "updated_at": "2026-06-24T12:00:00.000Z"
  }
}
```

| Field | Default | Description |
|-------|---------|-------------|
| `ai_alerts` | `true` | Notifications for XGBoost AI buy/sell signals |
| `price_volatility` | `true` | Notifications for significant price movements |
| `market_news` | `true` | Notifications for EGX market news updates |

#### ❌ Error Responses

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `401` | Missing/invalid token | `{ "message": "No token provided." }` |
| `500` | Database error | `{ "message": "<error details>" }` |

---

### 12. Update Notification Settings 🔒 Protected

Updates one or more notification preferences for the authenticated user. Only fields provided in the request body are updated (partial update supported).

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **URL** | `/api/notifications/settings` |
| **Authorization** | ✅ Required — Bearer JWT token |

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Request Body
```json
{
  "ai_alerts": true,
  "price_volatility": false,
  "market_news": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ai_alerts` | `boolean` | ❌ Optional | Enable/disable AI signal notifications |
| `price_volatility` | `boolean` | ❌ Optional | Enable/disable price movement alerts |
| `market_news` | `boolean` | ❌ Optional | Enable/disable market news notifications |

> [!NOTE]
> At least one field should be provided. All three fields are optional — only provided fields are updated.

#### ✅ Success Response — `200 OK`
```json
{
  "message": "Notification settings updated ✅",
  "data": {
    "id": 1,
    "user_id": 1,
    "ai_alerts": true,
    "price_volatility": false,
    "market_news": true,
    "created_at": "2026-06-24T12:00:00.000Z",
    "updated_at": "2026-06-24T13:00:00.000Z"
  }
}
```

#### ❌ Error Responses

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `401` | Missing/invalid token | `{ "message": "No token provided." }` |
| `400` | Invalid field value (non-boolean) | `{ "message": "<sequelize validation error>" }` |

---

## 🌐 Global Responses

These responses can be returned by **any endpoint**:

| Status | Condition | Response Body |
|--------|-----------|---------------|
| `401` | No token on a protected route | `{ "message": "No token provided." }` |
| `401` | Token is expired or malformed | `{ "message": "Invalid or expired token." }` |
| `401` | Token is valid but user was deleted | `{ "message": "User not found." }` |
| `404` | Route does not exist | `{ "message": "Route not found ❌" }` |

---

## 📊 Database Models Reference

```
users               → id, username, email, password_hash, balance, accepted_terms, auth_provider, created_at
stocks              → id, symbol, name_en, name_ar, market_cap, pe_ratio, div_yield, avg_volume, description_en, description_ar
stock_prices        → id, stock_id (FK), current_price, change_percentage, is_positive, updated_at
user_portfolio      → id, user_id (FK), stock_id (FK), quantity, average_buy_price, created_at, updated_at
ai_signals          → id, stock_id (FK), signal_type, confidence_score, market_mood, reason_en, reason_ar, created_at
transactions        → id, user_id (FK), stock_id (FK nullable), type, status, quantity, price_per_share, amount, created_at
smart_automations   → id, user_id (FK), stock_id (FK), action_type, trigger_price, quantity, status, created_at, updated_at
notification_settings → id, user_id (FK unique), ai_alerts, price_volatility, market_news, created_at, updated_at
```

---

## 🚀 Quick Start

```bash
# 1. Start the server
npm run dev

# 2. Seed mock EGX data (run once)
npm run seed

# 3. Register a user
POST /api/users/register

# 4. Login and copy the returned token
POST /api/users/login

# 5. Deposit funds
POST /api/users/deposit   →  Authorization: Bearer <token>

# 6. Browse stocks
GET /api/market/stocks

# 7. Buy a stock
POST /api/portfolio/trade   →  Authorization: Bearer <token>
```
