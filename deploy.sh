#!/bin/bash

# Simple Deployment Script for Reweave Authentication
# This script helps upload the account.html file to your web server

echo "🚀 Reweave Authentication Deployment Script"
echo "=========================================="
echo ""

# Check if account.html exists
if [ ! -f "account.html" ]; then
    echo "❌ account.html not found in current directory"
    echo "Please ensure you're in the project root folder"
    exit 1
fi

echo "✅ account.html found"
echo ""
echo "📋 Deployment Options:"
echo "1. Upload via FTP (requires FTP credentials)"
echo "2. Upload via SCP (requires SSH access)"
echo "3. Manual upload instructions"
echo "4. Test locally first"
echo ""

read -p "Choose option (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🌐 FTP Upload Setup"
        read -p "FTP Server (e.g., ftp.yourdomain.com): " ftp_server
        read -p "FTP Username: " ftp_user
        read -p "FTP Password: " -s ftp_pass
        echo ""
        read -p "Remote directory (usually /public_html or leave blank): " remote_dir
        
        echo ""
        echo "📤 Uploading via FTP..."
        
        # Create FTP commands file
        cat > ftp_commands.txt << EOF
        binary
        cd $remote_dir
        put account.html
        quit
        EOF
        
        # Execute FTP upload
        ftp -n $ftp_server <<END_SCRIPT
        quote USER $ftp_user
        quote PASS $ftp_pass
        $(cat ftp_commands.txt)
        END_SCRIPT
        
        rm ftp_commands.txt
        echo "✅ FTP upload complete!"
        ;;
        
    2)
        echo ""
        echo "🔐 SCP Upload Setup"
        read -p "SSH Server (e.g., user@yourdomain.com): " ssh_server
        read -p "Remote directory (e.g., /var/www/html): " remote_dir
        
        echo ""
        echo "📤 Uploading via SCP..."
        scp account.html $ssh_server:$remote_dir/
        
        if [ $? -eq 0 ]; then
            echo "✅ SCP upload successful!"
        else
            echo "❌ SCP upload failed - check SSH access"
        fi
        ;;
        
    3)
        echo ""
        echo "📋 Manual Upload Instructions"
        echo "==========================="
        echo ""
        echo "Option A: GoDaddy File Manager"
        echo "1. Log into GoDaddy → My Products → Web Hosting → Manage"
        echo "2. Click 'File Manager' → public_html folder"
        echo "3. Click 'Upload' → Select account.html → Upload"
        echo "4. Visit: https://reweave.shop/account.html"
        echo ""
        echo "Option B: cPanel File Manager"
        echo "1. Access cPanel through your hosting provider"
        echo "2. Open File Manager → public_html"
        echo "3. Upload account.html"
        echo "4. Set permissions to 644"
        echo ""
        echo "Option C: FTP Client"
        echo "1. Use FileZilla, Cyberduck, or similar"
        echo "2. Connect with FTP credentials from hosting provider"
        echo "3. Upload account.html to root directory"
        echo "4. Test at yourdomain.com/account.html"
        ;;
        
    4)
        echo ""
        echo "🧪 Testing Locally First"
        echo "========================"
        echo ""
        echo "1. Open terminal in this directory"
        echo "2. Run: python3 -m http.server 8000"
        echo "3. Open browser to: http://localhost:8000/account.html"
        echo "4. Test creating an account and logging in"
        echo ""
        echo "If it works locally, proceed with deployment"
        ;;
        
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎯 Next Steps:"
echo "1. Visit: https://reweave.shop/account.html"
echo "2. Test creating a new account"
echo "3. Test logging in with the new account"
echo "4. Check email confirmation"
echo ""
echo "📞 If issues occur:"
echo "- Check browser console (F12 → Console tab)"
echo "- Verify file uploaded to correct location"
echo "- Test in incognito/private browsing mode"
echo "- Contact hosting support if needed"

echo ""
echo "✨ Deployment complete!"