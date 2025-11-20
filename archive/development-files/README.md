# 🎨 Reweave E-Commerce Platform

A comprehensive e-commerce platform for authentic Malaysian batik products, designed to support local artisans while promoting sustainable fashion. Built with modern web technologies and featuring a batik-inspired design system.

## ✨ Features

### 🛍️ Customer Experience
- **Beautiful Product Showcase**: Batik-inspired design with authentic Malaysian aesthetics
- **Smart Product Filtering**: Advanced search, category filtering, and preorder management
- **Seamless Checkout**: Optimized conversion flow with multiple payment options
- **Customer Dashboard**: Order tracking, wishlist, loyalty program, and address management
- **Preorder System**: Early access to exclusive batik collections
- **Real-time Inventory**: Live stock updates and low stock notifications

### 🎯 Admin Command Center
- **Comprehensive Analytics**: Revenue tracking, customer insights, and conversion metrics
- **Inventory Management**: Real-time stock tracking, low stock alerts, and reorder management
- **Customer Management**: Segmentation, loyalty program, and communication tools
- **Order Management**: Order processing, fulfillment tracking, and returns handling
- **Marketing Tools**: Discount codes, email campaigns, and promotional banners
- **Popup Sales**: Physical event management with QR payments and analytics

### 🔧 Technical Features
- **Modern Architecture**: React + TypeScript frontend with Node.js + Express backend
- **Database**: PostgreSQL with comprehensive schema and relationships
- **Authentication**: JWT-based with role-based access control (RBAC)
- **Payment Integration**: Stripe, PayPal, FPX, and Malaysian e-wallets
- **Real-time Updates**: WebSocket support for inventory and order updates
- **Responsive Design**: Mobile-first approach with batik-inspired aesthetics
- **Performance Optimized**: Code splitting, lazy loading, and caching

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database or Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/reweave-ecommerce.git
   cd reweave-ecommerce
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   cd api && pnpm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment templates
   cp .env.example .env
   cp api/.env.example api/.env
   
   # Edit the files with your configuration
   ```

4. **Set up database**
   ```bash
   # Run database migrations
   pnpm run db:migrate
   ```

5. **Start development servers**
   ```bash
   # Start backend
   pnpm run dev:api
   
   # Start frontend (in another terminal)
   pnpm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Admin Panel: http://localhost:5173/admin

## 📁 Project Structure

```
reweave-ecommerce/
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   │   ├── auth/          # Authentication pages
│   │   ├── admin/         # Admin dashboard pages
│   │   └── UserDashboard.tsx
│   ├── services/          # API service layer
│   ├── stores/           # State management
│   ├── lib/              # Utility functions
│   └── assets/           # Static assets
├── api/                   # Backend API
│   ├── controllers/      # Route handlers
│   ├── routes/           # API endpoints
│   ├── middleware/       # Authentication & validation
│   └── lib/              # Database and utilities
├── supabase/             # Database migrations
│   └── migrations/       # SQL migration files
├── public/               # Static public files
└── dist/                 # Production build output
```

## 🎨 Design System

The platform features a unique batik-inspired design system with:

