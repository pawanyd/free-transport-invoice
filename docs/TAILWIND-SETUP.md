# Tailwind CSS Setup

## Overview

This project uses Tailwind CSS v3 for production-ready styling. The CDN version has been replaced with a proper build setup.

## Setup

Tailwind CSS is already installed as a dev dependency. The configuration is in `tailwind.config.js`.

## Development

### Build CSS (One-time)
```bash
npm run build:css
```

This compiles `assets/css/tailwind-input.css` into `assets/css/styles.css` with all Tailwind utilities minified.

### Watch Mode (During Development)
```bash
npm run watch:css
```

This watches for changes and automatically rebuilds the CSS file.

## File Structure

- **`tailwind.config.js`** - Tailwind configuration
- **`assets/css/tailwind-input.css`** - Source file with Tailwind directives and custom styles
- **`assets/css/styles.css`** - Generated output file (committed to repo)

## Before Deployment

Always run `npm run build:css` before deploying to ensure the latest styles are compiled.

## Why Not Use CDN?

The Tailwind CDN:
- ❌ Not recommended for production
- ❌ Larger file size (includes all utilities)
- ❌ Slower performance
- ❌ Shows console warnings

Our setup:
- ✅ Production-ready
- ✅ Minified and optimized
- ✅ Only includes used utilities
- ✅ Better performance
- ✅ No console warnings

## Adding Custom Styles

Add custom CSS to `assets/css/tailwind-input.css` after the `@tailwind` directives, then rebuild.
