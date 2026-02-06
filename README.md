# Expense Monitoring

A modern, full-stack expense tracking application built with Next.js, React, and Supabase. Track your income and expenses, visualize spending patterns, and manage your finances effectively.

## Features

### Core Functionality
- **Transaction Management** - Add, edit, and delete income/expense transactions with detailed information
- **Category Organization** - Custom categories with icons and colors for income and expenses
- **Dashboard Overview** - View your financial summary at a glance with key metrics
- **Advanced Reports & Analytics** - Visualize spending with multiple chart types and data insights
- **Multi-Currency Support** - Track expenses in multiple currencies with real-time formatting
- **Secure Authentication** - User authentication powered by Supabase
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices

### Dashboard Features
- **Enhanced Stats Cards** - Detailed statistics with trend comparisons and period insights
- **Expense by Category Chart** - Pie chart showing spending distribution with drill-down capabilities
- **Expense Calendar** - Interactive calendar view of daily spending patterns
- **Recent Transactions** - Quick access to your latest entries with filtering options
- **Spending Trend Chart** - Line chart showing monthly spending trends over time
- **Income vs Expenses Chart** - Area chart comparing income and expenses over 12 months
- **Period Comparison** - Side-by-side comparison of income, expenses, and balance changes
- **Date Range Selector** - Flexible date range options (7d, 30d, 90d, YTD, custom)

### Expenses Management
- **Transaction List** - Comprehensive list view with search and filtering capabilities
- **Transaction Form** - User-friendly form with validation for adding/editing transactions
- **Transaction Filters** - Advanced filtering by category, date range, and transaction type
- **Bulk Actions** - Efficient management of multiple transactions

### Reports & Analytics
- **Custom Date Ranges** - Analyze data across any time period with custom date selection
- **Comparison Metrics** - Track changes in income, expenses, and balance between periods
- **Visual Data Representations** - Multiple chart types including pie, line, and area charts
- **Real-time Updates** - Dynamic data refresh with smooth transitions

### Settings
- **Profile Management** - Update user information including name and password
- **Currency Settings** - Select preferred currency from a comprehensive list
- **Category Management** - Create, edit, and delete custom categories with custom icons and colors
- **Form Validation** - Robust form validation using Zod schema
- **Confirmation Dialogs** - Safe deletion with confirmation prompts

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with PostCSS
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Charts**: Recharts (PieChart, LineChart, AreaChart)
- **Forms**: React Hook Form + Zod
- **UI Components**: Headless UI, Heroicons
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **Alerts**: SweetAlert2
- **Icons**: Custom SVG icons with IconRenderer

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A [Supabase](https://supabase.com/) account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rnyll-pntnr/rnyll-expense-tracking.git
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
│   │   ├── categories.ts
│   │   ├── settings.ts
│   │   └── transactions.ts
│   ├── auth/              # Authentication routes
│   ├── dashboard/         # Dashboard pages
│   │   ├── page.tsx
│   │   ├── expenses/      # Expenses management
│   │   ├── reports/       # Reports & analytics
│   │   └── settings/      # User settings
│   ├── login/             # Login page
│   └── layout.tsx         # Root layout
├── components/
│   ├── charts/            # Chart components
│   ├── dashboard/         # Dashboard-specific components
│   ├── category-form.tsx
│   ├── dashboard-layout.tsx
│   ├── icon-helper.tsx
│   ├── sidebar-context.tsx
│   ├── sidebar.tsx
│   ├── skeletons.tsx
│   ├── summary-cards.tsx
│   ├── toast-provider.tsx
│   ├── transaction-filters.tsx
│   ├── transaction-form.tsx
│   └── transaction-list.tsx
├── hooks/                 # Custom React hooks
├── lib/
│   ├── supabase/          # Supabase client configuration
│   ├── currencies.ts      # Currency definitions
│   └── formatting.ts      # Formatting utilities
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
- Generate reports

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

- [`app/actions/transactions.ts`](app/actions/transactions.ts) - Transaction CRUD operations, stats, and analytics
- [`app/actions/categories.ts`](app/actions/categories.ts) - Category management
- [`app/actions/settings.ts`](app/actions/settings.ts) - User settings (profile, currency)

## Database Schema

The application uses the following tables:

- **categories** - User-defined categories for transactions
- **transactions** - Individual income/expense entries
- **user_settings** - User preferences (currency, etc.)

All tables include Row Level Security (RLS) policies to ensure data privacy.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Recharts](https://recharts.org/) for the charting library
- [date-fns](https://date-fns.org/) for date manipulation
- [SweetAlert2](https://sweetalert2.github.io/) for beautiful alert dialogs
