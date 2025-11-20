# Vercel Deployment Package for Reweave Authentication

This package is configured for Vercel deployment to maintain reweave.shop domain.

## Files:
- account.html - Authentication system
- vercel.json - Vercel configuration
- package.json - Project metadata

## Deployment Steps:

### Method 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### Method 2: Vercel Dashboard
1. Go to vercel.com
2. Click "New Project"
3. Drag and drop this folder
4. Deploy

### Method 3: Git Integration (Advanced)
1. Push this to GitHub
2. Connect GitHub to Vercel
3. Auto-deploy on push

## URL Configuration:
After deployment, you'll get a Vercel URL like:
- https://reweave-auth.vercel.app

Then configure your DNS:
- Add CNAME record: account.reweave.shop → reweave-auth.vercel.app
- Or use the main domain with proper routing

## Testing:
After deployment, test:
- https://[your-vercel-url].vercel.app/account.html
- Create account functionality
- Login functionality
- Email confirmation

## Success Indicators:
✅ Page loads with purple gradient
✅ Login/Signup tabs work
✅ Can create new accounts
✅ Can login with created accounts
✅ Email confirmations sent