### Color Palette
- **Primary**: Deep Indigo (#1e3a8a) - Traditional batik dye
- **Secondary**: Sage Green (#10b981) - Natural dye inspiration
- **Accent**: Terracotta (#f97316) - Earth tones
- **Gold**: Premium accents (#f59e0b)
- **Neutral**: Sand, Ivory, and Pebble tones

### Typography
- **Display**: Elegant serif for headings
- **Body**: Clean sans-serif for readability
- **Icons**: Lucide React icons for consistency

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean input fields with focus states
- **Navigation**: Intuitive sidebar and header layouts

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

#### Backend (api/.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
PORT=3001
```

### Database Setup

The system uses PostgreSQL with the following key tables:

#### Users & Authentication
- `users` - User accounts and profiles
- `user_addresses` - Shipping and billing addresses
- `user_preferences` - User settings and preferences
- `user_loyalty_points` - Loyalty program tracking

#### Products & Inventory
- `products` - Product catalog
- `product_variants` - Size, color, and style variations
- `inventory` - Real-time stock tracking
- `preorder_batches` - Preorder campaign management
- `materials` - Raw material tracking

#### Orders & Payments
- `carts` - Shopping cart management
- `orders` - Order processing and tracking
- `payments` - Payment processing records
- `refunds` - Return and refund handling

#### Marketing & Analytics
- `discount_codes` - Promotional campaigns
- `customer_segments` - User segmentation
- `traffic_sources` - Marketing attribution
- `impact_metrics_log` - Sustainability tracking

## 🚀 Deployment

### Production Build
```bash
# Build for production
pnpm run build

# Build backend
cd api && pnpm run build

# Start production servers
pnpm start
```

### Deployment Options

#### Option 1: Vercel + Railway (Recommended)
- **Frontend**: Deploy to Vercel for automatic CI/CD
- **Backend**: Deploy to Railway for easy scaling
- **Database**: Use Supabase for managed PostgreSQL

#### Option 2: DigitalOcean App Platform
- Single platform for frontend, backend, and database
- Automatic SSL certificates
- Built-in monitoring and scaling

#### Option 3: AWS Deployment
- **Frontend**: S3 + CloudFront for static hosting
- **Backend**: EC2 instances with load balancing
- **Database**: RDS PostgreSQL with read replicas

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm run dev          # Start frontend dev server
pnpm run dev:api      # Start backend dev server
pnpm run dev:all      # Start both servers

# Building
pnpm run build        # Build frontend
pnpm run build:api    # Build backend
pnpm run build:all    # Build both

# Testing
pnpm run test         # Run all tests
pnpm run test:api     # Run backend tests
pnpm run test:ui      # Run frontend tests

# Database
pnpm run db:migrate   # Run migrations
pnpm run db:seed      # Seed database with sample data
pnpm run db:reset     # Reset database
```

### Code Style

The project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Conventional Commits** for commit messages

### API Documentation

The backend API includes comprehensive endpoints:

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh

#### Products
- `GET /api/products` - Get products with filtering
- `GET /api/products/:id` - Get single product
- `POST /api/products/:id/reviews` - Create product review

#### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `POST /api/orders/:id/payment` - Process payment

#### Admin
- `GET /api/admin/analytics` - Business analytics
- `GET /api/admin/customers` - Customer management
- `GET /api/admin/inventory` - Inventory tracking

See the API routes in `api/routes/` for complete documentation.

## 📊 Analytics & Monitoring

### Built-in Analytics
- Revenue tracking and growth metrics
- Customer behavior analysis
- Product performance insights
- Inventory turnover rates
- Marketing campaign effectiveness

### External Integrations
- **Google Analytics**: Website traffic and user behavior
- **Facebook Pixel**: Social media advertising tracking
- **Stripe Analytics**: Payment processing insights
- **Sentry**: Error tracking and performance monitoring

### Business Intelligence
- Customer segmentation and targeting
- Lifetime value calculations
- Churn prediction and retention analysis
- Inventory optimization recommendations

## 🎨 Customization

### Theme Customization
Modify the design system in `src/styles/`:
```css
/* Update color variables */
:root {
  --color-primary: #1e3a8a;
  --color-secondary: #10b981;
  --color-accent: #f97316;
}
```

### Component Customization
Extend components in `src/components/`:
```tsx
// Create custom components
export function CustomButton({ children, ...props }) {
  return (
    <button className="custom-button-styles" {...props}>
      {children}
    </button>
  );
}
```

### Adding New Features
1. Create database migration in `supabase/migrations/`
2. Add backend API endpoints in `api/routes/`
3. Create frontend components in `src/components/`
4. Update services in `src/services/`
5. Add tests for new functionality

## 🔒 Security

### Authentication
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on authentication endpoints
- Session management with secure cookies

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection with React
- CSRF protection on forms

### Payment Security
- PCI DSS compliance through payment providers
- No credit card data stored locally
- Secure webhook endpoints
- Fraud detection integration

## 🌟 Sustainability Features

### Artisan Support
- Direct artisan profiles and stories
- Fair trade pricing transparency
- Community impact tracking
- Cultural heritage preservation

### Environmental Impact
- Plastic bag savings calculation
- Carbon footprint tracking
- Sustainable material sourcing
- Recycling program integration

### Social Responsibility
- Local community support programs
- Educational initiatives
- Cultural preservation efforts
- Transparent supply chain

## 📞 Support

### Getting Help
- Check the [troubleshooting guide](DEPLOYMENT.md#troubleshooting)
- Review application logs
- Check monitoring dashboards
- Contact development team

### Contributing
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review and merge

### Reporting Issues
- Use GitHub Issues for bug reports
- Include reproduction steps
- Provide environment details
- Attach relevant logs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Malaysian batik artisans for their beautiful craft
- Local communities supporting traditional crafts
- Open source contributors and maintainers
- Design inspiration from Malaysian culture

---

**Made with ❤️ for Malaysian batik artisans and sustainable fashion enthusiasts.**

For more information, visit our website or contact us at hello@reweave.com