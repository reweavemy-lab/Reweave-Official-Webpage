# Reweave Official Website

This is the official website for Reweave, a sustainable fashion brand that connects culture, community, and sustainability.

## Project Overview

The Reweave website is a content + commerce platform that:
- Tells Reweave's story
- Sells products
- Supports an AI try-on feature
- Hosts a community gallery
- Reports impact metrics

## Tech Stack

- **Frontend, SSR**: Next.js (React) with Tailwind CSS
- **Backend**: Node.js serverless functions (Next.js API routes)
- **CMS**: Sanity or Strapi for content and editorial flows
- **E-commerce / Payments**: Headless Shopify or custom product + Stripe (with iPay88 for Malaysian payments)
- **Media storage**: Cloudinary (images) + AWS S3 for raw uploads
- **Auth**: NextAuth (email + magic link) or Auth0
- **AI try-on**: TensorFlow.js / MediaPipe for in-browser pose segmentation
- **Hosting / Deployment**: Vercel
- **Analytics**: Google Analytics 4

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-org/reweave-website.git
cd reweave-website
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and shared code
- `/public` - Static assets
- `/styles` - Global styles and Tailwind configuration
- `/api` - API routes for serverless functions

## Features

- Homepage with hero video/carousel
- Our Story page with timeline and team profiles
- Shop/Collection pages with filters
- Product detail pages with high-res images and videos
- AI Try-On feature for virtual product testing
- Community Hub for user-submitted content
- Impact Dashboard showing sustainability metrics
- Journal/Blog for events and product features
- Contact, B2B, and FAQ pages

## License

All rights reserved © Reweave