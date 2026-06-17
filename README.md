<div align="center">

# 💰 SpendWise

### *Your Personal Finance Command Center*

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_App-10b981?style=for-the-badge)](https://spend-wise-gmrs.vercel.app)
[![GitHub Stars](https://img.shields.io/github/stars/pronov06/SpendWise?style=for-the-badge&color=facc15&logo=github)](https://github.com/pronov06/SpendWise)
[![License](https://img.shields.io/badge/License-MIT-6366f1?style=for-the-badge)](LICENSE)
[![Deploy on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

---

**SpendWise** is a full-stack personal finance tracker that helps you take control of your money. Track expenses, manage income, set smart budgets, split group costs, and get AI-powered financial insights — all in one beautifully designed dashboard.

<br/>

![SpendWise Banner](https://raw.githubusercontent.com/pronov06/SpendWise/main/guidelines/banner.png)

</div>

---

## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h3>🔐 Authentication & Security</h3>
      <ul>
        <li>Email + OTP two-factor verification</li>
        <li>JWT-based sessions (7-day expiry)</li>
        <li>Rate-limited auth endpoints</li>
        <li>Bcrypt password hashing</li>
      </ul>
    </td>
    <td width="50%">
      <h3>💸 Expense & Income Tracking</h3>
      <ul>
        <li>Add, edit, delete transactions</li>
        <li>Filter by category, date range & tags</li>
        <li>Mark as recurring (daily/weekly/monthly)</li>
        <li>Payment method tracking</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📊 Analytics & Reports</h3>
      <ul>
        <li>Interactive spending heatmap</li>
        <li>Category breakdowns with Recharts</li>
        <li>Monthly trend visualization</li>
        <li>Export reports as PDF</li>
      </ul>
    </td>
    <td width="50%">
      <h3>👥 Group Expenses</h3>
      <ul>
        <li>Create groups & add members</li>
        <li>Split shared costs automatically</li>
        <li>Email split summaries to members</li>
        <li>Admin role management</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🎯 Budget Management</h3>
      <ul>
        <li>Per-category budget limits</li>
        <li>Real-time spent vs. limit tracking</li>
        <li>In-app budget alert notifications</li>
        <li>Weekly/monthly periods</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🤖 AI Financial Assistant</h3>
      <ul>
        <li>RAG-based Gemini AI chatbot</li>
        <li>Context-aware financial advice</li>
        <li>Rate-limited for cost protection</li>
        <li>Markdown-formatted responses</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|:---:|:---|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS v4, Radix UI, Lucide Icons |
| **Charts** | Recharts |
| **State / Routing** | React Context, React Router v7 |
| **Backend** | Node.js, Express.js (Serverless) |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT + OTP via Nodemailer |
| **AI** | Google Gemini API |
| **PDF Export** | jsPDF + AutoTable |
| **Deployment** | Vercel (Frontend + Serverless Backend) |

</div>

---

## 📁 Project Structure

```
SpendWise/
├── 📂 src/                          # Frontend (React + TypeScript)
│   └── app/
│       ├── components/              # Dashboard, Settings, Charts, etc.
│       ├── context/                 # AuthContext, NotificationContext
│       └── services/
│           ├── api.ts               # Typed API clients for all endpoints
│           ├── types.ts             # TypeScript interfaces & enums
│           └── hooks.ts             # Custom React data-fetching hooks
│
├── 📂 backend/                      # Backend (Node.js + Express)
│   ├── models/                      # Mongoose schemas
│   │   ├── User.js
│   │   ├── Expense.js
│   │   ├── Income.js
│   │   ├── Budget.js
│   │   ├── Group.js
│   │   └── Feedback.js
│   ├── routes/                      # Express route handlers
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   ├── incomes.js
│   │   ├── budget.js
│   │   ├── groups.js
│   │   ├── reports.js
│   │   ├── heatmap.js
│   │   ├── feedback.js
│   │   ├── user.js
│   │   └── chat.js
│   ├── services/
│   │   └── emailService.js          # OTP & welcome email templates
│   └── index.js                     # Express app entry point
│
├── 📂 api/
│   └── index.js                     # Vercel serverless entry (proxy)
│
├── vercel.json                      # Vercel routing config
├── vite.config.ts                   # Vite dev proxy config
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- A **MongoDB Atlas** cluster (free tier works great)
- A **Gmail account** with 2FA and App Password for OTP emails
- A **Google Gemini API** key (for the AI chatbot)

---

### 1. Clone the Repository

```bash
git clone https://github.com/pronov06/SpendWise.git
cd SpendWise
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm install
cd backend && npm install && cd ..
```

### 3. Configure Environment Variables

Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

Then fill in your values:

```env
# ── Database ──────────────────────────────────────
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/spendwise

# ── Auth ──────────────────────────────────────────
JWT_SECRET=your_super_secret_256_bit_key_here
JWT_EXPIRES_IN=7d

# ── Email (OTP) ───────────────────────────────────
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx     # Gmail App Password (16 chars)
EMAIL_FROM=SpendWise <your-email@gmail.com>

# ── AI Chatbot ────────────────────────────────────
GEMINI_API_KEY=your_gemini_api_key_here

# ── Misc ──────────────────────────────────────────
MOCK_OTP=false     # Set to true for local dev (logs OTP to console)
PORT=5000
```

> **Getting a Gmail App Password:**
> 1. Enable [2-Step Verification](https://myaccount.google.com/security) on your Google account
> 2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
> 3. Generate a 16-character app password

### 4. Run the Application

```bash
# Start both frontend and backend together
npm run dev:all
```

| Service | URL |
|---|---|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:5000/api |

---

## 🌐 API Reference

**Base URL (production):** `https://spend-wise-gmrs.vercel.app/api`  
**Base URL (local):** `http://localhost:5000/api`

All protected endpoints require a Bearer token:
```
Authorization: Bearer <jwt_token>
```

<details>
<summary><strong>🔐 Authentication Endpoints</strong></summary>
<br/>

| Method | Endpoint | Description | Auth |
|:---:|---|---|:---:|
| `POST` | `/auth/register` | Create new account | ❌ |
| `POST` | `/auth/verify-otp` | Verify email with OTP → returns JWT | ❌ |
| `POST` | `/auth/resend-otp` | Request a fresh OTP code | ❌ |
| `POST` | `/auth/login` | Login → returns JWT | ❌ |

```jsonc
// POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123"
}

// POST /auth/verify-otp → { token, user }
{ "email": "john@example.com", "otp": "123456" }
```
</details>

<details>
<summary><strong>💸 Expenses Endpoints</strong></summary>
<br/>

| Method | Endpoint | Description | Auth |
|:---:|---|---|:---:|
| `GET` | `/expenses` | List expenses (paginated + filterable) | ✅ |
| `GET` | `/expenses/by-category` | Totals grouped by category | ✅ |
| `POST` | `/expenses` | Create expense | ✅ |
| `PUT` | `/expenses/:id` | Update expense | ✅ |
| `DELETE` | `/expenses/:id` | Delete expense | ✅ |

**Query Parameters:** `category`, `startDate`, `endDate`, `page`, `limit`

```jsonc
// POST /expenses
{
  "category": "Food",
  "description": "Lunch at cafe",
  "amount": 75.50,
  "date": "2025-02-01T12:00:00Z",
  "tags": ["lunch", "work"],
  "icon": "🍕",
  "paymentMethod": "card",
  "isRecurring": false
}
```
</details>

<details>
<summary><strong>💰 Incomes Endpoints</strong></summary>
<br/>

| Method | Endpoint | Description | Auth |
|:---:|---|---|:---:|
| `GET` | `/incomes` | List incomes | ✅ |
| `GET` | `/incomes/by-category` | Totals by category | ✅ |
| `POST` | `/incomes` | Create income | ✅ |
| `PUT` | `/incomes/:id` | Update income | ✅ |
| `DELETE` | `/incomes/:id` | Delete income | ✅ |

```jsonc
// POST /incomes — recurringInterval: "daily" | "weekly" | "monthly" | "yearly"
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
</details>

<details>
<summary><strong>🎯 Budget Endpoints</strong></summary>
<br/>

| Method | Endpoint | Description | Auth |
|:---:|---|---|:---:|
| `GET` | `/budget` | Get all budgets (includes live `spent` field) | ✅ |
| `POST` | `/budget` | Create budget | ✅ |
| `PUT` | `/budget/:id` | Update budget | ✅ |
| `DELETE` | `/budget/:id` | Delete budget | ✅ |

> One budget per category per user. `GET /budget` auto-calculates `spent` from current-month expenses.
</details>

<details>
<summary><strong>👥 Groups Endpoints</strong></summary>
<br/>

| Method | Endpoint | Description | Auth |
|:---:|---|---|:---:|
| `GET` | `/groups` | List user's groups | ✅ |
| `POST` | `/groups` | Create group | ✅ |
| `POST` | `/groups/:id/add-member` | Add member by userId or email | ✅ |
| `DELETE` | `/groups/:id/remove-member/:memberId` | Remove member (admin only) | ✅ |
| `DELETE` | `/groups/:id` | Delete group (creator only) | ✅ |
</details>

<details>
<summary><strong>📊 Other Endpoints</strong></summary>
<br/>

| Method | Endpoint | Description |
|:---:|---|---|
| `GET` | `/reports/summary` | Summary (`?startDate=...&endDate=...`) |
| `GET` | `/reports/category-breakdown` | Spending by category |
| `GET` | `/reports/monthly-trend` | Monthly totals |
| `GET` | `/heatmap` | Daily spending heatmap data |
| `GET/PUT` | `/user/profile` | View/update user profile |
| `PUT` | `/user/change-password` | Change password |
| `POST` | `/feedback` | Submit feedback |
| `POST` | `/chat` | AI financial assistant chat |
| `GET` | `/health` | Health check |
</details>

---

## 🗄️ Database Schema

```
User
 ├── (1:Many) → Expense
 ├── (1:Many) → Income
 ├── (1:Many) → Budget
 ├── (1:Many) → Group (as creator)
 ├── (Many:Many) → Group (as member)
 └── (1:Many) → Feedback
```

<details>
<summary><strong>View full schema definitions</strong></summary>
<br/>

**User**
```js
{ name, email (unique, indexed), phone, password (bcrypt), role,
  isVerified, otp, otpExpires, avatar,
  budgetAlerts, categoryAlerts, weeklySummary,
  createdAt, updatedAt }
```

**Expense / Income**
```js
{ userId → User, category, description, amount, date,
  tags[], icon, paymentMethod,
  isRecurring, recurringInterval ("daily"|"weekly"|"monthly"|"yearly"),
  createdAt, updatedAt }
```

**Budget**
```js
{ userId → User, category (unique per user), limit, period ("weekly"|"monthly"),
  color, icon, createdAt, updatedAt }
// `spent` field is calculated dynamically on every GET request
```

**Group**
```js
{ name, description, createdBy → User,
  members: [{ user → User, name, email, isAdmin, joinedAt }],
  icon, category, isActive, createdAt, updatedAt }
```
</details>

---

## ☁️ Deployment

SpendWise is optimized for **Vercel** — both frontend and backend run on the same domain at zero cost.

### How it Works

```
Browser → /api/auth/login
             ↓
     vercel.json rewrites
             ↓
     api/index.js (proxy)
             ↓
     backend/index.js (Express)
             ↓
     MongoDB Atlas
```

### Deploy Your Own

1. Fork this repository
2. Connect your fork to [Vercel](https://vercel.com)
3. Add the following environment variables in the Vercel dashboard:

```
MONGO_URI
JWT_SECRET
JWT_EXPIRES_IN
EMAIL_HOST
EMAIL_PORT
EMAIL_USER
EMAIL_PASSWORD
EMAIL_FROM
GEMINI_API_KEY
MOCK_OTP=false
```

4. Deploy! ✅

### Production Checklist

- [x] Serverless Express with MongoDB connection caching
- [x] Rate limiting on auth (`10 req/15min`) and chat (`30 msg/15min`) routes
- [x] Dynamic CORS supporting same-origin Vercel hosting
- [x] JWT-based authentication with bcrypt password hashing
- [x] Input validation with `express-validator`
- [ ] Set up error monitoring (Sentry)
- [ ] Configure scheduled database backups
- [ ] Add request logging (Morgan)

---

## 🏗️ Local Development

```bash
# Run frontend + backend together
npm run dev:all

# Run only the frontend
npm run dev

# Run only the backend (with hot reload)
npm run server
```

The Vite dev server automatically proxies all `/api` requests to `http://localhost:5000`, so no CORS issues during development.

---

## 🙏 Attributions

| Resource | Usage |
|---|---|
| [shadcn/ui](https://ui.shadcn.com/) | UI component library — MIT License |
| [Radix UI](https://www.radix-ui.com/) | Accessible headless components |
| [Recharts](https://recharts.org/) | Chart visualizations |
| [Lucide Icons](https://lucide.dev/) | Icon library |
| [Google Gemini](https://ai.google.dev/) | AI chatbot backend |
| [Figma Design](https://www.figma.com/design/SPMN7vEnCHNR3VbUrGTk4G/SpendWise-Expense-Tracker-UI) | Original UI design |

---

<div align="center">

**Built with ❤️ by [Pronov Mazumdar](https://github.com/pronov06)**

[![GitHub](https://img.shields.io/badge/GitHub-pronov06-24292e?style=flat-square&logo=github)](https://github.com/pronov06)

*If you found this project useful, please consider giving it a ⭐ on GitHub!*

</div>