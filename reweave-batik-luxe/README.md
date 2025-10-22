# Reweave - Batik Luxe Collection Website

A luxurious, cultural, and modern website for Reweave's Batik Luxe drop, showcasing sustainable fashion that connects culture, community, and environmental responsibility.

## 🎨 Design System: "Batik Luxe"

### Color Palette
- **Deep Indigo** `#1A2741` - Main brand color, logo, headings, hero backgrounds
- **Warm Sand** `#E5D6BF` - Soft background, packaging, neutral tone
- **Muted Sage** `#9BA48C` - Subtle sustainability accent (buttons, hover states)
- **Charcoal Brown** `#3A2E27` - Dark neutral for text and structure
- **Burnished Gold** `#C4A96A` - Craftsmanship and detail, matte not metallic
- **Terracotta Umber** `#8C4B36` - Cultural warmth, used sparingly in highlights
- **Ivory Mist** `#FAF7F2` - Light sections, whitespace
- **Pebble Gray** `#B1ABA2` - Secondary text and dividers
- **Midnight Navy** `#0E1824` - Footer, overlays, contrast backgrounds

### Typography
- **Display Font**: Playfair Display (serif) - quiet luxury, modern serif
- **Body Font**: Inter (sans-serif) - readable and clean
- **Text Color**: `#2E2B28`

## 🚀 Features

### Core Pages
1. **Homepage** - "Where Culture Moves"
   - Full-screen hero video (artisans + athletes)
   - Pillar cards (Culture, Community, Sustainability)
   - Featured Product showcase
   - Community CTA and newsletter signup

2. **Our Story**
   - Timeline: YLA origins → national champion → incorporation
   - Team profiles (Howie, Jeany, Amyla)
   - Impact counters with live values
   - Artisan video clips

3. **Shop**
   - Advanced filtering (collection, material, lifestyle)
   - Product cards with stories and AI Try-On CTA
   - E-commerce integration ready

4. **Product Detail**
   - Image gallery with product story
   - Artisan information and sustainability stats
   - Try It On, Add to Cart, Post Your Fit buttons

5. **AI Try-On**
   - Upload or live camera input
   - Pose detection using TensorFlow.js/MediaPipe
   - Product overlay on shoulder points
   - Share to community gallery

6. **Community Hub - "Your Reweave"**
   - User gallery with fits and stories
   - Upload flow with photo, caption, product tagging
   - Like/comment system
   - Monthly featured posts

7. **Impact Dashboard**
   - Live metrics: wages, revenue, donations, bags sold
   - Artisan stories and NGO partnerships
   - Progress tracking toward 2025 goals

8. **Journal/Updates**
   - CMS-driven blog for stories and events
   - Category filtering and search

## 🛠 Technical Stack

### Frontend
- **HTML5** with semantic markup
- **Tailwind CSS** for styling with custom design system
- **Vanilla JavaScript** for interactions
- **TensorFlow.js** for AI pose detection
- **MediaPipe** for advanced pose detection

### Backend Integration Ready
- **CMS**: Sanity or Strapi for content management
- **E-commerce**: Shopify API or Stripe + iPay88
- **Media**: Cloudinary for images, S3 for uploads
- **Analytics**: GA4, Sentry for error monitoring
- **Authentication**: NextAuth (magic link)

### AI Try-On Features
- Client-side pose detection via TensorFlow.js/MediaPipe
- Overlay bag on shoulder points
- Optional vendor API (Banuba/Vue.ai) for production quality
- Real-time camera integration
- Download and share functionality

### Community Features
- Upload with moderation flow (Google Vision SafeSearch)
- User authentication via NextAuth
- Cloudinary image hosting
- Like/comment system with Firestore or Prisma DB

## 📁 Project Structure

```
reweave-batik-luxe/
├── index.html                 # Main homepage
├── src/
│   ├── components/
│   │   ├── Layout.jsx         # Main layout component
│   │   ├── AITryOn.jsx        # AI Try-On functionality
│   │   ├── CommunityHub.jsx   # Community gallery
│   │   └── ImpactDashboard.jsx # Impact metrics
│   ├── styles/
│   │   └── globals.css        # Global styles and design system
│   └── pages/                 # Individual page components
├── public/
│   ├── images/                # Product and lifestyle images
│   ├── videos/                # Hero videos and content
│   └── models/                # AI model files
├── docs/                      # Documentation
└── tailwind.config.js         # Tailwind configuration
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Local server for development (optional)

### Installation

1. **Clone or download the project**
   ```bash
   git clone [repository-url]
   cd reweave-batik-luxe
   ```

2. **Open in browser**
   ```bash
   # Option 1: Direct file opening
   open index.html
   
   # Option 2: Local server (recommended)
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

3. **For development with Tailwind CSS**
   ```bash
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

### AI Try-On Setup

1. **Download TensorFlow.js models**
   ```bash
   # Download MoveNet model
   mkdir -p public/models/movenet
   # Place model files in public/models/movenet/
   ```

2. **Configure pose detection**
   - Update model paths in `AITryOn.jsx`
   - Test with sample images
   - Adjust pose detection parameters

## 🎯 Key Features Implementation

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interactions
- Optimized images and videos

### Performance
- Lazy loading for images
- Optimized video compression
- Minimal JavaScript bundle
- CSS optimization with Tailwind

### Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

### SEO Optimization
- Meta tags and descriptions
- Structured data markup
- Open Graph tags
- Twitter Card support
- Sitemap generation

## 📊 Analytics & Tracking

### Key Performance Indicators
- Conversion rate (Shop → Checkout)
- Try-On engagement metrics
- Community uploads and interactions
- Impact page visits
- Artisan wages per product

### Performance Targets
- Load time < 2.5s on 4G
- Mobile-first responsiveness
- 90+ Lighthouse score
- Core Web Vitals compliance

## 🔧 Customization

### Design System
- Update colors in `tailwind.config.js`
- Modify typography in `globals.css`
- Adjust spacing and layout variables

### Content Management
- Replace placeholder content with real data
- Update product information
- Add real artisan stories
- Implement CMS integration

### AI Try-On
- Adjust pose detection sensitivity
- Add more product overlays
- Implement advanced AI features
- Integrate with production APIs

## 🚀 Deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Configure build settings
3. Set environment variables
4. Deploy automatically on push

### Manual Deployment
1. Build static files
2. Upload to web server
3. Configure CDN for assets
4. Set up analytics tracking

## 📱 Mobile Optimization

- Touch-friendly interface
- Optimized images for mobile
- Fast loading on 3G/4G
- Offline functionality
- Progressive Web App features

## 🔒 Security

- Content Security Policy
- HTTPS enforcement
- Input validation
- XSS protection
- CSRF tokens

## 📈 Future Enhancements

- Advanced AI try-on with 3D models
- Augmented reality features
- Social commerce integration
- Multi-language support
- Advanced analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is proprietary to Reweave. All rights reserved.

## 📞 Support

For technical support or questions:
- Email: tech@reweave.com
- Documentation: [docs.reweave.com]
- Community: [community.reweave.com]

---

**Reweave - Where Culture Moves** 🌿✨

*Sustainable fashion that connects heritage, community, and environmental responsibility.*
