# Vite Complete Setup Guide

## ✅ Setup Complete!

Your project now uses **Vite** with a Laravel Blade-like templating system that works perfectly with GitHub Pages.

## 🚀 Quick Start

### Development
```bash
# Make sure you're using Node 22
nvm use 22

# Start development server
npm run dev
```

Opens at `http://localhost:3000` with hot reload!

### Build for Production
```bash
npm run build
```

Outputs to `dist/` folder - ready for GitHub Pages!

### Preview Production Build
```bash
npm run preview
```

## 📝 Template Syntax

### Including Components

```html
<%- include('components/layout/header', { 
    activePage: 'create'
}) %>
```

### Component with Multiple Props

```html
<%- include('components/forms/text-input', { 
    id: 'email',
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: '*',
    requiredAttr: 'required',
    step: '',
    min: '',
    placeholder: 'Enter your email'
}) %>
```

### Conditional Rendering in Components

```html
<!-- In component file -->
<a href="./index.html" class="<%= activePage === 'create' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600' %>">
    Create New
</a>
```

## 📁 Project Structure

```
project/
├── components/              ← Reusable components
│   ├── layout/
│   │   ├── header.html
│   │   └── auth-header.html
│   ├── forms/
│   │   ├── city-input.html
│   │   ├── text-input.html
│   │   └── textarea-input.html
│   └── ui/
│       ├── alert.html
│       ├── pagination.html
│       └── modal.html
├── assets/                  ← Source files
│   ├── css/
│   ├── js/
│   └── lib/
├── public/                  ← Static files (copied as-is)
├── index.html               ← Main pages (with includes)
├── list-documents.html
├── login.html
├── register.html
├── vite.config.js           ← Vite configuration
├── package.json
└── dist/                    ← Built files (for deployment)
    ├── index.html           ← Processed HTML
    ├── list-documents.html
    ├── login.html
    ├── register.html
    └── assets/              ← Optimized assets
```

## 🔧 How It Works

### 1. Development Mode (`npm run dev`)
- Vite starts a dev server
- Watches for file changes
- Processes includes on-the-fly
- Hot reloads instantly

### 2. Build Mode (`npm run build`)
- Processes all HTML files
- Replaces `<%- include() %>` with actual component HTML
- Evaluates `<%= expressions %>`
- Minifies HTML, CSS, JS
- Optimizes assets
- Outputs to `dist/`

### 3. The Magic
Our custom Vite plugin (`vite.config.js`) processes:
- `<%- include('path', { data }) %>` - Includes components
- `<%= variable %>` - Replaces with data
- `<%= condition ? 'a' : 'b' %>` - Conditional expressions

## 📦 What Gets Built

### Before (Source)
```html
<!-- index.html -->
<%- include('components/layout/header', { 
    activePage: 'create'
}) %>
```

### After (Built)
```html
<!-- dist/index.html -->
<header class="bg-white shadow-md rounded-lg p-6 mb-6">
    <div class="flex justify-between items-center mb-4">
        <h1>Transport Invoice Management System</h1>
        <button id="logoutBtn">Logout</button>
    </div>
    <nav>
        <ul>
            <li>
                <a href="./index.html" class="text-blue-600 font-bold border-b-2 border-blue-600">
                    Create New
                </a>
            </li>
            ...
        </ul>
    </nav>
</header>
```

## 🌐 GitHub Pages Deployment

### Option 1: Manual Deployment

```bash
# Build
npm run build

# Add dist folder (it's in .gitignore by default)
git add dist/ -f
git commit -m "Deploy to GitHub Pages"
git push origin main
```

**GitHub Pages Settings:**
- Go to repository Settings → Pages
- Source: Deploy from a branch
- Branch: `main`
- Folder: `/dist`
- Save

### Option 2: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build CSS
        run: npm run build:css
      
      - name: Build with Vite
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**GitHub Pages Settings:**
- Source: GitHub Actions

## 🎨 Creating New Components

### 1. Create Component File

```html
<!-- components/ui/card.html -->
<div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold mb-2"><%= title %></h3>
    <p class="text-gray-600 mb-4"><%= description %></p>
    <button class="<%= buttonClass %>"><%= buttonText %></button>
</div>
```

### 2. Use in Page

```html
<%- include('components/ui/card', { 
    title: 'My Card',
    description: 'Card description here',
    buttonClass: 'bg-blue-500 text-white px-4 py-2 rounded',
    buttonText: 'Click Me'
}) %>
```

## 🔍 Troubleshooting

### Issue: Changes not appearing in dev mode

**Solution:**
```bash
# Stop server (Ctrl+C)
# Clear Vite cache
rm -rf node_modules/.vite
# Restart
npm run dev
```

### Issue: Build fails

**Solution:**
```bash
# Check Node version
node -v  # Should be 22.x

# Switch to Node 22
nvm use 22

# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Components not found

**Solution:** Check paths are relative to project root:
```html
<!-- Correct -->
<%- include('components/layout/header', { ... }) %>

<!-- Wrong -->
<%- include('./components/layout/header', { ... }) %>
<%- include('/components/layout/header', { ... }) %>
```

### Issue: Assets not loading in production

**Solution:** Use relative paths:
```html
<!-- Correct -->
<link rel="stylesheet" href="./assets/css/styles.css">
<script src="./assets/js/app.js"></script>

<!-- Wrong -->
<link rel="stylesheet" href="/assets/css/styles.css">
<script src="/assets/js/app.js"></script>
```

## 📊 Benefits

| Feature | Before | With Vite |
|---------|--------|-----------|
| Template Syntax | JavaScript | EJS (Laravel-like) |
| Hot Reload | Manual refresh | Instant |
| Build Optimization | None | Full |
| File Size | Larger | Minified |
| Development Speed | Slower | Much faster |
| Production Ready | Manual | Automated |
| GitHub Pages | ✅ | ✅ |

## 🎯 Workflow Summary

```
Development:
1. npm run dev
2. Edit files
3. See changes instantly
4. Repeat

Production:
1. npm run build
2. Test with npm run preview
3. Deploy dist/ to GitHub Pages
4. Done!
```

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [GitHub Pages Guide](https://pages.github.com/)
- [EJS Syntax](https://ejs.co/)

## ✨ What's Next?

1. ✅ Start dev server: `npm run dev`
2. ✅ Edit components and see instant updates
3. ✅ Build for production: `npm run build`
4. ✅ Deploy to GitHub Pages
5. ✅ Enjoy your Laravel-like workflow!

Happy coding! 🚀
