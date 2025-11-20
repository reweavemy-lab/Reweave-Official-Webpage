# Reweave Authentication System

## Main Files (Keep in Root)

### account.html
- **Purpose**: Complete authentication system with login/signup functionality
- **Features**: 
  - Direct Supabase integration
  - User registration and login
  - Password reset functionality
  - User profile display
  - Responsive design
- **Usage**: Deploy this file to enable user authentication on your website

### index.html
- **Purpose**: Main landing page (existing)
- **Status**: Keep as-is for now

## Archive Structure

All development files, deployment packages, and test files have been organized into the `archive/` folder:

```
archive/
├── backend-files/          # All backend API code
├── config-files/         # Configuration files (package.json, etc.)
├── deployment-packages/  # Ready-to-deploy packages for different platforms
├── development-files/    # Test files and development versions
├── docs/                 # Documentation and design files
├── reweave-batik-luxe/   # Frontend project files
└── scripts/              # Deployment and backup scripts
```

## Quick Deployment

1. **Upload account.html** to your web server
2. **Configure DNS** to point to your authentication page
3. **Test authentication** - users can now create accounts and log in

## Supabase Configuration

The authentication system connects directly to Supabase with:
- URL: `https://dkpaeiyixdwzjpvvszyy.supabase.co`
- Anonymous key provided in the code
- Email confirmation enabled
- Password reset functionality

## Next Steps

- Deploy `account.html` to your live domain
- Test user registration and login functionality
- Customize styling if needed (all CSS is embedded in the HTML file)