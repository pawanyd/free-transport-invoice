# GitHub Pages Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Ready
- [ ] All features working locally
- [ ] No console errors in browser
- [ ] Login works (admin/admin123)
- [ ] Can create freight records
- [ ] Can generate bilty/invoice
- [ ] Can download PDFs (under 1 MB)
- [ ] List page shows records
- [ ] Search functionality works

### ✅ Files Check
- [ ] node_modules/ is in .gitignore
- [ ] All paths are relative (no leading /)
- [ ] assets/lib/ contains all libraries:
  - [ ] jspdf.umd.min.js
  - [ ] html2canvas.min.js
  - [ ] sql-wasm.js
  - [ ] sql-wasm.wasm
- [ ] assets/images/ contains:
  - [ ] logo.svg
  - [ ] signature.svg
  - [ ] seal.svg

### ✅ Git Ready
- [ ] Repository created on GitHub
- [ ] Local git initialized
- [ ] .gitignore configured
- [ ] All changes committed

## Deployment Steps

### Step 1: Commit Code
```bash
git status                    # Check what will be committed
git add .                     # Add all files (node_modules excluded)
git commit -m "Deploy to GitHub Pages"
```

### Step 2: Push to GitHub
```bash
git push origin main
```

### Step 3: Enable GitHub Pages
1. Go to: `https://github.com/<username>/<repo-name>/settings/pages`
2. Under "Source":
   - Branch: **main**
   - Folder: **/ (root)**
3. Click **Save**
4. Wait 1-2 minutes

### Step 4: Get Your URL
Your site will be at:
```
https://<username>.github.io/<repo-name>/
```

## Post-Deployment Checklist

### ✅ Verify Deployment
- [ ] Visit your GitHub Pages URL
- [ ] Login page loads
- [ ] Can login with admin/admin123
- [ ] Main form loads
- [ ] Can create freight record
- [ ] Can generate documents
- [ ] Can download PDFs
- [ ] List page works
- [ ] No 404 errors in console

### ✅ Test All Pages
- [ ] `/` or `/index.html` - Main app
- [ ] `/login.html` - Login page
- [ ] `/list-documents.html` - List page

### ✅ Test All Features
- [ ] Authentication
- [ ] Form validation
- [ ] Data storage (LocalStorage)
- [ ] Document generation
- [ ] PDF export
- [ ] Search functionality

## Quick Commands

### Deploy for First Time
```bash
git add .
git commit -m "Initial deployment"
git push origin main
# Then enable GitHub Pages in settings
```

### Update Deployment
```bash
git add .
git commit -m "Update: [describe changes]"
git push origin main
# Auto-deploys in 1-2 minutes
```

### Check What Will Be Committed
```bash
git status
git diff
```

### Verify .gitignore Working
```bash
git status
# Should NOT see node_modules/ listed
```

## Common Issues & Fixes

### ❌ node_modules showing in git status
```bash
# Add to .gitignore
echo "node_modules/" >> .gitignore
git rm -r --cached node_modules/
git commit -m "Remove node_modules"
```

### ❌ 404 errors on assets
- Check paths are relative
- Verify files exist in repository
- Check file name case (case-sensitive)

### ❌ Blank page after deployment
- Check browser console for errors
- Verify all JS files loaded
- Test locally first

### ❌ PDF download not working
- Check html2canvas.min.js is committed
- Verify file size is correct (~195 KB)
- Test in different browser

## File Size Check

Before deploying, verify sizes:
```bash
# Check total size
du -sh .

# Check specific folders
du -sh assets/
du -sh node_modules/  # Should NOT be committed

# Check library files
ls -lh assets/lib/
```

Expected sizes:
- jspdf.umd.min.js: ~420 KB
- html2canvas.min.js: ~195 KB
- sql-wasm.js: ~48 KB
- sql-wasm.wasm: ~660 KB

## Repository Size Limit

GitHub Pages limit: **1 GB**

Your app size: **~1-2 MB** ✅

With node_modules: **~200 MB** ❌ (Don't commit!)

## Final Check

Before pushing:
```bash
# 1. Test locally
python -m http.server 8000
# Visit http://localhost:8000

# 2. Check git status
git status
# Verify node_modules NOT listed

# 3. Check .gitignore
cat .gitignore
# Should contain: node_modules

# 4. Ready to deploy!
git push origin main
```

## Success Indicators

✅ Deployment successful when:
- GitHub Actions shows green checkmark
- Your URL loads the login page
- All features work as expected
- No console errors
- PDFs download correctly

## Need Help?

1. Check browser console (F12)
2. Check GitHub Actions tab for errors
3. Verify all files committed: `git ls-files`
4. Test locally before deploying

---

**Ready? Let's deploy!**

```bash
git add .
git commit -m "Deploy Transport Invoice System"
git push origin main
```

Then enable GitHub Pages in repository settings!
