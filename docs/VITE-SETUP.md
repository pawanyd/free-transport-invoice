# Vite Setup Guide

## Overview

Your project now uses **Vite** for a Laravel Blade-like development experience with static file output for GitHub Pages.

## What is Vite?

Vite is a modern build tool that provides:
- ⚡ Lightning-fast development server
- 🔥 Hot Module Replacement (instant updates)
- 📦 Optimized production builds
- 🎨 Template processing (EJS - similar to Laravel Blade)

## Commands

### Development

```bash
npm run dev
```

- Starts development server at `http://localhost:3000`
- Auto-opens in browser
- Hot reload - changes appear instantly
- EJS templates processed in real-time

### Build for Production

```bash
npm run build
```

- Processes all templates
- Minifies HTML, CSS, JS
- Optimizes assets
- Outputs to `dist/` folder
- Ready for GitHub Pages deployment

### Preview Production Build

```bash
npm run preview
```

- Preview the built site locally
- Test before deploying

## Template Syntax (EJS)

### Including Components

```html
<!-- Include a component -->
<%- include('components/layout/header', { 
    activePage: 'create'
}) %>

<!-- Include with multiple props -->
<%- include('components/forms/text-input', { 
    id: 'email',
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: '*',
    requiredAttr: 'required'
}) %>
```

### Conditional Rendering

```html
<!-- In component -->
<a href="./index.html" class="<%= activePage === 'create' ? 'active' : '' %>">
    Create New
</a>
```

### Variables

```html
<!-- Set in vite.config.js or pass as prop -->
<title><%= pageTitle %></title>
```

## Project Structure

```
project/
├── components/          ← Reusable components
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
├── assets/              ← CSS, JS, images
│   ├── css/
│   ├── js/
│   └── lib/
├── public/              ← Static files (copied as-is)
├── index.html           ← Main pages (with EJS)
├── list-documents.html
├── login.html
├── register.html
├── vite.config.js       ← Vite configuration
└── dist/                ← Built files (for deployment)
    ├── index.html       ← Processed HTML
    ├── list-documents.html
    ├── login.html
    ├── register.html
    └── assets/
```

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

### 2. Edit Files

- Edit any `.html` file
- Changes appear instantly in browser
- No manual refresh needed

### 3. Build for Production

```bash
npm run build
```

### 4. Test Production Build

```bash
npm run preview
```

### 5. Deploy to GitHub Pages

```bash
# Option 1: Deploy dist folder
git add dist/
git commit -m "Build for production"
git push origin main

# Option 2: Use GitHub Actions (recommended)
# See DEPLOYMENT.md for setup
```

## Component Examples

### Creating a New Component

**1. Create component file:**

```html
<!-- components/ui/button.html -->
<button 
    id="<%= id %>" 
    type="<%= type %>" 
    class="<%= classes %> px-6 py-2 rounded font-semibold">
    <%= text %>
</button>
```

**2. Use in page:**

```html
<%- include('components/ui/button', { 
    id: 'submitBtn',
    type: 'submit',
    classes: 'bg-blue-500 hover:bg-blue-600 text-white',
    text: 'Submit Form'
}) %>
```

### Nested Components

```html
<!-- components/ui/card.html -->
<div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold mb-2"><%= title %></h3>
    <p class="text-gray-600 mb-4"><%= description %></p>
    
    <%- include('components/ui/button', { 
        id: 'cardBtn',
        type: 'button',
        classes: 'bg-blue-500 text-white',
        text: buttonText
    }) %>
</div>
```

## Configuration

### vite.config.js

```javascript
import { defineConfig } from 'vite';
import VitePluginEjs from 'vite-plugin-ejs';

export default defineConfig({
  plugins: [
    VitePluginEjs({
      // Global data available in all templates
      include: includeComponent,
      pageTitle: 'My App',
      // Add more global variables here
    }),
  ],
  
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        list: './list-documents.html',
        // Add more pages here
      },
    },
  },
});
```

## GitHub Pages Deployment

### Method 1: Manual Deployment

```bash
# Build
npm run build

# Deploy dist folder
git add dist/ -f
git commit -m "Deploy"
git push origin main
```

**GitHub Pages Settings:**
- Source: Deploy from a branch
- Branch: main
- Folder: /dist

### Method 2: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**GitHub Pages Settings:**
- Source: GitHub Actions

## Troubleshooting

### Issue: Components not loading

**Solution:** Check file paths in `include()` statements. Paths are relative to project root.

```html
<!-- Correct -->
<%- include('components/layout/header') %>

<!-- Wrong -->
<%- include('./components/layout/header') %>
<%- include('/components/layout/header') %>
```

### Issue: Changes not appearing

**Solution:** 
1. Stop dev server (Ctrl+C)
2. Clear cache: `rm -rf node_modules/.vite`
3. Restart: `npm run dev`

### Issue: Build fails

**Solution:**
1. Check for syntax errors in HTML
2. Ensure all included components exist
3. Run: `npm run build -- --debug`

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

## Benefits Over Previous Approach

| Feature | Before | With Vite |
|---------|--------|-----------|
| Template Syntax | JavaScript | EJS (Laravel-like) |
| Hot Reload | Manual refresh | Instant |
| Build Time | N/A | Optimized |
| File Size | Larger | Minified |
| Development Speed | Slower | Much faster |
| Production Ready | Manual | Automated |

## Next Steps

1. ✅ Run `npm run dev` to start development
2. ✅ Edit `index.html` and see instant changes
3. ✅ Create new components in `components/`
4. ✅ Build with `npm run build`
5. ✅ Deploy `dist/` folder to GitHub Pages

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [EJS Documentation](https://ejs.co/)
- [GitHub Pages Guide](https://pages.github.com/)

Happy coding! 🚀
