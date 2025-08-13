# Admin Panel Implementation Plan

## Overview
This document outlines the implementation plan for the Admin Panel UI for internal use only. The admin panel will be accessible by authorized team members and provide functionality for user management, subscription management, promo code application, and viewing app usage data.

## Current Codebase Structure
- Next.js 15 application with App Router
- Firebase integration (authentication and database)
- Tailwind CSS for styling
- TypeScript for type safety
- Existing dashboard structure with basic admin, users, and settings pages

## Implementation Approach

### 1. Authentication & Authorization
- Implement admin role checking in Firebase
- Create middleware to protect admin routes
- Add admin-only authentication flow

### 2. Admin Dashboard Layout
- Create a dedicated admin layout component
- Implement navigation sidebar for admin functions
- Add header with admin-specific information

### 3. User Management Features
- **User Accounts View**
  - Display list of all users with key information (email, name, registration date, status)
  - Implement search functionality by email, name, or user ID
  - Add sorting capabilities by different fields
  - Create user detail modal/view for comprehensive information

- **User Management Actions**
  - View user profiles
  - Edit user information
  - Disable/enable user accounts
  - Delete users (with confirmation)

### 4. Subscription Management
- **Subscription View**
  - Display all user subscriptions
  - Show subscription status (active, expired, trial, etc.)
  - Filter by subscription status

- **Manual Management**
  - Extend user subscriptions
  - Cancel subscriptions with reason
  - Upgrade/downgrade subscription plans

### 5. Promo Code System
- **Promo Code Creation**
  - Form to create new promo codes
  - Set discount percentage or fixed amount
  - Configure expiration date
  - Set usage limits (total and per user)

- **Promo Code Management**
  - View all existing promo codes
  - Edit promo code details
  - Disable promo codes
  - Track promo code usage statistics

### 6. App Usage Data
- **Analytics Dashboard**
  - Display key metrics (active users, new signups, etc.)
  - Show referral program statistics
  - Visualize usage trends over time

### 7. Content Moderation
- **Reported Content View**
  - Display content reported by users
  - Show reporting user and reason
  - Implement action buttons (approve, reject, delete)

## File Structure Plan
```
src/
├── app/
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── subscriptions/
│   │   │   └── page.tsx
│   │   ├── promo-codes/
│   │   │   └── page.tsx
│   │   └── moderation/
│   │       └── page.tsx
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── UserTable.tsx
│   │   ├── SubscriptionTable.tsx
│   │   ├── PromoCodeForm.tsx
│   │   └── ReportedContentList.tsx
└── lib/
    └── admin/
        ├── auth.ts
        ├── users.ts
        ├── subscriptions.ts
        ├── promoCodes.ts
        └── moderation.ts
```

## UI Component Requirements
1. Data tables with sorting and filtering capabilities
2. Search bars and filter controls
3. Modal dialogs for confirmation and detailed views
4. Form components for data entry
5. Dashboard cards for displaying key metrics
6. Responsive design that works on different screen sizes

## Security Considerations
- All admin actions must be protected by authentication
- Role-based access control to ensure only authorized users can access
- Input validation for all admin forms
- Audit logging for sensitive admin actions

## Implementation Steps
1. Create admin layout and navigation components
2. Implement admin authentication checks
3. Build user management interface
4. Create subscription management features
5. Implement promo code system
6. Add app usage analytics dashboard
7. Build content moderation interface
8. Test all functionality with demo data
9. Document admin panel usage

## Demo Data Strategy
For initial implementation, we'll use static demo data to populate all views:
- Generate mock user data with various statuses
- Create sample subscription records
- Define example promo codes
- Simulate reported content items
- Create analytics data points

This approach allows us to build and test the UI without requiring backend integration initially.
