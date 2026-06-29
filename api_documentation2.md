# Aura AI — Complete API Documentation
**Base URL:** `http://localhost:3000`
**Version:** `2.0.0`
**Content-Type:** `application/json` (all requests & responses)

---

## 🔐 Authentication Standard

All protected endpoints require a **Bearer JWT token** in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

> [!IMPORTANT]
> **Strict Response Format (v2.0.0):** Every endpoint — success or failure — returns this exact JSON envelope:
> ```json
> { "success": true | false, "data": { ... } | null, "message": "..." }
> ```

> [!TIP]
> After calling **Login** or **OAuth**, copy the `token` from the response and use it as `Authorization: Bearer <token>` on every 🔒 protected endpoint.

> [!NOTE]
> **Stateful Logout:** Once `POST /api/auth/logout` is called, the token is permanently invalidated in the database. Any subsequent request using the same token returns `401`.

---

## Table of Contents

| # | Module | Method | Endpoint | Auth |
|---|--------|--------|----------|------|
| 1 | Users | `POST` | [`/api/users/register`](#1-register-user) | ❌ |
| 2 | Users | `POST` | [`/api/users/login`](#2-login-user) | ❌ |
| 3 | Users | `POST` | [`/api/users/oauth`](#3-oauth-login-googleapple) | ❌ |
| 4 | Users | `POST` | [`/api/users/deposit`](#4-deposit-funds) | 🔒 |
| 5 | Auth | `GET` | [`/api/auth/me`](#5-get-current-user-profile) | 🔒 |
| 6 | Auth | `POST` | [`/api/auth/logout`](#6-logout) | 🔒 |
| 7 | User Preferences | `POST` | [`/api/user/preferences`](#7-set-investment-preferences) | 🔒 |
| 8 | User Preferences | `GET` | [`/api/user/preferences`](#8-get-investment-preferences) | 🔒 |
| 9 | Market | `GET` | [`/api/market/stocks`](#9-get-all-stocks-paginated) | ❌ |
| 10 | Market | `GET` | [`/api/market/stocks/:id`](#10-get-stock-by-id-full-details) | ❌ |
| 11 | Market | `GET` | [`/api/market/search`](#11-search-stocks) | ❌ |
| 12 | Market | `GET` | [`/api/market/compare`](#12-compare-two-stocks) | ❌ |
| 13 | Portfolio | `GET` | [`/api/portfolio`](#13-get-portfolio--metrics) | 🔒 |
| 14 | Portfolio | `POST` | [`/api/portfolio/trade`](#14-execute-trade-buysell) | 🔒 |
| 15 | Automations | `POST` | [`/api/automations`](#15-create-smart-automation) | 🔒 |
| 16 | Automations | `GET` | [`/api/automations`](#16-list-user-automations-paginated) | 🔒 |
| 17 | Automations | `GET` | [`/api/automations/:id`](#17-get-single-automation) | 🔒 |
| 18 | Automations | `PATCH` | [`/api/automations/:id`](#18-update-automation) | 🔒 |
| 19 | Automations | `DELETE` | [`/api/automations/:id`](#19-delete-automation) | 🔒 |
| 20 | Notifications | `GET` | [`/api/notifications/settings`](#20-get-notification-settings) | 🔒 |
| 21 | Notifications | `PUT` | [`/api/notifications/settings`](#21-update-notification-settings) | 🔒 |

---

## 👤 User Endpoints (`/api/users`)

---

### 1. Register User

Creates a new local user account with email/password. Auto-creates default notification settings.

| Property | Value |
|---|---|
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
|---|---|---|---|
| `username` | `string` | ✅ | Display name of the user |
| `email` | `string` | ✅ | Unique email address |
| `password` | `string` | ✅ | Plaintext password — hashed with `bcrypt` (10 rounds) |
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

| Status | Condition | `message` |
|---|---|---|
| `400` | `accepted_terms` is `false` or missing | `"You must accept the terms and conditions."` |
| `400` | Email already registered | `"Email already registered."` |
| `400` | Missing required field | `"notNull Violation: ..."` |

---

### 2. Login User

Authenticates a local user and returns a signed JWT token valid for 10 days.

| Property | Value |
|---|---|
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
|---|---|---|---|
| `email` | `string` | ✅ | Registered email address |
| `password` | `string` | ✅ | Account password |

#### ✅ Success Response — `200 OK`
```json
{
  "message": "Login successful ✅",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJBaG1lZCBIYXNzYW4iLCJlbWFpbCI6ImFobWVkLmhhc3NhbkBleGFtcGxlLmNvbSIsImlhdCI6MTc1MTA3MDI2MSwiZXhwIjoxNzUxOTM0MjYxfQ.abc123",
  "user": {
    "id": 1,
    "username": "Ahmed Hassan",
    "email": "ahmed.hassan@example.com"
  }
}
```

#### ❌ Error Responses

| Status | Condition | `message` |
|---|---|---|
| `401` | Email not found | `"User not found."` |
| `401` | Wrong password | `"Invalid password."` |
| `401` | OAuth account (no password set) | `"This account uses social login. Please use OAuth."` |

---

### 3. OAuth Login (Google/Apple)

Logs in or auto-registers a user via a social provider. No password required. Auto-creates default notification settings for new users.

| Property | Value |
|---|---|
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
|---|---|---|---|
| `username` | `string` | ✅ | Display name from the social provider |
| `email` | `string` | ✅ | Email verified by the provider |
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
> If the email is new, a user account is auto-created with `password_hash: null`, `accepted_terms: true`, and default notification settings.

#### ❌ Error Responses

| Status | Condition | `message` |
|---|---|---|
| `400` | `auth_provider` is not `google` or `apple` | `"Invalid auth_provider. Must be \"google\" or \"apple\"."` |
| `400` | Missing required field | `"notNull Violation: ..."` |

---

### 4. Deposit Funds 🔒

Adds funds (EGP) to the authenticated user's trading wallet balance. Also creates a `DEPOSIT` transaction record.

| Property | Value |
|---|---|
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
|---|---|---|---|
| `amount` | `number` | ✅ | Deposit amount in EGP. Must be `> 0` |

#### ✅ Success Response — `200 OK`
```json
{
  "message": "Deposit successful ✅",
  "balance": 50000.00
}
```

#### ❌ Error Responses

| Status | Condition | `message` |
|---|---|---|
| `401` | No or invalid token | `"No token provided."` |
| `401` | Token blacklisted (after logout) | `"Token has been invalidated. Please log in again."` |
| `401` | Expired token | `"Invalid or expired token."` |
| `400` | `amount` ≤ 0 or missing | `"Deposit amount must be greater than 0."` |

---

## 🔑 Auth Endpoints (`/api/auth`)

---

### 5. Get Current User Profile 🔒

Returns the authenticated user's full profile including their saved investment preferences.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/auth/me` |
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
  "success": true,
  "data": {
    "id": 1,
    "username": "Ahmed Hassan",
    "email": "ahmed.hassan@example.com",
    "balance": "49275.00",
    "accepted_terms": true,
    "auth_provider": "local",
    "preferences": {
      "risk_tolerance": "High",
      "primary_goal": "Growth"
    }
  },
  "message": "User profile fetched successfully."
}
```

> [!NOTE]
> `password_hash` is excluded from this response for security. `preferences` will be `null` if the user has not yet set them.

#### ❌ Error Responses

| Status | Condition | Response |
|---|---|---|
| `401` | No or invalid token | `{ "success": false, "data": null, "message": "No token provided." }` |
| `401` | Blacklisted token | `{ "success": false, "data": null, "message": "Token has been invalidated. Please log in again." }` |
| `404` | User deleted from DB | `{ "success": false, "data": null, "message": "User not found." }` |

---

### 6. Logout 🔒

Invalidates the current JWT token by inserting it into the `blacklisted_tokens` table. Any future request using this token returns `401`.

| Property | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/auth/logout` |
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
  "success": true,
  "data": null,
  "message": "Logged out successfully. Token has been invalidated."
}
```

> [!CAUTION]
> After calling this endpoint, the token is **permanently invalidated** in the database. The user must log in again to get a new valid token.

#### ❌ Error Responses

| Status | Condition | Response |
|---|---|---|
| `401` | No or invalid token | `{ "success": false, "data": null, "message": "No token provided." }` |
| `400` | Invalid token payload (cannot decode) | `{ "success": false, "data": null, "message": "Invalid token payload." }` |

---

## ⚙️ User Preferences (`/api/user`)

---

### 7. Set Investment Preferences 🔒

Creates or updates the authenticated user's investment profile — risk tolerance and primary goal. Supports partial updates.

| Property | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/user/preferences` |
| **Authorization** | ✅ Required — Bearer JWT token |

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

#### Request Body
```json
{
  "risk_tolerance": "High",
  "primary_goal": "Growth"
}
```

| Field | Type | Required | Allowed Values |
|---|---|---|---|
| `risk_tolerance` | `string` | ❌ Optional | `"Low"`, `"Medium"`, `"High"` |
| `primary_goal` | `string` | ❌ Optional | `"Growth"`, `"Dividends"`, `"Capital Preservation"` |

> [!NOTE]
> At least one field should be provided. If no preferences record exists yet, one is created with the provided values and defaults for missing fields.

#### ✅ Success Response — `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "risk_tolerance": "High",
    "primary_goal": "Growth",
    "created_at": "2026-06-28T00:00:00.000Z",
    "updated_at": "2026-06-28T00:10:00.000Z"
  },
  "message": "Investment preferences saved successfully."
}
```

#### ❌ Error Responses

| Status | Condition | Response |
|---|---|---|
| `401` | No or invalid token | `{ "success": false, "data": null, "message": "No token provided." }` |
| `400` | Invalid `risk_tolerance` value | `{ "success": false, "data": null, "message": "Invalid risk_tolerance. Must be one of: Low, Medium, High." }` |
| `400` | Invalid `primary_goal` value | `{ "success": false, "data": null, "message": "Invalid primary_goal. Must be one of: Growth, Dividends, Capital Preservation." }` |

---

### 8. Get Investment Preferences 🔒

Returns the authenticated user's current investment preferences. If none exist, auto-creates and returns defaults (`Medium` risk, `Growth` goal).

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/user/preferences` |
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
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "risk_tolerance": "High",
    "primary_goal": "Growth",
    "created_at": "2026-06-28T00:00:00.000Z",
    "updated_at": "2026-06-28T00:10:00.000Z"
  },
  "message": "Investment preferences fetched successfully."
}
```

| `risk_tolerance` | Meaning |
|---|---|
| `Low` | Conservative — prefers capital preservation over growth |
| `Medium` | Balanced — accepts moderate risk for moderate returns |
| `High` | Aggressive — accepts high risk for high potential returns |

| `primary_goal` | Meaning |
|---|---|
| `Growth` | Maximize capital appreciation |
| `Dividends` | Prioritize dividend-paying stocks |
| `Capital Preservation` | Protect existing capital from loss |

#### ❌ Error Responses

| Status | Condition | Response |
|---|---|---|
| `401` | No or invalid token | `{ "success": false, "data": null, "message": "No token provided." }` |
| `500` | Database error | `{ "success": false, "data": null, "message": "<error details>" }` |

---

## 📈 Market Endpoints (`/api/market`)

---

### 9. Get All Stocks (Paginated)

Returns all EGX-listed stocks with their **latest price** and **latest AI signal**. Supports pagination.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/market/stocks` |
| **Authorization** | ❌ Not required |

#### Request Headers
```
Content-Type: application/json
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `limit` | `integer` | ❌ | `20` | Max number of stocks to return |
| `offset` | `integer` | ❌ | `0` | Number of records to skip (for pagination) |

#### Request Body
_None_

#### ✅ Success Response — `200 OK`
```json
{
  "success": true,
  "data": {
    "total": 5,
    "limit": 20,
    "offset": 0,
    "stocks": [
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
            "updated_at": "2026-06-28T00:00:00.000Z"
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
  },
  "message": "Stocks fetched successfully."
}
```

| Response Field | Description |
|---|---|
| `data.total` | Total number of stocks in the database |
| `data.limit` | The applied page size |
| `data.offset` | The applied skip offset |
| `data.stocks` | Array of stock objects for this page |

#### ❌ Error Responses

| Status | Condition | Response |
|---|---|---|
| `500` | Database error | `{ "success": false, "data": null, "message": "<error details>" }` |

---

### 10. Get Stock by ID (Full Details)

Returns complete details for a single stock: bilingual descriptions, financials, **full price history**, and **full AI signal history**.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/market/stocks/:id` |
| **Authorization** | ❌ Not required |

#### Request Headers
```
Content-Type: application/json
```

#### URL Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `integer` | ✅ | The numeric stock ID |

#### Request Body
_None_

#### ✅ Success Response — `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "symbol": "COMI",
    "name_en": "Commercial International Bank",
    "name_ar": "البنك التجاري الدولي",
    "market_cap": "85.2B EGP",
    "pe_ratio": "7.42",
    "div_yield": "3.15",
    "avg_volume": "4.5M",
    "description_en": "CIB is Egypt's largest private-sector bank by assets...",
    "description_ar": "البنك التجاري الدولي هو أكبر بنك خاص في مصر من حيث الأصول...",
    "prices": [
      {
        "id": 2,
        "current_price": "73.10",
        "change_percentage": "0.83",
        "is_positive": true,
        "updated_at": "2026-06-28T10:00:00.000Z"
      },
      {
        "id": 1,
        "current_price": "72.50",
        "change_percentage": "2.35",
        "is_positive": true,
        "updated_at": "2026-06-27T10:00:00.000Z"
      }
    ],
    "signals": [
      {
        "id": 2,
        "signal_type": "Strong Buy",
        "confidence_score": 91,
        "market_mood": "Bullish",
        "reason_en": "Continued NIM expansion and solid Q3 earnings beat expectations.",
        "reason_ar": "استمرار توسع صافي هامش الفائدة وأرباح الربع الثالث تتجاوز التوقعات.",
        "created_at": "2026-06-28T08:00:00.000Z"
      },
      {
        "id": 1,
        "signal_type": "Strong Buy",
        "confidence_score": 88,
        "market_mood": "Bullish",
        "reason_en": "Strong Q3 earnings and positive sector momentum.",
        "reason_ar": "أرباح قوية للربع الثالث وزخم القطاع الإيجابي.",
        "created_at": "2026-06-27T08:00:00.000Z"
      }
    ]
  },
  "message": "Stock details fetched successfully."
}
```

> [!NOTE]
> Unlike `GET /api/market/stocks`, this endpoint returns the **complete** `prices` and `signals` arrays (not just the latest one), ordered newest-first.

#### ❌ Error Responses

| Status | Condition | Response |
|---|---|---|
| `404` | Stock ID not found | `{ "success": false, "data": null, "message": "Stock not found." }` |

---

### 11. Search Stocks

Searches stocks by symbol, English name, or Arabic name using a case-insensitive partial match (`LIKE %query%`). Supports pagination.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/market/search` |
| **Authorization** | ❌ Not required |

#### Request Headers
```
Content-Type: application/json
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `query` | `string` | ✅ | — | Search term (symbol, English name, or Arabic name) |
| `limit` | `integer` | ❌ | `20` | Max number of results |
| `offset` | `integer` | ❌ | `0` | Number of records to skip |

#### Request Body
_None_

#### ✅ Success Response — `200 OK` (English search: `?query=CIB`)
```json
{
  "success": true,
  "data": {
    "total": 1,
    "limit": 20,
    "offset": 0,
    "stocks": [
      {
        "id": 1,
        "symbol": "COMI",
        "name_en": "Commercial International Bank",
        "name_ar": "البنك التجاري الدولي",
        "prices": [{ "current_price": "72.50", "change_percentage": "2.35", "is_positive": true }],
        "signals": [{ "signal_type": "Strong Buy", "confidence_score": 88, "market_mood": "Bullish" }]
      }
    ]
  },
  "message": "Search results for \"CIB\"."
}
```

#### ✅ Success Response — `200 OK` (Arabic search: `?query=بنك`)
```json
{
  "success": true,
  "data": {
    "total": 1,
    "limit": 20,
    "offset": 0,
    "stocks": [
      {
        "id": 1,
        "symbol": "COMI",
        "name_en": "Commercial International Bank",
        "name_ar": "البنك التجاري الدولي",
        "prices": [{ "current_price": "72.50", "change_percentage": "2.35", "is_positive": true }],
        "signals": [{ "signal_type": "Strong Buy", "confidence_score": 88, "market_mood": "Bullish" }]
      }
    ]
  },
  "message": "Search results for \"بنك\"."
}
```

#### ❌ Error Responses

| Status | Condition | Response |
|---|---|---|
| `400` | `query` param missing or empty | `{ "success": false, "data": null, "message": "Search query cannot be empty." }` |

---

### 12. Compare Two Stocks

Returns a side-by-side comparison object for two stocks identified by symbol — each with full metadata, latest price, and latest AI signal.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/market/compare` |
| **Authorization** | ❌ Not required |

#### Request Headers
```
Content-Type: application/json
```

#### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `s1` | `string` | ✅ | First stock symbol (e.g., `COMI`) |
| `s2` | `string` | ✅ | Second stock symbol (e.g., `TMGH`) |

#### Request Body
_None_

#### ✅ Success Response — `200 OK` (`?s1=COMI&s2=TMGH`)
```json
{
  "success": true,
  "data": {
    "stock_1": {
      "id": 1,
      "symbol": "COMI",
      "name_en": "Commercial International Bank",
      "name_ar": "البنك التجاري الدولي",
      "market_cap": "85.2B EGP",
      "pe_ratio": "7.42",
      "div_yield": "3.15",
      "avg_volume": "4.5M",
      "prices": [{ "current_price": "72.50", "change_percentage": "2.35", "is_positive": true, "updated_at": "2026-06-28T00:00:00.000Z" }],
      "signals": [{ "signal_type": "Strong Buy", "confidence_score": 88, "market_mood": "Bullish", "reason_en": "...", "reason_ar": "..." }]
    },
    "stock_2": {
      "id": 2,
      "symbol": "TMGH",
      "name_en": "Talaat Moustafa Group Holding",
      "name_ar": "مجموعة طلعت مصطفى القابضة",
      "market_cap": "42.7B EGP",
      "pe_ratio": "12.30",
      "div_yield": "1.80",
      "avg_volume": "3.1M",
      "prices": [{ "current_price": "22.80", "change_percentage": "-1.12", "is_positive": false, "updated_at": "2026-06-28T00:00:00.000Z" }],
      "signals": [{ "signal_type": "Hold", "confidence_score": 62, "market_mood": "Neutral", "reason_en": "...", "reason_ar": "..." }]
    }
  },
  "message": "Comparison between COMI and TMGH."
}
```

#### ❌ Error Responses

| Status | Condition | Response |
|---|---|---|
| `400` | `s1` or `s2` is missing | `{ "success": false, "data": null, "message": "Both s1 and s2 query parameters are required." }` |
| `400` | `s1` and `s2` are the same symbol | `{ "success": false, "data": null, "message": "s1 and s2 must be different stock symbols." }` |
| `400` | Symbol not found in database | `{ "success": false, "data": null, "message": "Stock with symbol \"XYZ\" not found." }` |

---

## 💼 Portfolio Endpoints (`/api/portfolio`)

---

### 13. Get Portfolio & Metrics 🔒

Returns the authenticated user's holdings alongside dynamically calculated **aggregate portfolio metrics** and pagination. All calculations happen in real-time on the server.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/portfolio` |
| **Authorization** | ✅ Required — Bearer JWT token |

#### Request Headers
```
Authorization: Bearer <token>
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `limit` | `integer` | ❌ | `50` | Max number of holdings to return |
| `offset` | `integer` | ❌ | `0` | Number of holdings to skip |

#### Request Body
_None_

#### ✅ Success Response — `200 OK`
```json
{
  "success": true,
  "data": {
    "summary": {
      "wallet_balance": 49275.00,
      "total_investment": 725.00,
      "current_stocks_value": 731.00,
      "total_profit_loss": 6.00,
      "total_profit_loss_pct": 0.83,
      "net_worth": 50006.00
    },
    "pagination": {
      "total": 1,
      "limit": 50,
      "offset": 0
    },
    "holdings": [
      {
        "id": 1,
        "stock": {
          "id": 1,
          "symbol": "COMI",
          "name_en": "Commercial International Bank",
          "name_ar": "البنك التجاري الدولي",
          "prices": [{ "current_price": "73.10", "change_percentage": "0.83", "is_positive": true }]
        },
        "quantity": 10,
        "average_buy_price": 72.50,
        "current_price": 73.10,
        "cost_basis": 725.00,
        "current_value": 731.00,
        "profit_loss": 6.00,
        "profit_loss_pct": 0.83
      }
    ]
  },
  "message": "Portfolio fetched successfully."
}
```

| `summary` Field | Formula |
|---|---|
| `wallet_balance` | Uninvested cash in EGP |
| `total_investment` | $\sum (\text{qty} \times \text{avg\_buy\_price})$ across all holdings |
| `current_stocks_value` | $\sum (\text{qty} \times \text{current\_price})$ across all holdings |
| `total_profit_loss` | `current_stocks_value - total_investment` |
| `total_profit_loss_pct` | $\frac{\text{total\_profit\_loss}}{\text{total\_investment}} \times 100$ |
| `net_worth` | `wallet_balance + current_stocks_value` |

#### ❌ Error Responses

| Status | Condition | Response |
|---|---|---|
| `401` | No or invalid token | `{ "success": false, "data": null, "message": "No token provided." }` |
| `401` | Blacklisted token | `{ "success": false, "data": null, "message": "Token has been invalidated. Please log in again." }` |
| `500` | Database error | `{ "success": false, "data": null, "message": "<error details>" }` |

---

### 14. Execute Trade (BUY/SELL) 🔒

Executes an atomic stock trade. All three operations — balance update, portfolio update, transaction record — succeed together or fail together.

| Property | Value |
|---|---|
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
|---|---|---|---|
| `stock_id` | `integer` | ✅ | ID of the stock to trade |
| `type` | `string` | ✅ | `"BUY"` or `"SELL"` |
| `quantity` | `number` | ✅ | Number of shares. Must be `> 0` |

#### ✅ Success Response — `200 OK` (BUY)
```json
{
  "success": true,
  "data": {
    "type": "BUY",
    "stock": { "id": 1, "symbol": "COMI", "name_en": "Commercial International Bank" },
    "quantity": 10,
    "price_per_share": 72.50,
    "total_amount": 725.00,
    "new_balance": 49275.00
  },
  "message": "BUY trade executed successfully."
}
```

#### ✅ Success Response — `200 OK` (SELL)
```json
{
  "success": true,
  "data": {
    "type": "SELL",
    "stock": { "id": 1, "symbol": "COMI", "name_en": "Commercial International Bank" },
    "quantity": 5,
    "price_per_share": 72.50,
    "total_amount": 362.50,
    "new_balance": 49637.50
  },
  "message": "SELL trade executed successfully."
}
```

#### BUY Logic
1. Lock user row (prevents race conditions)
2. Validate `balance >= quantity × current_price`
3. Deduct total cost from `balance`
4. Upsert portfolio holding (recalculates weighted `average_buy_price`)
5. Insert `COMPLETED BUY` transaction record

#### SELL Logic
1. Validate user owns the stock with sufficient shares
2. Credit `quantity × current_price` to `balance`
3. Reduce or remove portfolio holding
4. Insert `COMPLETED SELL` transaction record

#### ❌ Error Responses

| Status | Condition | Response |
|---|---|---|
| `401` | No or invalid token | `{ "success": false, "data": null, "message": "No token provided." }` |
| `400` | `type` not `BUY` or `SELL` | `{ "success": false, "data": null, "message": "type must be BUY or SELL." }` |
| `400` | `quantity` ≤ 0 | `{ "success": false, "data": null, "message": "quantity must be greater than 0." }` |
| `400` | Stock not found | `{ "success": false, "data": null, "message": "Stock not found." }` |
| `400` | No price data | `{ "success": false, "data": null, "message": "No price data available for this stock." }` |
| `400` | BUY — insufficient balance | `{ "success": false, "data": null, "message": "Insufficient balance. Required: 725.00 EGP, Available: 100.00 EGP." }` |
| `400` | SELL — stock not in portfolio | `{ "success": false, "data": null, "message": "You do not own this stock." }` |
| `400` | SELL — not enough shares | `{ "success": false, "data": null, "message": "Insufficient shares. You own 3.0000, trying to sell 10." }` |

---

## ⚙️ Automations Endpoints (`/api/automations`)

---

### 15. Create Smart Automation 🔒

Creates a new price-triggered automation rule with `PENDING` status. When the stock price reaches `trigger_price`, the system executes the defined action.

| Property | Value |
|---|---|
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
|---|---|---|---|
| `stock_id` | `integer` | ✅ | Target stock ID |
| `action_type` | `string` | ✅ | `"BUY"` or `"SELL"` |
| `trigger_price` | `number` | ✅ | Price in EGP to trigger the action. Must be `> 0` |
| `quantity` | `number` | ✅ | Shares to trade at trigger. Must be `> 0` |

#### ✅ Success Response — `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "stock_id": 1,
    "action_type": "BUY",
    "trigger_price": "68.00",
    "quantity": "20.0000",
    "status": "PENDING",
    "created_at": "2026-06-28T00:30:00.000Z",
    "updated_at": "2026-06-28T00:30:00.000Z"
  },
  "message": "Smart automation created successfully."
}
```

| `status` | Meaning |
|---|---|
| `PENDING` | Waiting for market price to reach `trigger_price` |
| `TRIGGERED` | Rule has already been executed |
| `CANCELLED` | Manually deleted/cancelled |

#### ❌ Error Responses

| Status | Condition | Response |
|---|---|---|
| `401` | No or invalid token | `{ "success": false, "data": null, "message": "No token provided." }` |
| `400` | Stock not found | `{ "success": false, "data": null, "message": "Stock not found." }` |
| `400` | Invalid `action_type` | `{ "success": false, "data": null, "message": "action_type must be BUY or SELL." }` |
| `400` | `trigger_price` ≤ 0 | `{ "success": false, "data": null, "message": "trigger_price must be greater than 0." }` |
| `400` | `quantity` ≤ 0 | `{ "success": false, "data": null, "message": "quantity must be greater than 0." }` |

---

### 16. List User Automations (Paginated) 🔒

Returns all smart automation rules for the authenticated user. Supports pagination. Each item includes the linked stock info.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/automations` |
| **Authorization** | ✅ Required — Bearer JWT token |

#### Request Headers
```
Authorization: Bearer <token>
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `limit` | `integer` | ❌ | `20` | Max number of automations to return |
| `offset` | `integer` | ❌ | `0` | Number of records to skip |

#### Request Body
_None_

#### ✅ Success Response — `200 OK`
```json
{
  "success": true,
  "data": {
    "total": 2,
    "limit": 20,
    "offset": 0,
    "automations": [
      {
        "id": 2,
        "user_id": 1,
        "stock_id": 2,
        "action_type": "SELL",
        "trigger_price": "25.00",
        "quantity": "10.0000",
        "status": "PENDING",
        "created_at": "2026-06-28T01:00:00.000Z",
        "updated_at": "2026-06-28T01:00:00.000Z",
        "stock": { "id": 2, "symbol": "TMGH", "name_en": "Talaat Moustafa Group Holding", "name_ar": "مجموعة طلعت مصطفى القابضة" }
      },
      {
        "id": 1,
        "user_id": 1,
        "stock_id": 1,
        "action_type": "BUY",
        "trigger_price": "68.00",
        "quantity": "20.0000",
        "status": "PENDING",
        "created_at": "2026-06-28T00:30:00.000Z",
        "updated_at": "2026-06-28T00:30:00.000Z",
        "stock": { "id": 1, "symbol": "COMI", "name_en": "Commercial International Bank", "name_ar": "البنك التجاري الدولي" }
      }
    ]
  },
  "message": "Automations fetched successfully."
}
```

#### ❌ Error Responses

| Status | Condition | Response |
|---|---|---|
| `401` | No or invalid token | `{ "success": false, "data": null, "message": "No token provided." }` |
| `500` | Database error | `{ "success": false, "data": null, "message": "<error details>" }` |

---

### 17. Get Single Automation 🔒

Returns details of one specific automation rule. Validates ownership — users cannot access other users' automations.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/automations/:id` |
| **Authorization** | ✅ Required — Bearer JWT token |

#### Request Headers
```
Authorization: Bearer <token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `integer` | ✅ | The automation ID |

#### Request Body
_None_

#### ✅ Success Response — `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "stock_id": 1,
    "action_type": "BUY",
    "trigger_price": "68.00",
    "quantity": "20.0000",
    "status": "PENDING",
    "created_at": "2026-06-28T00:30:00.000Z",
    "updated_at": "2026-06-28T00:30:00.000Z",
    "stock": {
      "id": 1,
      "symbol": "COMI",
      "name_en": "Commercial International Bank",
      "name_ar": "البنك التجاري الدولي"
    }
  },
  "message": "Automation fetched successfully."
}
```

#### ❌ Error Responses

| Status | Condition | Response |
|---|---|---|
| `401` | No or invalid token | `{ "success": false, "data": null, "message": "No token provided." }` |
| `404` | Not found or belongs to another user | `{ "success": false, "data": null, "message": "Automation not found or does not belong to you." }` |

---

### 18. Update Automation 🔒

Partially updates an existing `PENDING` automation. Cannot update `TRIGGERED` or `CANCELLED` automations.

| Property | Value |
|---|---|
| **Method** | `PATCH` |
| **URL** | `/api/automations/:id` |
| **Authorization** | ✅ Required — Bearer JWT token |

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `integer` | ✅ | The automation ID to update |

#### Request Body
```json
{
  "trigger_price": 63.50,
  "quantity": 25,
  "action_type": "BUY"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `action_type` | `string` | ❌ Optional | `"BUY"` or `"SELL"` |
| `trigger_price` | `number` | ❌ Optional | New trigger price. Must be `> 0` |
| `quantity` | `number` | ❌ Optional | New quantity. Must be `> 0` |

> [!NOTE]
> All fields are optional — only provided fields are updated.

#### ✅ Success Response — `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "stock_id": 1,
    "action_type": "BUY",
    "trigger_price": "63.50",
    "quantity": "25.0000",
    "status": "PENDING",
    "created_at": "2026-06-28T00:30:00.000Z",
    "updated_at": "2026-06-28T01:15:00.000Z",
    "stock": { "id": 1, "symbol": "COMI", "name_en": "Commercial International Bank", "name_ar": "البنك التجاري الدولي" }
  },
  "message": "Automation updated successfully."
}
```

#### ❌ Error Responses

| Status | Condition | Response |
|---|---|---|
| `401` | No or invalid token | `{ "success": false, "data": null, "message": "No token provided." }` |
| `400` | Not found or belongs to another user | `{ "success": false, "data": null, "message": "Automation not found or does not belong to you." }` |
| `400` | Automation already triggered | `{ "success": false, "data": null, "message": "Cannot update an already-triggered automation." }` |
| `400` | Automation is cancelled | `{ "success": false, "data": null, "message": "Cannot update a cancelled automation." }` |
| `400` | Invalid `action_type` | `{ "success": false, "data": null, "message": "action_type must be BUY or SELL." }` |
| `400` | `trigger_price` ≤ 0 | `{ "success": false, "data": null, "message": "trigger_price must be greater than 0." }` |
| `400` | `quantity` ≤ 0 | `{ "success": false, "data": null, "message": "quantity must be greater than 0." }` |

---

### 19. Delete Automation 🔒

Permanently deletes a smart automation rule. Validates ownership.

| Property | Value |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/automations/:id` |
| **Authorization** | ✅ Required — Bearer JWT token |

#### Request Headers
```
Authorization: Bearer <token>
```

#### URL Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | `integer` | ✅ | The automation ID to delete |

#### Request Body
_None_

#### ✅ Success Response — `200 OK`
```json
{
  "success": true,
  "data": {
    "deleted_id": 1
  },
  "message": "Automation deleted successfully."
}
```

#### ❌ Error Responses

| Status | Condition | Response |
|---|---|---|
| `401` | No or invalid token | `{ "success": false, "data": null, "message": "No token provided." }` |
| `404` | Not found or belongs to another user | `{ "success": false, "data": null, "message": "Automation not found or does not belong to you." }` |

---

## 🔔 Notification Endpoints (`/api/notifications`)

---

### 20. Get Notification Settings 🔒

Returns the authenticated user's notification preferences. Auto-creates defaults (`all enabled`) if no record exists yet.

| Property | Value |
|---|---|
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
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "ai_alerts": true,
    "price_volatility": true,
    "market_news": true,
    "created_at": "2026-06-28T00:00:00.000Z",
    "updated_at": "2026-06-28T00:00:00.000Z"
  },
  "message": "Notification settings fetched ✅"
}
```

| Field | Default | Description |
|---|---|---|
| `ai_alerts` | `true` | Receive push alerts for XGBoost AI buy/sell signals |
| `price_volatility` | `true` | Receive alerts when a stock price moves significantly |
| `market_news` | `true` | Receive EGX market news and updates |

#### ❌ Error Responses

| Status | Condition | Response |
|---|---|---|
| `401` | No or invalid token | `{ "success": false, "data": null, "message": "No token provided." }` |
| `500` | Database error | `{ "success": false, "data": null, "message": "<error details>" }` |

---

### 21. Update Notification Settings 🔒

Partially updates notification preferences. Only fields included in the request body are changed.

| Property | Value |
|---|---|
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
|---|---|---|---|
| `ai_alerts` | `boolean` | ❌ Optional | Enable/disable AI signal alerts |
| `price_volatility` | `boolean` | ❌ Optional | Enable/disable price movement alerts |
| `market_news` | `boolean` | ❌ Optional | Enable/disable market news notifications |

#### ✅ Success Response — `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "ai_alerts": true,
    "price_volatility": false,
    "market_news": true,
    "created_at": "2026-06-28T00:00:00.000Z",
    "updated_at": "2026-06-28T01:00:00.000Z"
  },
  "message": "Notification settings updated ✅"
}
```

#### ❌ Error Responses

| Status | Condition | Response |
|---|---|---|
| `401` | No or invalid token | `{ "success": false, "data": null, "message": "No token provided." }` |
| `400` | Non-boolean value provided | `{ "success": false, "data": null, "message": "<sequelize validation error>" }` |

---

## 🌐 Global Error Responses

These apply to **every endpoint** in the API:

| Status | Trigger | Response |
|---|---|---|
| `401` | No `Authorization` header | `{ "success": false, "data": null, "message": "No token provided." }` |
| `401` | JWT signature invalid or malformed | `{ "success": false, "data": null, "message": "Invalid or expired token." }` |
| `401` | Token has been blacklisted via logout | `{ "success": false, "data": null, "message": "Token has been invalidated. Please log in again." }` |
| `401` | Token user no longer exists in DB | `{ "success": false, "data": null, "message": "User not found." }` |
| `404` | Route path does not exist | `{ "success": false, "data": null, "message": "Route not found." }` |

---

## 📊 Database Schema Reference

```
users                 → id, username, email, password_hash, balance, accepted_terms, auth_provider, created_at
stocks                → id, symbol, name_en, name_ar, market_cap, pe_ratio, div_yield, avg_volume, description_en, description_ar
stock_prices          → id, stock_id (FK), current_price, change_percentage, is_positive, updated_at
user_portfolio        → id, user_id (FK), stock_id (FK), quantity, average_buy_price, created_at, updated_at
ai_signals            → id, stock_id (FK), signal_type, confidence_score, market_mood, reason_en, reason_ar, created_at
transactions          → id, user_id (FK), stock_id (FK nullable), type, status, quantity, price_per_share, amount, created_at
smart_automations     → id, user_id (FK), stock_id (FK), action_type, trigger_price, quantity, status, created_at, updated_at
notification_settings → id, user_id (FK unique), ai_alerts, price_volatility, market_news, created_at, updated_at
user_preferences      → id, user_id (FK unique), risk_tolerance, primary_goal, created_at, updated_at
blacklisted_tokens    → id, token (unique), expires_at, created_at
```

---

## 🚀 Quick Start Workflow

```bash
# 1. Start the server
npm run dev

# 2. Seed EGX mock data (run once)
npm run seed

# 3. Register a new user
POST /api/users/register

# 4. Login — copy the token from the response
POST /api/users/login

# 5. Set investment preferences
POST /api/user/preferences   →  Authorization: Bearer <token>

# 6. Deposit trading funds
POST /api/users/deposit      →  Authorization: Bearer <token>

# 7. Browse the market
GET  /api/market/stocks
GET  /api/market/search?query=CIB
GET  /api/market/compare?s1=COMI&s2=TMGH

# 8. Buy a stock
POST /api/portfolio/trade    →  Authorization: Bearer <token>

# 9. Check your portfolio with full metrics
GET  /api/portfolio          →  Authorization: Bearer <token>

# 10. Set a price trigger automation
POST /api/automations        →  Authorization: Bearer <token>

# 11. Logout (invalidates token)
POST /api/auth/logout        →  Authorization: Bearer <token>
```
