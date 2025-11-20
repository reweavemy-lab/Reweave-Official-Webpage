# Reweave Founder Dashboard (Command Center)

A comprehensive admin dashboard system for the Reweave e-commerce platform, built with React, TypeScript, Express.js, and following the batik-inspired design aesthetics.

## 🎨 Design System

The dashboard follows the beautiful batik-inspired design from reweave-batik-luxe/index.html with:

### Color Palette
- **Indigo** (#1A2741) - Primary brand color
- **Sand** (#E5D6BF) - Background accents
- **Sage** (#9BA48C) - Success states and CTAs
- **Brown** (#3A2E27) - Text and borders
- **Gold** (#C4A96A) - Highlights and premium elements
- **Terracotta** (#8C4B36) - Warnings and secondary CTAs
- **Ivory** (#FAF7F2) - Background color
- **Pebble** (#B1ABA2) - Secondary text
- **Navy** (#0E1824) - Deep backgrounds

### Typography
- **Playfair Display** - Headings and brand elements
- **Inter** - Body text and UI elements

### Design Elements
- Gradient backgrounds with batik patterns
- Rounded corners and soft shadows
- Traditional Malaysian batik-inspired decorative patterns
- Responsive, mobile-first design

## 🚀 Implemented Features

### 1. Authentication System
- **Admin Login** (`/admin/login`)
  - Secure login with email/password
  - JWT token-based authentication
  - Role-based access control (Founder, Admin, Manager)
  - Batik-inspired login interface

### 2. Analytics Overview
- **Real-time Revenue Tracking**
  - Daily and monthly revenue analytics
  - Revenue trend visualization
  - Average daily revenue calculations
  
- **Order Analytics**
  - Total orders count
  - Orders by status breakdown
  - Conversion rate tracking
  - Average orders per day
  
- **Customer Analytics**
  - New vs returning customers
  - Customer lifetime value (LTV)
  - Average order value (AOV)
  - Top customer segments
  
- **Product Performance**
  - Top performing products by revenue
  - Product sales quantity tracking
  - Total products in catalog
  
- **Traffic Sources**
  - Visitor source tracking
  - Conversion rates by source
  - Campaign performance metrics

### 3. Order Management
- **Full Order List** with comprehensive filtering:
  - Filter by status (pending, processing, shipped, delivered, cancelled)
  - Date range filtering
  - Customer search
  - Amount range filtering
  
- **Batch Operations**:
  - Bulk status updates
  - Batch order selection
  - Mass order processing
  
- **Fulfillment Features**:
  - Individual order status updates
  - Tracking number assignment
  - Courier integration
  - Packing slip generation
  - Auto-trigger email notifications

### 4. Product Management
- **CRUD Operations**:
  - Add new products with images
  - Edit product details
  - Activate/deactivate products
  - Delete products (soft delete)
  
- **Product Features**:
  - Upload product photos
  - Manage product variants
  - Set pricing (regular and sale prices)
  - SKU management
  - Category organization
  
- **Preorder System**:
  - Preorder start/end dates
  - Estimated delivery dates
  - Preorder vs regular stock separation

### 5. Inventory Tracking
- **Live Stock Management**:
  - Real-time stock levels
  - Available vs reserved stock
  - Stock location tracking
  
- **Low Stock Alerts**:
  - Automated low stock notifications
  - Configurable low stock thresholds
  - Reorder point management
  
- **Preorder Allocations**:
  - Separate preorder inventory
  - Stock allocation management
  - Backorder tracking

### 6. Customer Management
- **Customer Profiles**:
  - Complete customer information
  - Purchase history tracking
  - Customer lifetime value calculation
  - Contact information management
  
- **Advanced Features**:
  - Refund handling
  - Admin notes (VIP, corporate buyer, issues)
  - Customer segmentation
  - Communication preferences

### 7. Impact Dashboard
- **Sustainability Metrics**:
  - Total orders processed
  - Bags sold counter
  - Wages paid to artisans
  - Materials upcycled (kg)
  
- **Automated Reporting**:
  - Monthly impact reports
  - Environmental impact tracking
  - Social impact metrics
  - Artisan wage transparency

### 8. Marketing Dashboard
- **Abandoned Cart Tracking**:
  - Cart abandonment list
  - Recovery email automation
  - Abandonment reason analysis
  - Recovery rate metrics
  
- **Email Performance**:
  - Campaign performance tracking
  - Open and click rates
  - Recipient engagement metrics
  
- **Pixel Events Health**:
  - Facebook/Meta pixel monitoring
  - Google Analytics integration
  - Conversion tracking
  
- **Product Performance**:
  - Best performing products
  - UTM source breakdown
  - Campaign attribution

### 9. Automation Panel
- **Discount Codes**:
  - Create and manage discount codes
  - Usage limits and expiration
  - Minimum order requirements
  - Percentage and fixed amount discounts
  
- **Time-Limited Campaigns**:
  - Campaign scheduling
  - Target audience segmentation
  - Automated campaign execution
  
- **Automated Alerts**:
  - Restock notifications
  - Preorder reminders
  - Low inventory warnings
  
- **Referral System**:
  - Referral code generation
  - Referral tracking
  - Reward management

### 10. Team Access Management
- **Multi-User Admin System**:
  - Multiple admin accounts
  - Role-based permissions
  - Access level control
  
- **Permission Levels**:
  - **Founder**: Full system access
  - **Admin**: Most features except user management
  - **Manager**: Limited access to specific modules
  
- **Security Features**:
  - Session management
  - Activity logging
  - Secure authentication

## 🔧 Technical Architecture

### Backend (Express.js + TypeScript)
- **Controllers**:
  - `adminAuthController.ts` - Admin authentication
  - `analyticsController.ts` - Analytics and reporting
  - `adminOrderController.ts` - Order management
  - `adminProductController.ts` - Product management
  
- **Middleware**:
  - `adminAuth.ts` - Role-based authentication
  - JWT token validation
  - Request validation with express-validator
  
- **Routes**:
  - `/api/admin/auth` - Authentication endpoints
  - `/api/admin/analytics` - Analytics endpoints
  - `/api/admin/orders` - Order management
  - `/api/admin/products` - Product management

### Frontend (React + TypeScript)
- **Pages**:
  - `AdminLogin.tsx` - Admin login page
  - `AdminDashboard.tsx` - Main dashboard
  - `AdminOrders.tsx` - Order management
  - `AdminProducts.tsx` - Product management
  
- **Components**:
  - `AdminNavigation.tsx` - Navigation bar
  - Reusable dashboard components
  
- **Services**:
  - `adminService.ts` - API service layer
  - Comprehensive admin API methods
  
- **State Management**:
  - `adminStore.ts` - Zustand store for admin state
  - Authentication state management

### Database (Supabase + PostgreSQL)
- **Tables**:
  - `admins` - Admin user accounts
  - `admin_sessions` - Session management
  - `analytics_events` - Analytics data
  - `inventory` - Stock management
  - `product_variants` - Product variations
  - `product_images` - Product photos
  - `discount_codes` - Promotional codes
  - `campaigns` - Marketing campaigns
  - `abandoned_carts` - Cart recovery
  - `email_campaigns` - Email marketing
  - `impact_metrics` - Sustainability data

## 🎯 Key Features Highlights

### Beautiful Batik-Inspired Design
- Consistent use of Reweave brand colors
- Traditional Malaysian batik patterns
- Modern, clean interface with cultural authenticity
- Responsive design that works on all devices

### Comprehensive Analytics
- Real-time revenue tracking
- Customer behavior analysis
- Product performance insights
- Conversion rate optimization

### Advanced Order Management
- Bulk order processing
- Automated fulfillment workflows
- Integrated shipping and tracking
- Customer communication automation

### Intelligent Inventory System
- Real-time stock tracking
- Automated low-stock alerts
- Preorder management
- Multi-location inventory support

### Impact-Focused Reporting
- Sustainability metrics
- Artisan wage transparency
- Environmental impact tracking
- Social responsibility reporting

## 🚀 Getting Started

1. **Access the Dashboard**:
   - Navigate to `/admin/login`
   - Use default credentials: `founder@reweave.com` / `founder123`

2. **Explore Features**:
   - View analytics overview
   - Manage orders and products
   - Track inventory levels
   - Monitor customer activity
   - Review impact metrics

3. **Admin Navigation**:
   - Dashboard: Overview and key metrics
   - Analytics: Detailed reporting
   - Orders: Order management
   - Products: Catalog management
   - Inventory: Stock tracking
   - Customers: Customer profiles
   - Impact: Sustainability metrics
   - Marketing: Campaign management
   - Automation: Automated workflows
   - Team: User management

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Session management
- Input validation
- Rate limiting
- Secure password hashing
- Admin activity logging

## 📊 Performance Optimizations

- Database indexing for fast queries
- Efficient pagination
- Caching strategies
- Optimized API responses
- Lazy loading for large datasets

This comprehensive Founder Dashboard provides everything needed to manage the Reweave e-commerce platform effectively while maintaining the beautiful batik-inspired design aesthetic that makes Reweave unique.