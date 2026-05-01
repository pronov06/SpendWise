# SpendWise — Personal Expense Tracker

> A full-stack personal finance application built with **React + TypeScript** (frontend) and **Node.js + Express + MongoDB** (backend). Track expenses, manage income, set budgets, and collaborate on shared group expenses — all in one clean dashboard.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Environment Variables](#environment-variables)
   - [Running the App](#running-the-app)
5. [API Reference](#api-reference)
   - [Authentication](#authentication-endpoints)
   - [Expenses](#expenses-endpoints)
   - [Incomes](#incomes-endpoints)
   - [Budgets](#budget-endpoints)
   - [Groups](#groups-endpoints)
   - [Other Endpoints](#other-endpoints)
6. [Database Schema](#database-schema)
7. [Frontend Architecture](#frontend-architecture)
8. [Email Setup](#email-setup)
9. [Deployment Checklist](#deployment-checklist)
10. [Attributions](#attributions)

---

## Features

- **Authentication** — Register, verify via OTP email, and login with JWT tokens
- **Expense Tracking** — Add, edit, delete, and filter expenses by category/date range
- **Income Tracking** — Separate income management with source tracking
- **Budget Management** — Set per-category budgets with real-time spending calculation
- **Group Expenses** — Create groups, add members, and split shared costs
- **Notifications** — In-app alert center with budget and category alerts
- **Spending Heatmap** — Visual overview of daily/monthly spending patterns
- **Reports & Analytics** — Category breakdowns and summary reports
- **Recurring Transactions** — Mark expenses/incomes as recurring (daily/weekly/monthly/yearly)
- **Dark-ready UI** — Built with Tailwind CSS v4, Radix UI, and Recharts

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v4, Radix UI, Lucide Icons |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ORM) |
| Auth | JWT (7-day expiry) + OTP email verification |
| Email | Nodemailer (Gmail / custom SMTP) |
| PDF Export | jsPDF + jsPDF-AutoTable |

---

## Project Structure

```
SpendWise/
├── src/                          # Frontend (React + TypeScript)
│   └── app/
│       ├── components/           # UI components (Dashboard, Settings, etc.)
│       ├── context/              # AuthContext, NotificationContext
│       └── services/
│           ├── api.ts            # All API clients (expenseApi, incomeApi, etc.)
│           ├── types.ts          # TypeScript interfaces for all entities
│           └── hooks.ts          # Custom React hooks for data fetching
├── server/                       # Backend (Node.js + Express)
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js
│   │   ├── Expense.js
│   │   ├── Income.js
│   │   ├── Budget.js
│   │   ├── Group.js
│   │   ├── GroupExpense.js       # Legacy
│   │   ├── Transaction.js        # Legacy (backward compatible)
│   │   └── Feedback.js
│   ├── routes/                   # Express routers
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   ├── incomes.js
│   │   ├── budget.js
│   │   ├── groups.js
│   │   ├── group.js              # Legacy group expenses
│   │   ├── transactions.js       # Legacy
│   │   ├── feedback.js
│   │   ├── reports.js
│   │   ├── heatmap.js
│   │   └── user.js
│   ├── services/
│   │   └── emailService.js       # Nodemailer OTP & welcome emails
│   └── index.js                  # Server entry point
├── .env                          # Frontend env vars (VITE_API_URL)
├── .env.example                  # Template for .env
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- A **MongoDB** connection (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A **Gmail** account (or any SMTP provider) for OTP emails

---

### Environment Variables

#### Frontend — `.env` (root directory)

```env
VITE_API_URL=http://localhost:5000/api
```

Copy the template:
```bash
cp .env.example .env
```

#### Backend — `server/.env`

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/spendwise?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d
PORT=5000

# Email (for OTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password   # Gmail App Password, NOT your account password
FRONTEND_URL=http://localhost:5173
```

> **Gmail App Password**: Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) → Generate a 16-character password. Requires 2FA to be enabled.

---

### Running the App

**1. Install frontend dependencies**
```bash
npm install
```

**2. Install backend dependencies**
```bash
cd server
npm install
```

**3. Start backend (port 5000)**
```bash
cd server
npm run dev
```

**4. Start frontend (port 5173)**
```bash
# from root
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

**Base URL:** `http://localhost:5000/api`

All endpoints except `/auth/*` require a Bearer token:
```
Authorization: Bearer <jwt_token>
```

---

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| POST | `/auth/register` | Create new account | ❌ |
| POST | `/auth/verify-otp` | Verify email with OTP | ❌ |
| POST | `/auth/resend-otp` | Request a new OTP | ❌ |
| POST | `/auth/login` | Login with credentials | ❌ |

**Register**
```json
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123"
}
```

**Verify OTP** → Returns JWT token
```json
POST /auth/verify-otp
{ "email": "john@example.com", "otp": "123456" }
```

**Login** → Returns JWT token
```json
POST /auth/login
{ "email": "john@example.com", "password": "password123" }
```

---

### Expenses Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expenses` | List expenses (paginated, filterable) |
| GET | `/expenses/by-category` | Expenses grouped by category |
| POST | `/expenses` | Create expense |
| PUT | `/expenses/:id` | Update expense |
| DELETE | `/expenses/:id` | Delete expense |

**Query parameters for GET `/expenses`:**
- `category` — filter by category name
- `startDate` / `endDate` — ISO date format (`2025-01-01`)
- `page` (default: `1`) / `limit` (default: `50`)

**Create Expense**
```json
POST /expenses
{
  "category": "Food",
  "description": "Lunch at cafe",
  "amount": 75.50,
  "date": "2025-02-01T12:00:00Z",
  "tags": ["lunch"],
  "icon": "🍕",
  "paymentMethod": "card",
  "isRecurring": false
}
```

---

### Incomes Endpoints

Same structure as Expenses:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/incomes` | List incomes (paginated, filterable) |
| GET | `/incomes/by-category` | Incomes grouped by category |
| POST | `/incomes` | Create income |
| PUT | `/incomes/:id` | Update income |
| DELETE | `/incomes/:id` | Delete income |

**Create Income**
```json
POST /incomes
{
  "category": "Salary",
  "description": "Monthly salary",
  "amount": 5000,
  "date": "2025-02-01T00:00:00Z",
  "source": "salary",
  "isRecurring": true,
  "recurringInterval": "monthly"
}
```

> `recurringInterval` values: `daily` | `weekly` | `monthly` | `yearly`

---

### Budget Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/budget` | Get all budgets with real-time `spent` amount |
| POST | `/budget` | Create budget |
| PUT | `/budget/:id` | Update budget |
| DELETE | `/budget/:id` | Delete budget |

**Create Budget**
```json
POST /budget
{
  "category": "Food",
  "limit": 500,
  "period": "monthly",
  "color": "#14b8a6",
  "icon": "🍕"
}
```

> Only **one budget per category** per user. Use `PUT` to update.
> `GET /budget` automatically calculates `spent` from current-month expenses.

---

### Groups Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/groups` | List user's groups |
| GET | `/groups/:id` | Get specific group |
| POST | `/groups` | Create group (creator is auto-added as admin) |
| PUT | `/groups/:id` | Update group (admin only) |
| POST | `/groups/:id/add-member` | Add member by userId or email |
| DELETE | `/groups/:id/remove-member/:memberId` | Remove member (admin only) |
| DELETE | `/groups/:id` | Delete group (creator only) |

**Create Group**
```json
POST /groups
{ "name": "Weekend Trip", "description": "Beach vacation", "icon": "🏖️", "category": "travel" }
```

**Add Member**
```json
POST /groups/:id/add-member
{ "userId": "user_id_here" }
// OR by email:
{ "email": "friend@example.com", "name": "Friend Name" }
```

---

### Other Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/feedback` | Submit feedback (`type`: `bug` \| `feature` \| `general` \| `praise`) |
| GET | `/reports/summary` | Summary report (`?startDate=...&endDate=...`) |
| GET | `/reports/category` | Category breakdown |
| GET | `/heatmap` | Spending heatmap (`?year=2025&month=2`) |
| GET | `/user/profile` | Get user profile |
| PUT | `/user/profile` | Update user profile & notification preferences |

> **Legacy:** `/transactions` and `/group-expenses` endpoints remain active for backward compatibility.

---

### Error Responses

```json
{ "message": "Error description" }
```

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (missing/invalid fields) |
| 401 | Unauthorized (missing/expired token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Server Error |

---

## Database Schema

### User
```js
{ name, email (unique), phone, password (hashed), role, isVerified, otp, otpExpires,
  budgetAlerts, categoryAlerts, weeklySummary, avatar, createdAt, updatedAt }
```

### Expense
```js
{ userId → User, category, description, amount, date, tags[], icon,
  paymentMethod, isRecurring, recurringInterval, createdAt, updatedAt }
```

### Income
```js
{ userId → User, category, description, amount, date, tags[], icon,
  source, isRecurring, recurringInterval, createdAt, updatedAt }
```

### Budget
```js
{ userId → User, category, limit, period ("weekly"|"monthly"), color, icon,
  createdAt, updatedAt }
// `spent` is calculated dynamically on GET
```

### Group
```js
{ name, description, createdBy → User,
  members: [{ user → User, name, email, isAdmin, joinedAt }],
  icon, category, isActive, createdAt, updatedAt }
```

### Feedback
```js
{ userId → User, type ("bug"|"feature"|"general"|"praise"), message, rating (1-5),
  createdAt, updatedAt }
```

### Database Relationships
```
User
 ├── (1:Many) → Expense
 ├── (1:Many) → Income
 ├── (1:Many) → Budget
 ├── (1:Many) → Group (as creator)
 ├── (Many:Many) → Group (as member)
 └── (1:Many) → Feedback
```

---

## Frontend Architecture

### API Clients (`src/app/services/api.ts`)

```typescript
import { expenseApi, incomeApi, budgetApi, groupApi, userApi } from '@/app/services/api';

// Examples
const expenses = await expenseApi.getAll({ page: 1, limit: 20, category: 'Food' });
const income   = await incomeApi.create({ category: 'Salary', amount: 5000, ... });
const budgets  = await budgetApi.getAll(); // includes `.spent` field
await userApi.updateProfile({ name: 'New Name', budgetAlerts: true });
```

### Auth Context (`src/app/context/AuthContext.tsx`)

```typescript
import { useAuth } from '@/app/context/AuthContext';

const { user, login, logout, setUser } = useAuth();
```

- Token stored in `localStorage` as `spendwise_token`
- Automatically included in every API request header

### Custom Hooks (`src/app/services/hooks.ts`)

```typescript
import { useExpenses, useCreateExpense, useBudgets } from '@/app/services/hooks';

const { data, status, error } = useExpenses(50, 'Food');
const { create, status: creating } = useCreateExpense();
```

### TypeScript Types (`src/app/services/types.ts`)

```typescript
import type { Expense, ExpensePayload, Income, Budget, Group, AuthUser } from '@/app/services/types';
```

---

## Email Setup

OTP emails are sent via **Nodemailer** when users register or request a resend.

Three email templates are included:
1. **OTP Verification Email** — 6-digit code, expires in 10 minutes
2. **Welcome Email** — Sent after successful verification
3. **Password Reset Email** — Ready for future use

### Gmail Configuration

1. Enable [2-Step Verification](https://myaccount.google.com/security) on your Google account
2. Create an [App Password](https://myaccount.google.com/apppasswords)
3. Add to `server/.env`:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=you@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx   # 16-char App Password
   ```

### Custom SMTP

```env
EMAIL_HOST=smtp.provider.com
EMAIL_PORT=587
EMAIL_USER=you@provider.com
EMAIL_PASSWORD=your-password
```

Server startup message confirms email status:
```
✅ Email service configured and ready
```

---

## Deployment Checklist

- [ ] Set `JWT_SECRET` to a strong random value
- [ ] Use a production MongoDB URI (Atlas or self-hosted)
- [ ] Set `NODE_ENV=production` on the server
- [ ] Enable HTTPS (reverse proxy with nginx or a platform like Render/Railway)
- [ ] Update CORS origin to your production frontend domain
- [ ] Set `VITE_API_URL` to your production backend URL
- [ ] Add rate limiting to API routes
- [ ] Set up request logging (Morgan, etc.)
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Schedule regular database backups

---

## Attributions

- UI components from [shadcn/ui](https://ui.shadcn.com/) — [MIT License](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md)
- Photos from [Unsplash](https://unsplash.com) — [Unsplash License](https://unsplash.com/license)
- Original Figma design: [SpendWise Expense Tracker UI](https://www.figma.com/design/SPMN7vEnCHNR3VbUrGTk4G/SpendWise-Expense-Tracker-UI)