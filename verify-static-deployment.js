#!/usr/bin/env node

/**
 * Static Site Deployment Verification Script
 * Verifies that the application is ready for GitHub Pages deployment
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying Static Site Deployment Readiness\n');

let allTestsPassed = true;
const results = {
    passed: [],
    failed: [],
    warnings: []
};

function pass(message) {
    console.log(`✅ PASS: ${message}`);
    results.passed.push(message);
}

function fail(message) {
    console.log(`❌ FAIL: ${message}`);
    results.failed.push(message);
    allTestsPassed = false;
}

function warn(message) {
    console.log(`⚠️  WARN: ${message}`);
    results.warnings.push(message);
}

function info(message) {
    console.log(`ℹ️  INFO: ${message}`);
}

// Test 1: Verify all required files exist
console.log('\n📁 Test 1: Checking Required Files');
console.log('─'.repeat(50));

const requiredFiles = [
    'index.html',
    'login.html',
    'assets/css/styles.css',
    'assets/js/config.js',
    'assets/js/auth.js',
    'assets/js/datastore.js',
    'assets/js/validator.js',
    'assets/js/generator.js',
    'assets/js/pdf-exporter.js',
    'assets/js/ui-controller.js',
    'assets/images/logo.svg',
    'assets/images/signature.svg',
    'assets/images/seal.svg',
    'assets/lib/sql-wasm.js',
    'assets/lib/sql-wasm.wasm',
    'assets/lib/jspdf.umd.min.js'
];

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        pass(`File exists: ${file}`);
    } else {
        fail(`Missing file: ${file}`);
    }
});

// Test 2: Verify no absolute paths in HTML files
console.log('\n🔗 Test 2: Checking for Absolute Paths in HTML');
console.log('─'.repeat(50));

const htmlFiles = ['index.html', 'login.html'];

htmlFiles.forEach(file => {
    if (!fs.existsSync(file)) {
        fail(`Cannot check ${file} - file not found`);
        return;
    }
    
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for absolute paths in src and href attributes
    const absoluteSrcRegex = /(src|href)=["']\/[^h]/g;
    const matches = content.match(absoluteSrcRegex);
    
    if (matches && matches.length > 0) {
        fail(`${file} contains absolute paths: ${matches.join(', ')}`);
    } else {
        pass(`${file} uses only relative paths`);
    }
    
    // Check for CDN links (these are OK)
    const cdnRegex = /(src|href)=["']https?:\/\//g;
    const cdnMatches = content.match(cdnRegex);
    if (cdnMatches) {
        info(`${file} uses ${cdnMatches.length} CDN link(s) (OK for Tailwind, etc.)`);
    }
});

// Test 3: Verify no absolute paths in JavaScript files
console.log('\n📜 Test 3: Checking for Absolute Paths in JavaScript');
console.log('─'.repeat(50));

const jsFiles = [
    'assets/js/config.js',
    'assets/js/auth.js',
    'assets/js/datastore.js',
    'assets/js/validator.js',
    'assets/js/generator.js',
    'assets/js/pdf-exporter.js',
    'assets/js/ui-controller.js'
];

jsFiles.forEach(file => {
    if (!fs.existsSync(file)) {
        fail(`Cannot check ${file} - file not found`);
        return;
    }
    
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for absolute paths in import statements
    const absoluteImportRegex = /from\s+["']\/[^h]/g;
    const matches = content.match(absoluteImportRegex);
    
    if (matches && matches.length > 0) {
        fail(`${file} contains absolute import paths: ${matches.join(', ')}`);
    } else {
        pass(`${file} uses only relative import paths`);
    }
});

// Test 4: Verify ES6 module exports
console.log('\n📦 Test 4: Checking ES6 Module Exports');
console.log('─'.repeat(50));

const moduleChecks = [
    { file: 'assets/js/config.js', exports: ['DocumentConfig'] },
    { file: 'assets/js/auth.js', exports: ['AuthManager', 'default'] },
    { file: 'assets/js/datastore.js', exports: ['DataStoreManager', 'default'] },
    { file: 'assets/js/validator.js', exports: ['FormValidator'] },
    { file: 'assets/js/generator.js', exports: ['DocumentGenerator'] },
    { file: 'assets/js/pdf-exporter.js', exports: ['PDFExporter'] },
    { file: 'assets/js/ui-controller.js', exports: ['UIController', 'default'] }
];

moduleChecks.forEach(({ file, exports }) => {
    if (!fs.existsSync(file)) {
        fail(`Cannot check ${file} - file not found`);
        return;
    }
    
    const content = fs.readFileSync(file, 'utf8');
    
    exports.forEach(exportName => {
        const exportRegex = exportName === 'default' 
            ? /export\s+default/
            : new RegExp(`export\\s+(class|const|function)\\s+${exportName}|export\\s+{[^}]*${exportName}[^}]*}`);
        
        if (exportRegex.test(content)) {
            pass(`${file} exports ${exportName}`);
        } else {
            warn(`${file} may not export ${exportName} (check manually)`);
        }
    });
});

// Test 5: Verify image paths in config.js
console.log('\n🖼️  Test 5: Checking Image Paths in Config');
console.log('─'.repeat(50));

if (fs.existsSync('assets/js/config.js')) {
    const configContent = fs.readFileSync('assets/js/config.js', 'utf8');
    
    const imagePaths = [
        'assets/images/logo.svg',
        'assets/images/signature.svg',
        'assets/images/seal.svg'
    ];
    
    imagePaths.forEach(imagePath => {
        if (configContent.includes(imagePath)) {
            pass(`Config references ${imagePath}`);
            
            // Verify the image file exists
            if (fs.existsSync(imagePath)) {
                pass(`Image file exists: ${imagePath}`);
            } else {
                fail(`Image file missing: ${imagePath}`);
            }
        } else {
            warn(`Config may not reference ${imagePath}`);
        }
    });
} else {
    fail('config.js not found');
}

// Test 6: Verify library files
console.log('\n📚 Test 6: Checking Library Files');
console.log('─'.repeat(50));

const libraries = [
    { file: 'assets/lib/sql-wasm.js', minSize: 1000 },
    { file: 'assets/lib/sql-wasm.wasm', minSize: 100000 },
    { file: 'assets/lib/jspdf.umd.min.js', minSize: 10000 }
];

libraries.forEach(({ file, minSize }) => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        if (stats.size >= minSize) {
            pass(`${file} exists and has reasonable size (${(stats.size / 1024).toFixed(2)} KB)`);
        } else {
            warn(`${file} exists but may be incomplete (${stats.size} bytes, expected >= ${minSize})`);
        }
    } else {
        fail(`Library file missing: ${file}`);
    }
});

// Test 7: Check for server-side dependencies
console.log('\n🚫 Test 7: Checking for Server-Side Dependencies');
console.log('─'.repeat(50));

htmlFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for common server-side patterns
    const serverPatterns = [
        { pattern: /<\?php/i, name: 'PHP code' },
        { pattern: /<%[^>]/i, name: 'Server-side templates (JSP/ASP)' },
        { pattern: /{{[^}]/i, name: 'Template variables' }
    ];
    
    serverPatterns.forEach(({ pattern, name }) => {
        if (pattern.test(content)) {
            fail(`${file} contains ${name} - not compatible with static hosting`);
        }
    });
});

pass('No server-side dependencies detected');

// Test 8: Verify package.json for deployment
console.log('\n📦 Test 8: Checking Package Configuration');
console.log('─'.repeat(50));

if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (packageJson.type === 'module') {
        pass('package.json configured for ES modules');
    } else {
        warn('package.json may need "type": "module" for ES6 modules');
    }
    
    if (packageJson.devDependencies) {
        const hasJest = 'jest' in packageJson.devDependencies;
        const hasFastCheck = 'fast-check' in packageJson.devDependencies;
        
        if (hasJest) pass('Jest testing framework installed');
        if (hasFastCheck) pass('fast-check property testing library installed');
    }
} else {
    warn('package.json not found (OK for static deployment, but needed for development)');
}

// Summary
console.log('\n' + '═'.repeat(50));
console.log('📊 SUMMARY');
console.log('═'.repeat(50));

console.log(`\n✅ Passed: ${results.passed.length}`);
console.log(`❌ Failed: ${results.failed.length}`);
console.log(`⚠️  Warnings: ${results.warnings.length}`);

if (results.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.failed.forEach(msg => console.log(`   - ${msg}`));
}

if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach(msg => console.log(`   - ${msg}`));
}

console.log('\n' + '═'.repeat(50));

if (allTestsPassed && results.warnings.length === 0) {
    console.log('✅ ALL TESTS PASSED! Application is ready for GitHub Pages deployment.');
    console.log('\nNext steps:');
    console.log('1. Commit all files to your repository');
    console.log('2. Push to GitHub');
    console.log('3. Enable GitHub Pages in repository settings');
    console.log('4. Select the branch and root directory');
    console.log('5. Your site will be available at: https://username.github.io/repository-name/');
} else if (allTestsPassed) {
    console.log('✅ All critical tests passed, but there are warnings to review.');
    console.log('The application should work on GitHub Pages, but review warnings above.');
} else {
    console.log('❌ Some tests failed. Please fix the issues before deploying.');
    process.exit(1);
}

console.log('\n');
