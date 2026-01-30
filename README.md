# Expense Monitoring

A modern, full-stack expense tracking application built with Next.js, React, and Supabase. Track your income and expenses, visualize spending patterns, and manage your finances effectively.

## Features

### Core Functionality
- **Transaction Management** - Add, edit, and delete income/expense transactions
- **Category Organization** - Custom categories with icons and colors for income and expenses
- **Dashboard Overview** - View your financial summary at a glance
- **Reports & Analytics** - Visualize spending with charts and graphs
- **Multi-Currency Support** - Track expenses in multiple currencies
- **Secure Authentication** - User authentication powered by Supabase

### Dashboard Features
- **Expense by Category Chart** - Pie chart showing spending distribution
- **Expense Calendar** - Calendar view of daily spending
- **Recent Transactions** - Quick access to your latest entries
- **Balance Summary** - Overview of total income, expenses, and balance

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **UI Components**: Headless UI, Heroicons
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A [Supabase](https://supabase.com/) account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expense-monitoring
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [Supabase](https://supabase.com/)
   - Go to the SQL Editor and run the migrations from [`supabase/migrations/001_expense_tracking.sql`](supabase/migrations/001_expense_tracking.sql)
   - Run [`supabase/migrations/002_user_settings.sql`](supabase/migrations/002_user_settings.sql) for user settings

4. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
expense-monitoring/
├── app/
│   ├── actions/           # Server actions for data mutations
│   ├── auth/              # Authentication routes
│   ├── dashboard/         # Dashboard pages (expenses, reports, settings)
│   ├── login/             # Login page
│   └── layout.tsx         # Root layout
├── components/
│   ├── charts/            # Chart components
│   ├── sidebar.tsx        # Navigation sidebar
│   ├── transaction-form.tsx
│   └── transaction-list.tsx
├── lib/
│   ├── supabase/          # Supabase client configuration
│   └── currencies.ts      # Currency definitions
├── supabase/
│   └── migrations/        # Database migrations
└── public/                # Static assets
```

## Use Cases

### Personal Finance Tracking
Track your daily expenses and income to understand where your money goes. Create categories for different spending areas like:
- Food & Dining
- Transportation
- Shopping
- Bills & Utilities
- Entertainment
- Healthcare
- Education

### Budget Management
Set up categories and regularly log transactions to:
- Monitor spending against income
- Identify areas to cut back
- Save for specific goals
- Track financial progress over time

### Expense Reporting
For freelancers and small business owners:
- Track business expenses separately
- Categorize by expense type
- Generate reports for tax purposes
- Export data for accounting

### Multi-Currency Tracking
If you travel frequently or have expenses in different currencies:
- Log transactions in their original currency
- View conversions in your base currency
- Track exchange rate impact on spending

### Family Budgeting
Share financial responsibilities by:
- Having each family member track their spending
- Categorizing by person or household area
- Generating combined reports for family budget reviews

## Default Categories

The application includes pre-configured categories:

**Expense Categories:**
- Food & Dining
- Transportation
- Shopping
- Bills & Utilities
- Entertainment
- Healthcare
- Education
- Other

**Income Categories:**
- Salary
- Freelance
- Investment
- Gift
- Other

## API & Server Actions

The application uses Next.js Server Actions for data mutations:

- [`app/actions/transactions.ts`](app/actions/transactions.ts) - Transaction CRUD operations
- [`app/actions/categories.ts`](app/actions/categories.ts) - Category management
- [`app/actions/settings.ts`](app/actions/settings.ts) - User settings

## Database Schema

The application uses the following tables:

- **categories** - User-defined categories for transactions
- **transactions** - Individual income/expense entries
- **user_settings** - User preferences (currency, etc.)

All tables include Row Level Security (RLS) policies to ensure data privacy.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Recharts](https://recharts.org/) for the charting library
