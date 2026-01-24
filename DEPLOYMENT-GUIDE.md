# GitHub Pages Deployment Guide

## Quick Deployment Steps

### Option 1: Deploy from Main Branch (Recommended)

1. **Commit your code** (node_modules is already excluded):
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **main** branch
   - Select **/ (root)** folder
   - Click **Save**

3. **Wait 1-2 minutes** for deployment

4. **Access your site**:
   - URL: `https://<your-username>.github.io/<repository-name>/`
   - Example: `https://johndoe.github.io/transport-invoice/`

### Option 2: Deploy from gh-pages Branch

1. **Create gh-pages branch**:
```bash
git checkout -b gh-pages
git push origin gh-pages
```

2. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Select **gh-pages** branch
   - Click **Save**

## What Gets Deployed

### ✅ Files Included in Deployment:
```
├── index.html
├── list-documents.html
├── login.html
├── assets/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── lib/
├── docs/ (optional - for documentation)
└── README.md
```

### ❌ Files Excluded (in .gitignore):
```
node_modules/     # NOT needed for deployment
.kiro/           # Development files
.vscode/         # Editor settings
tests/           # Optional - can include or exclude
```

## Important Notes

### 1. Node Modules
- **DO NOT** commit node_modules
- They're only for development (Jest testing)
- Your app runs 100% in the browser
- All required libraries are in `assets/lib/`:
  - jspdf.umd.min.js
  - html2canvas.min.js
  - sql-wasm.js
  - sql-wasm.wasm

### 2. File Paths
All paths are already relative, so they'll work on GitHub Pages:
```javascript
// ✅ Correct (already in your code)
src="assets/lib/jspdf.umd.min.js"
src="assets/js/auth.js"

// ❌ Wrong (don't use absolute paths)
src="/assets/lib/jspdf.umd.min.js"
```

### 3. Test Files
You can choose to:
- **Include tests/** - Users can run tests
- **Exclude tests/** - Add to .gitignore for cleaner deployment

## Deployment Commands

### First Time Deployment
```bash
# 1. Check status
git status

# 2. Add all files (node_modules already excluded)
git add .

# 3. Commit
git commit -m "Initial deployment"

# 4. Push to GitHub
git push origin main

# 5. Enable GitHub Pages in repository settings
```

### Update Deployment
```bash
# 1. Make your changes
# 2. Commit and push
git add .
git commit -m "Update application"
git push origin main

# GitHub Pages will auto-deploy in 1-2 minutes
```

## Verify Deployment

### 1. Check Build Status
- Go to repository → **Actions** tab
- Look for "pages build and deployment"
- Should show green checkmark ✅

### 2. Test Your Site
Visit: `https://<username>.github.io/<repo-name>/`

Test these pages:
- `/` or `/index.html` - Main app
- `/login.html` - Login page
- `/list-documents.html` - List page

### 3. Check Browser Console
- Open DevTools (F12)
- Check for any 404 errors
- Verify all assets load correctly

## Troubleshooting

### Issue: 404 Page Not Found
**Solution**: 
- Ensure repository is public (or GitHub Pro for private)
- Check Settings → Pages is enabled
- Wait 2-3 minutes after enabling

### Issue: Assets not loading (404 errors)
**Solution**:
- Check all paths are relative (no leading `/`)
- Verify files exist in repository
- Check file names match exactly (case-sensitive)

### Issue: Blank page
**Solution**:
- Check browser console for errors
- Verify JavaScript files are loading
- Test locally first: `python -m http.server 8000`

### Issue: Database not working
**Solution**:
- This is normal - uses browser LocalStorage
- Each user has their own local database
- Data doesn't persist across browsers/devices

## Custom Domain (Optional)

### Add Custom Domain
1. Buy a domain (e.g., from Namecheap, GoDaddy)
2. In repository Settings → Pages
3. Add your custom domain
4. Update DNS records at your domain provider:
```
Type: CNAME
Name: www
Value: <username>.github.io
```

## Security Notes

### Default Credentials
⚠️ **Important**: Change default login credentials!

Current defaults:
- Username: `admin`
- Password: `admin123`

To change, users must:
1. Login with defaults
2. Create new user in browser console
3. Or modify `assets/js/datastore.js`

### Data Privacy
- All data stored locally in browser
- No server-side storage
- No data transmission to external servers
- Users should backup their data regularly

## Performance Tips

### 1. Enable Caching
GitHub Pages automatically caches static files.

### 2. Optimize Images
If you add more images:
```bash
# Optimize SVG files
npm install -g svgo
svgo assets/images/*.svg
```

### 3. Monitor Size
Keep repository under 1 GB (GitHub limit).

Current size breakdown:
- HTML files: ~50 KB
- JavaScript: ~100 KB
- Libraries: ~850 KB
- Images: ~50 KB
- **Total: ~1 MB** ✅

## Maintenance

### Regular Updates
```bash
# Pull latest changes
git pull origin main

# Make updates
# ... edit files ...

# Deploy updates
git add .
git commit -m "Update: description of changes"
git push origin main
```

### Backup
Regularly backup:
1. Repository (already on GitHub)
2. User data (export from browser LocalStorage)

### Monitoring
- Check GitHub Pages status regularly
- Test functionality after updates
- Monitor browser console for errors

## Alternative Deployment Options

### 1. Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### 2. Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### 3. Cloudflare Pages
- Connect GitHub repository
- Auto-deploy on push
- Free SSL and CDN

## Summary

✅ **DO**:
- Commit HTML, CSS, JS files
- Commit assets/lib/ folder
- Use relative paths
- Test locally before deploying
- Keep repository under 1 GB

❌ **DON'T**:
- Commit node_modules/
- Use absolute paths
- Store sensitive data in code
- Forget to test after deployment

---

**Ready to Deploy?**
```bash
git add .
git commit -m "Ready for GitHub Pages"
git push origin main
```

Then enable GitHub Pages in repository settings!
