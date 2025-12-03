# Dashboard Architecture

## Overview

The Commertize dashboard supports three distinct user roles: **Investors**, **Sponsors**, and **Admins**. Each role has unique views and capabilities.

## User Roles & Views

### Investor Portal

**Primary Use Case**: View portfolio, discover properties, manage investments.

**Pages**:

- **Dashboard**: Portfolio overview, performance metrics, recent activity
- **Marketplace**: Browse available properties, filter by type/location/yield
- **Portfolio**: Detailed holdings, transaction history, income tracking
- **Wallet**: Crypto wallet integration, token balances, DeFi positions

### Sponsor Portal

**Primary Use Case**: List properties, manage applications, track fundraising.

**Pages**:

- **Dashboard**: Active listings, funding status, revenue
- **Properties**: List new property, manage existing listings
- **Applications**: Review investor applications, KYC/AML status
- **Analytics**: Property performance, investor demographics

### Admin Portal

**Primary Use Case**: Platform management, user approvals, compliance oversight.

**Pages**:

- **Dashboard**: Platform metrics, pending approvals, alerts
- **Users**: Manage investors, sponsors, accreditation status
- **Properties**: Review and approve listings, compliance checks
- **Transactions**: Monitor all platform transactions, escrow status
- **Settings**: Platform configuration, fee structures

## Shared Components

- **Sidebar Navigation**: Role-based navigation menu
- **Header**: User profile, wallet connect, notifications
- **Card Components**: Glassmorphic cards for data display
- **Data Tables**: Sortable, filterable tables for listings/transactions

## Routing Structure

```
/dashboard - Redirects to role-specific dashboard
/dashboard/investor/* - Investor routes
/dashboard/sponsor/* - Sponsor routes
/dashboard/admin/* - Admin routes
```

## State Management

- **User Context**: Current user role, profile, auth status
- **Wallet Context**: Connected wallet, balances
- **Theme Context**: Dark mode (default), light mode option
