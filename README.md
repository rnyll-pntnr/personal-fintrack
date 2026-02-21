# FinTrack - Personal Finance Tracker

A personal finance tracker and admin dashboard built with Next.js, Tailwind CSS, and Supabase.

## Features

### Core Functionality
- **Smart Recurring Checklist**: Automatically refreshes monthly and generates expense records
- **Expense Tracking**: Manual expense entry with category management
- **Income Tracking**: Comprehensive income management system
- **Real-time Synchronization**: Supabase Realtime for multi-device sync
- **Comprehensive Reporting**: Detailed charts and tables for financial analysis

### Dashboard Components
- **Summary Cards**: Total Spent, Total Income, Recurring Due, and Current Balance
- **Spending Over Time**: Bar chart showing expenses by time period
- **Income vs Expenses**: Comparison chart with income, expenses, and balance
- **Category Distribution**: Pie chart showing spending by category
- **Recent Expenses**: Table of recent transactions
- **Time-Grain Toggle**: Switch between Week, Month, and Year views
- **Currency Exchange Rates**: Real-time exchange rates for popular currencies with attribution to Exchange Rate API

### Smart Recurring Checklist
- Grid of monthly/weekly bills with category badges
- "Mark as Paid" functionality with optimistic updates
- Automatic expense record creation upon completion

### Categories
Default categories include:
- **Expense**: Food, Transport, Utilities, Entertainment, Grocery, Healthcare, Education, Rent, Personal Care, Other
- **Income**: Salary, Freelance, Investments, Side Hustle, Rental Income

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Authentication**: Supabase Auth (SSR support)
- **Database**: PostgreSQL (Supabase)
- **State Management**: TanStack Query + React Hooks
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React
- **Charts**: Recharts
- **Theme**: Dark/Light mode via next-themes

## Project Structure

```
components/
├── ui/              # Shadcn primitives
├── shared/          # Reusable components (StatCard, CategoryBadge, etc.)
├── dashboard/       # Dashboard-specific components (Charts, Summary Cards, Currency Exchange)
├── expenses/        # Expense management components
├── income/          # Income management components
├── recurring/       # Recurring items management
└── layout/          # Layout components (Header, Sidebar, MobileNav)

hooks/
├── useExpenses.ts   # Expense management hook
├── useIncome.ts     # Income management hook
├── useRecurring.ts  # Recurring items hook
└── useUser.ts       # User profile hook

lib/
├── supabase/        # Supabase client
├── utils/           # Utility functions
└── validations.ts   # Zod schemas

types/
└── database.ts      # Database interfaces
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## Database Schema

Key tables:
- `profiles`: User profile information
- `categories`: Expense/income categories
- `expenses`: Expense records
- `income`: Income records
- `recurring_items`: Recurring bill information

## Security

- Row Level Security (RLS) enabled on all tables
- Auth.uid() validation for all CRUD operations
- Default categories automatically created for new users

## License

[MIT](LICENSE)
