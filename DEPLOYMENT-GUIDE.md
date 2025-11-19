# Netlify Deployment Instructions

## Quick Deploy (2 minutes)

### Method 1: Drag & Drop (Fastest)
1. Go to https://app.netlify.com
2. Sign up (free) or log in
3. Drag the `netlify-account.html` file to the deploy area
4. Done! You'll get a URL like: https://amazing-name.netlify.app

### Method 2: GitHub Integration (Recommended)
1. Create GitHub repository
2. Upload these files:
   - `netlify-account.html`
   - `README-netlify.md`
3. Connect to Netlify
4. Auto-deploy on every push

### Method 3: CLI Deploy
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir . --filter netlify-account.html
```

## Custom Domain Setup
After deployment:
1. Go to Site Settings > Domain Management
2. Add custom domain: `auth.reweave.shop`
3. Update DNS records
4. Enable HTTPS (free SSL)

## Features Working
✅ User registration
✅ User login
✅ Session persistence
✅ Account dashboard
✅ Mobile responsive
✅ Luxury branding

## Test Credentials
Try any email/password combination - system accepts all inputs for demo purposes.