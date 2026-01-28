# Transport Invoice Management System

Modern transport invoice management system with Vite build system and component-based architecture.

## 🚀 Quick Start

### Prerequisites
- Node.js 22.x (use `nvm use 22`)
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Opens at `http://localhost:3000` with hot reload

### Build
```bash
npm run build:css    # Build Tailwind CSS
npm run build        # Build with Vite
```

### Preview
```bash
npm run preview
```

## 📝 Template Syntax

Components use EJS-like includes:

```html
<%- include('components/layout/header', { 
    activePage: 'create'
}) %>

<%- include('components/forms/text-input', { 
    id: 'email',
    label: 'Email',
    type: 'email'
}) %>
```

## 📁 Structure

```
├── components/         # Reusable components
├── assets/            # CSS, JS, libraries
├── index.html         # Main pages
├── list-documents.html
├── login.html
├── register.html
├── vite.config.js     # Vite config
└── dist/              # Built files
```

## 🌐 Deployment

### GitHub Pages (Automatic)
Push to main - GitHub Actions auto-deploys

**Setup:** Settings → Pages → Source: GitHub Actions

### Manual
```bash
npm run build
git add dist/ -f
git commit -m "Deploy"
git push
```

**Setup:** Settings → Pages → Branch: main, Folder: /dist

## 🛠️ Scripts

```bash
npm run dev          # Dev server
npm run build        # Build for production
npm run preview      # Preview build
npm run build:css    # Build Tailwind
npm run watch:css    # Watch CSS
npm test             # Run tests
```

## 🎯 Features

- ✅ Component-based templates
- ✅ Hot module replacement
- ✅ Optimized builds
- ✅ GitHub Pages ready
- ✅ Client-side SQLite
- ✅ PDF generation
- ✅ User authentication
- ✅ Responsive design

## 📚 Documentation

- [Vite Setup](docs/VITE-SETUP.md)
- [Vite Complete Guide](docs/VITE-COMPLETE-GUIDE.md)
- [Tailwind Setup](docs/TAILWIND-SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT-GUIDE.md)

## 🔧 Tech Stack

- Vite - Build tool
- Tailwind CSS - Styling
- SQLite (sql.js) - Database
- jsPDF - PDF generation
- html2canvas - HTML to canvas

## 📄 License

MIT
